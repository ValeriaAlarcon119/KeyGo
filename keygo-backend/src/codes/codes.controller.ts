import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CodesService } from './codes.service';
import { CreatePickupCodeDto } from './dto/create-pickup-code.dto';
import { ValidateCodeDto } from './dto/validate-code.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('🎟️ Códigos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('codes')
export class CodesController {
  constructor(private readonly codesService: CodesService) {}

  // ── PICKUP CODES (Owner) ───────────────────────────────────────────

  @Post('pickup')
  @ApiOperation({
    summary: 'Generar código de recogida',
    description:
      'Genera un código de recogida para una llave depositada. Retorna el código y el mensaje listo para compartir por WhatsApp o correo. La llave debe estar en estado DEPOSITED.',
  })
  @ApiResponse({ status: 201, description: '✅ Código de recogida generado con mensaje para compartir.' })
  @ApiResponse({ status: 400, description: '❌ La llave no está depositada o límite de reutilizables alcanzado.' })
  createPickupCode(@Body() dto: CreatePickupCodeDto, @Request() req: any) {
    return this.codesService.createPickupCode(dto, req.user.id);
  }

  @Get('pickup/key/:keyId')
  @ApiOperation({
    summary: 'Códigos de recogida de una llave',
    description: 'Retorna todos los códigos de recogida de una llave (activos, usados y cancelados).',
  })
  @ApiParam({ name: 'keyId', description: 'UUID de la llave' })
  @ApiResponse({ status: 200, description: '✅ Lista de códigos de recogida.' })
  findPickupCodesByKey(@Param('keyId') keyId: string, @Request() req: any) {
    return this.codesService.findPickupCodesByKey(keyId, req.user.id);
  }

  @Delete('pickup/:codeId')
  @ApiOperation({
    summary: 'Cancelar código de recogida',
    description: 'Invalida un código de recogida activo. El código deja de funcionar inmediatamente.',
  })
  @ApiParam({ name: 'codeId', description: 'UUID del código de recogida' })
  @ApiResponse({ status: 200, description: '✅ Código cancelado.' })
  cancelPickupCode(@Param('codeId') codeId: string, @Request() req: any) {
    return this.codesService.cancelPickupCode(codeId, req.user.id);
  }

  // ── VALIDACIÓN EN TIENDA (Store) ───────────────────────────────────

  @Post('validate/deposit')
  @ApiOperation({
    summary: 'Validar código de depósito (tienda)',
    description:
      'Usado por el personal de la tienda para validar el código de depósito presentado por el cliente. Retorna los datos de la llave para proceder con el escaneo NFC.',
  })
  @ApiResponse({ status: 201, description: '✅ Resultado de validación del código de depósito.' })
  validateDepositCode(@Body() dto: ValidateCodeDto, @Request() req: any) {
    return this.codesService.validateDepositCode(dto, req.user.id);
  }

  @Post('validate/pickup')
  @ApiOperation({
    summary: 'Validar código de recogida (tienda)',
    description:
      'Usado por el personal de la tienda para validar el código de recogida. Verifica estado, horario de activación y disponibilidad de la llave. Retorna los datos de la llave si el código es válido.',
  })
  @ApiResponse({ status: 201, description: '✅ Resultado de validación del código de recogida.' })
  validatePickupCode(@Body() dto: ValidateCodeDto, @Request() req: any) {
    return this.codesService.validatePickupCode(dto, req.user.id);
  }
}
