import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
import { KeysService } from './keys.service';
import { CreateKeyDto } from './dto/create-key.dto';
import { UpdateKeyDto } from './dto/update-key.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('🔑 Llaves')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('keys')
export class KeysController {
  constructor(private readonly keysService: KeysService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear nueva llave',
    description:
      'Crea una llave y genera automáticamente un código de depósito único. Retorna la llave, el código y los datos del punto aliado para que el propietario pueda ir a depositar.',
  })
  @ApiResponse({ status: 201, description: '✅ Llave creada con código de depósito generado.' })
  @ApiResponse({ status: 404, description: '❌ Punto aliado no encontrado.' })
  create(@Body() createKeyDto: CreateKeyDto, @Request() req: any) {
    return this.keysService.create(createKeyDto, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Mis llaves',
    description: 'Retorna todas las llaves activas del propietario autenticado, con su estado, código de depósito activo y NFC asignado.',
  })
  @ApiResponse({ status: 200, description: '✅ Lista de llaves del propietario.' })
  findAll(@Request() req: any) {
    return this.keysService.findAllByOwner(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Ver detalle de una llave',
    description: 'Retorna todos los datos de una llave: estado, código de depósito, NFC, códigos de recogida activos e historial.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la llave' })
  @ApiResponse({ status: 200, description: '✅ Datos completos de la llave.' })
  @ApiResponse({ status: 404, description: '❌ Llave no encontrada.' })
  @ApiResponse({ status: 403, description: '❌ No tienes permiso sobre esta llave.' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.keysService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar llave',
    description: 'Permite actualizar el nombre o la foto de la llave. Solo posible si no está eliminada.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la llave' })
  @ApiResponse({ status: 200, description: '✅ Llave actualizada.' })
  update(@Param('id') id: string, @Body() updateKeyDto: UpdateKeyDto, @Request() req: any) {
    return this.keysService.update(id, updateKeyDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar llave',
    description: 'Borrado lógico: cambia el estado a DELETED. El historial permanece disponible. Cancela todos los códigos activos.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la llave' })
  @ApiResponse({ status: 200, description: '✅ Llave eliminada. Historial conservado.' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.keysService.remove(id, req.user.id);
  }

  @Get(':id/history')
  @ApiOperation({
    summary: 'Historial de la llave',
    description: 'Retorna el historial completo de eventos y movimientos operativos de una llave.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la llave' })
  @ApiResponse({ status: 200, description: '✅ Historial de la llave.' })
  getHistory(@Param('id') id: string, @Request() req: any) {
    return this.keysService.getHistory(id, req.user.id);
  }
}
