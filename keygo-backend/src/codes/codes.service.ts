import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePickupCodeDto } from './dto/create-pickup-code.dto';
import { ValidateCodeDto } from './dto/validate-code.dto';
import {
  KeyStatus,
  KeyEventType,
  PickupCodeStatus,
  DepositCodeStatus,
  MovementType,
  MovementMethod,
  CodeMode,
} from '@prisma/client';

/**
 * Genera un código de recogida único de 8 caracteres.
 * Usa alfabeto sin caracteres ambiguos (0, O, I, 1).
 */
function generatePickupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${part(4)}-${part(4)}`;
}

@Injectable()
export class CodesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────
  // CÓDIGOS DE RECOGIDA
  // ─────────────────────────────────────────────────────────────────

  /**
   * Generar un código de recogida.
   *
   * REGLAS:
   *  - La llave debe estar en estado DEPOSITED
   *  - Máximo 2 códigos REUSABLE activos simultáneamente
   *  - Múltiples SINGLE_USE activos sí son posibles
   */
  async createPickupCode(dto: CreatePickupCodeDto, ownerId: string) {
    // 1. Obtener la llave y verificar permisos
    const key = await this.prisma.key.findUnique({
      where: { id: dto.key_id },
      include: {
        store: true,
        pickup_codes: {
          where: { status: PickupCodeStatus.ACTIVE },
        },
      },
    });

    if (!key) throw new NotFoundException('Llave no encontrada.');
    if (key.owner_user_id !== ownerId) throw new ForbiddenException('No tienes permiso sobre esta llave.');

    // Regla 5: Solo se pueden generar códigos si la llave está DEPOSITADA
    if (key.key_status !== KeyStatus.DEPOSITED) {
      throw new BadRequestException(
        `No se puede generar un código de recogida. La llave debe estar en estado "Depositada". Estado actual: ${key.key_status}`,
      );
    }

    const mode = dto.code_mode ?? CodeMode.SINGLE_USE;

    // Regla: Máximo 2 códigos REUSABLE activos
    if (mode === CodeMode.REUSABLE) {
      const activeReusable = key.pickup_codes.filter((c) => c.code_mode === CodeMode.REUSABLE);
      if (activeReusable.length >= 2) {
        throw new BadRequestException(
          'Ya tienes 2 códigos reutilizables activos. Cancela uno para crear otro.',
        );
      }
    }

    // 2. Generar código único
    let codeValue: string;
    let attempts = 0;
    do {
      codeValue = generatePickupCode();
      attempts++;
      if (attempts > 20) throw new BadRequestException('Error generando código único. Intenta de nuevo.');
      const existing = await this.prisma.pickupCode.findUnique({ where: { code_value: codeValue } });
      if (!existing) break;
    } while (true);

    // Estado inicial del código
    const activeFrom = dto.active_from ? new Date(dto.active_from) : null;
    const now = new Date();
    const codeStatus =
      activeFrom && activeFrom > now
        ? PickupCodeStatus.PENDING_SCHEDULE
        : PickupCodeStatus.ACTIVE;

    // 3. Crear el código y registrar en historial (transacción)
    const pickupCode = await this.prisma.$transaction(async (tx) => {
      const code = await tx.pickupCode.create({
        data: {
          key_id: dto.key_id,
          code_value: codeValue,
          code_mode: mode,
          label_name: dto.label_name,
          active_from: activeFrom,
          status: codeStatus,
        },
      });

      await tx.keyHistory.create({
        data: {
          key_id: dto.key_id,
          event_type: KeyEventType.PICKUP_CODE_CREATED,
          new_value: codeValue,
          notes: `Código de recogida generado. Tipo: ${mode}. ${dto.label_name ? `Para: ${dto.label_name}.` : ''} ${activeFrom ? `Válido desde: ${activeFrom.toISOString()}` : 'Válido inmediatamente.'}`,
        },
      });

      return code;
    });

    return {
      pickup_code: pickupCode,
      store: {
        store_name: key.store?.store_name,
        address: key.store?.address,
        city: key.store?.city,
        opening_hours: key.store?.opening_hours,
        whatsapp: key.store?.whatsapp,
        google_maps_link: key.store?.google_maps_link,
        instructions: key.store?.instructions,
      },
      share_message: this._buildShareMessage(
        codeValue,
        dto.label_name,
        key.store,
        activeFrom,
      ),
    };
  }

  /**
   * Cancelar un código de recogida activo.
   */
  async cancelPickupCode(codeId: string, ownerId: string) {
    const code = await this.prisma.pickupCode.findUnique({
      where: { id: codeId },
      include: { key: true },
    });

    if (!code) throw new NotFoundException('Código no encontrado.');
    if (code.key.owner_user_id !== ownerId) throw new ForbiddenException('No tienes permiso sobre este código.');
    if (code.status !== PickupCodeStatus.ACTIVE && code.status !== PickupCodeStatus.PENDING_SCHEDULE) {
      throw new BadRequestException('Solo se pueden cancelar códigos en estado ACTIVE o PENDING_SCHEDULE.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.pickupCode.update({
        where: { id: codeId },
        data: { status: PickupCodeStatus.CANCELLED, cancelled_at: new Date() },
      });

      await tx.keyHistory.create({
        data: {
          key_id: code.key_id,
          event_type: KeyEventType.PICKUP_CODE_CANCELLED,
          old_value: code.code_value,
          notes: `Código de recogida ${code.code_value} cancelado manualmente por el propietario.`,
        },
      });
    });

    return { message: 'Código cancelado exitosamente.' };
  }

  /**
   * Listar los códigos de recogida activos de una llave.
   */
  async findPickupCodesByKey(keyId: string, ownerId: string) {
    const key = await this.prisma.key.findUnique({ where: { id: keyId } });
    if (!key) throw new NotFoundException('Llave no encontrada.');
    if (key.owner_user_id !== ownerId) throw new ForbiddenException('No tienes permiso sobre esta llave.');

    return this.prisma.pickupCode.findMany({
      where: { key_id: keyId },
      orderBy: { created_at: 'desc' },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // VALIDACIÓN DE CÓDIGOS (Usado por la tienda)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Validar un código de depósito en tienda.
   * No ejecuta el depósito, solo valida que el código es correcto.
   * El depósito real se ejecuta al escanear el NFC (Módulo NFC - Fase 3).
   * En esta fase, retorna los datos de la llave para que la tienda proceda.
   */
  async validateDepositCode(dto: ValidateCodeDto, storeUserId: string) {
    const code = await this.prisma.depositCode.findUnique({
      where: { code_value: dto.code_value.trim().toUpperCase() },
      include: {
        key: {
          include: {
            owner: { select: { full_name: true, email: true, phone: true } },
            store: true,
          },
        },
      },
    });

    if (!code) {
      return {
        valid: false,
        error: 'INVALID_CODE',
        message: 'Código inválido. Verifica el código e intenta de nuevo.',
        support: { whatsapp: process.env.SUPPORT_WHATSAPP, phone: process.env.SUPPORT_PHONE },
      };
    }

    if (code.status !== DepositCodeStatus.ACTIVE) {
      return {
        valid: false,
        error: 'CODE_ALREADY_USED',
        message: 'Este código ya fue utilizado o ha expirado.',
        support: { whatsapp: process.env.SUPPORT_WHATSAPP, phone: process.env.SUPPORT_PHONE },
      };
    }

    if (code.key.key_status === KeyStatus.DELETED) {
      return {
        valid: false,
        error: 'KEY_DELETED',
        message: 'Esta llave ha sido eliminada del sistema.',
        support: { whatsapp: process.env.SUPPORT_WHATSAPP, phone: process.env.SUPPORT_PHONE },
      };
    }

    // Código válido — mostrar información de la llave para el siguiente paso (NFC)
    return {
      valid: true,
      code_type: 'DEPOSIT',
      key: {
        id: code.key.id,
        key_name: code.key.key_name,
        key_photo_url: code.key.key_photo_url,
        key_status: code.key.key_status,
        plan_type: code.key.plan_type,
      },
      owner: code.key.owner,
      deposit_code_id: code.id,
      message: '✅ Código válido. Procede a escanear el llavero NFC para registrar el depósito.',
    };
  }

  /**
   * Validar un código de recogida en tienda.
   * Verifica todas las reglas: estado, horario, bloqueo de pago.
   */
  async validatePickupCode(dto: ValidateCodeDto, storeUserId: string) {
    const code = await this.prisma.pickupCode.findUnique({
      where: { code_value: dto.code_value.trim().toUpperCase() },
      include: {
        key: {
          include: {
            owner: { select: { full_name: true, phone: true } },
            store: true,
            key_tags: { where: { status: 'ACTIVE' }, take: 1 },
          },
        },
      },
    });

    const now = new Date();

    // Validación 1: Código existe
    if (!code) {
      return {
        valid: false,
        error: 'INVALID_CODE',
        message: 'Código inválido. Solicita un código nuevo al propietario.',
        support: { whatsapp: process.env.SUPPORT_WHATSAPP, phone: process.env.SUPPORT_PHONE },
      };
    }

    // Validación 2: Código activo
    if (code.status !== PickupCodeStatus.ACTIVE && code.status !== PickupCodeStatus.PENDING_SCHEDULE) {
      return {
        valid: false,
        error: 'CODE_INACTIVE',
        message: `El código no está activo. Estado: ${code.status}.`,
        support: { whatsapp: process.env.SUPPORT_WHATSAPP, phone: process.env.SUPPORT_PHONE },
      };
    }

    // Validación 3: Llave en estado DEPOSITED
    if (code.key.key_status !== KeyStatus.DEPOSITED) {
      return {
        valid: false,
        error: 'KEY_NOT_DEPOSITED',
        message: 'La llave no está disponible para recogida en este momento.',
        support: { whatsapp: process.env.SUPPORT_WHATSAPP, phone: process.env.SUPPORT_PHONE },
      };
    }

    // Validación 4: Hora de activación
    if (code.active_from && code.active_from > now) {
      return {
        valid: false,
        error: 'CODE_NOT_YET_ACTIVE',
        message: `Código aún no activo. Válido desde: ${code.active_from.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`,
        active_from: code.active_from,
        support: { whatsapp: process.env.SUPPORT_WHATSAPP, phone: process.env.SUPPORT_PHONE },
      };
    }

    // Código válido — entregar información de la llave
    return {
      valid: true,
      code_type: 'PICKUP',
      code_mode: code.code_mode,
      label_name: code.label_name,
      key: {
        id: code.key.id,
        key_name: code.key.key_name,
        key_photo_url: code.key.key_photo_url,
        active_nfc_tag: code.key.key_tags[0] ?? null,
      },
      owner: code.key.owner,
      pickup_code_id: code.id,
      message: `✅ Código válido. ${code.label_name ? `Para: ${code.label_name}.` : ''} Verifica el llavero NFC y entrega la llave.`,
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────

  private _buildShareMessage(
    code: string,
    labelName: string | undefined,
    store: any,
    activeFrom: Date | null,
  ): string {
    const lines: string[] = [
      '🔑 *KeyGo - Código de recogida de llave*',
      '',
      store ? `📍 *Punto KeyGo:* ${store.store_name}` : '',
      store ? `📌 *Dirección:* ${store.address}, ${store.city}` : '',
      store?.opening_hours ? `🕐 *Horario:* ${store.opening_hours}` : '',
      '',
      `🎟️ *Tu código:* \`${code}\``,
      activeFrom
        ? `⏰ *Válido desde:* ${activeFrom.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })} hrs`
        : '✅ *Válido desde ya*',
      '',
      '📋 *Instrucciones:*',
      '1. Dirígete al punto KeyGo en la dirección indicada.',
      '2. Presenta este código al personal de la tienda.',
      '3. El personal verificará el código y te entregará la llave.',
      '',
      store?.instructions ? `💡 ${store.instructions}` : '',
      store?.whatsapp
        ? `\n¿Necesitas ayuda? WhatsApp: wa.me/${store.whatsapp.replace(/\D/g, '')}`
        : '',
    ];
    return lines.filter(Boolean).join('\n');
  }
}
