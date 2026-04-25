import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKeyDto } from './dto/create-key.dto';
import { UpdateKeyDto } from './dto/update-key.dto';
import { KeyStatus, KeyEventType, DepositCodeStatus } from '@prisma/client';

/**
 * Genera un código alfanumérico único de 8 caracteres en mayúsculas.
 * Formato: XXXX-XXXX (legible para el usuario).
 */
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin 0, O, I, 1 para evitar confusión
  const part = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${part(4)}-${part(4)}`;
}

@Injectable()
export class KeysService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear una nueva llave.
   * Genera automáticamente:
   *  - Código de depósito único
   *  - Registro en key_history (event: CREATED)
   *  - Registro en key_history (event: DEPOSIT_CODE_GENERATED)
   */
  async create(createKeyDto: CreateKeyDto, ownerId: string) {
    // Validar que el store existe y está activo
    const store = await this.prisma.store.findUnique({
      where: { id: createKeyDto.store_id },
    });
    if (!store || !store.status) {
      throw new NotFoundException('El punto aliado seleccionado no existe o no está activo.');
    }

    // Crear llave + código de depósito en una sola transacción atómica
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Crear la llave
      const key = await tx.key.create({
        data: {
          owner_user_id: ownerId,
          store_id: createKeyDto.store_id,
          key_name: createKeyDto.key_name,
          plan_type: createKeyDto.plan_type ?? 'MONTHLY',
          key_photo_url: createKeyDto.key_photo_url,
          key_status: KeyStatus.WAITING_DEPOSIT,
        },
      });

      // 2. Generar código de depósito único
      let codeValue: string;
      let attempts = 0;
      do {
        codeValue = generateCode();
        attempts++;
        if (attempts > 20) throw new BadRequestException('Error generando código único. Intenta de nuevo.');
        const existing = await tx.depositCode.findUnique({ where: { code_value: codeValue } });
        if (!existing) break;
      } while (true);

      const depositCode = await tx.depositCode.create({
        data: {
          key_id: key.id,
          code_value: codeValue,
          status: DepositCodeStatus.ACTIVE,
        },
      });

      // 3. Registrar en historial: llave creada
      await tx.keyHistory.create({
        data: {
          key_id: key.id,
          event_type: KeyEventType.CREATED,
          new_value: KeyStatus.WAITING_DEPOSIT,
          notes: `Llave "${key.key_name}" creada. Plan: ${key.plan_type}. Punto aliado: ${store.store_name}`,
        },
      });

      // 4. Registrar en historial: código de depósito generado
      await tx.keyHistory.create({
        data: {
          key_id: key.id,
          event_type: KeyEventType.DEPOSIT_CODE_GENERATED,
          new_value: depositCode.code_value,
          notes: 'Código de depósito inicial generado automáticamente al crear la llave.',
        },
      });

      return { key, depositCode, store };
    });

    return {
      key: result.key,
      deposit_code: result.depositCode.code_value,
      store: {
        id: result.store.id,
        store_name: result.store.store_name,
        address: result.store.address,
        city: result.store.city,
        opening_hours: result.store.opening_hours,
        google_maps_link: result.store.google_maps_link,
        instructions: result.store.instructions,
        whatsapp: result.store.whatsapp,
        main_phone: result.store.main_phone,
      },
      message: `Llave creada exitosamente. Código de depósito: ${result.depositCode.code_value}`,
    };
  }

  /**
   * Obtener todas las llaves de un propietario específico
   */
  async findAllByOwner(ownerId: string) {
    return this.prisma.key.findMany({
      where: {
        owner_user_id: ownerId,
        key_status: { not: KeyStatus.DELETED },
      },
      include: {
        store: {
          select: {
            id: true,
            store_name: true,
            address: true,
            city: true,
            opening_hours: true,
            whatsapp: true,
            google_maps_link: true,
          },
        },
        deposit_codes: {
          where: { status: DepositCodeStatus.ACTIVE },
          select: { id: true, code_value: true, status: true, created_at: true },
          take: 1,
        },
        key_tags: {
          where: { status: 'ACTIVE' },
          select: { id: true, tag_uid: true, tag_type: true, assigned_at: true },
          take: 1,
        },
        pickup_codes: {
          where: { status: 'ACTIVE' },
          select: { id: true, code_value: true, code_mode: true, label_name: true, active_from: true, status: true },
        },
        _count: {
          select: { key_movements: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Obtener una llave específica (valida que el owner sea el dueño)
   */
  async findOne(id: string, ownerId: string) {
    const key = await this.prisma.key.findUnique({
      where: { id },
      include: {
        store: true,
        deposit_codes: {
          where: { status: DepositCodeStatus.ACTIVE },
          take: 1,
        },
        key_tags: {
          where: { status: 'ACTIVE' },
          take: 1,
        },
        pickup_codes: {
          where: { status: 'ACTIVE' },
          orderBy: { created_at: 'desc' },
        },
        key_history: {
          orderBy: { created_at: 'desc' },
          take: 20,
        },
        _count: {
          select: { key_movements: true },
        },
      },
    });

    if (!key) throw new NotFoundException('Llave no encontrada.');
    if (key.owner_user_id !== ownerId) throw new ForbiddenException('No tienes permiso para ver esta llave.');

    return key;
  }

  /**
   * Actualizar datos básicos de una llave (nombre, foto)
   */
  async update(id: string, updateKeyDto: UpdateKeyDto, ownerId: string) {
    const key = await this.findOne(id, ownerId);

    // No se puede editar una llave eliminada
    if (key.key_status === KeyStatus.DELETED) {
      throw new BadRequestException('No se puede modificar una llave eliminada.');
    }

    return this.prisma.key.update({
      where: { id },
      data: {
        key_name: updateKeyDto.key_name,
        key_photo_url: updateKeyDto.key_photo_url,
      },
    });
  }

  /**
   * Eliminar llave (borrado lógico — estado DELETED)
   * El historial se conserva siempre.
   */
  async remove(id: string, ownerId: string) {
    const key = await this.findOne(id, ownerId);

    if (key.key_status === KeyStatus.DELETED) {
      throw new BadRequestException('Esta llave ya está eliminada.');
    }

    const previousStatus = key.key_status;

    await this.prisma.$transaction(async (tx) => {
      await tx.key.update({
        where: { id },
        data: {
          key_status: KeyStatus.DELETED,
          deleted_at: new Date(),
        },
      });

      // Cancelar todos los códigos de recogida activos
      await tx.pickupCode.updateMany({
        where: { key_id: id, status: 'ACTIVE' },
        data: { status: 'CANCELLED', cancelled_at: new Date() },
      });

      // Registrar en historial
      await tx.keyHistory.create({
        data: {
          key_id: id,
          event_type: KeyEventType.DELETED,
          old_value: previousStatus,
          new_value: KeyStatus.DELETED,
          notes: 'Llave eliminada por el propietario. Historial conservado.',
        },
      });
    });

    return { message: 'Llave eliminada exitosamente. El historial permanece disponible.' };
  }

  /**
   * Obtener el historial de movimientos de una llave
   */
  async getHistory(id: string, ownerId: string) {
    await this.findOne(id, ownerId); // Valida permisos

    const [history, movements] = await Promise.all([
      this.prisma.keyHistory.findMany({
        where: { key_id: id },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.keyMovement.findMany({
        where: { key_id: id },
        include: {
          store: { select: { store_name: true, address: true } },
        },
        orderBy: { movement_datetime: 'desc' },
      }),
    ]);

    return { history, movements };
  }
}
