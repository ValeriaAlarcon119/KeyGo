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
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('🏪 Puntos Aliados')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear punto aliado',
    description: 'Registra una nueva tienda o punto aliado en el sistema KeyGo. Solo accesible para administradores.',
  })
  @ApiResponse({ status: 201, description: '✅ Punto aliado creado exitosamente.' })
  @ApiResponse({ status: 401, description: '❌ No autorizado.' })
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar puntos aliados',
    description: 'Retorna todos los puntos aliados activos. Usado por el owner para seleccionar dónde depositar su llave.',
  })
  @ApiResponse({ status: 200, description: '✅ Lista de puntos aliados.' })
  findAll() {
    return this.storesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Ver detalle de punto aliado',
    description: 'Retorna los datos completos de un punto aliado específico, incluyendo conteo de llaves y movimientos.',
  })
  @ApiParam({ name: 'id', description: 'UUID del punto aliado' })
  @ApiResponse({ status: 200, description: '✅ Datos del punto aliado.' })
  @ApiResponse({ status: 404, description: '❌ Punto aliado no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar punto aliado',
    description: 'Actualiza parcialmente los datos de un punto aliado existente.',
  })
  @ApiParam({ name: 'id', description: 'UUID del punto aliado' })
  @ApiResponse({ status: 200, description: '✅ Punto aliado actualizado.' })
  @ApiResponse({ status: 404, description: '❌ Punto aliado no encontrado.' })
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storesService.update(id, updateStoreDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Desactivar punto aliado',
    description: 'Desactiva el punto aliado (borrado lógico). El historial se conserva.',
  })
  @ApiParam({ name: 'id', description: 'UUID del punto aliado' })
  @ApiResponse({ status: 200, description: '✅ Punto aliado desactivado.' })
  @ApiResponse({ status: 404, description: '❌ Punto aliado no encontrado.' })
  remove(@Param('id') id: string) {
    return this.storesService.remove(id);
  }
}
