import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear un nuevo punto aliado
   */
  async create(createStoreDto: CreateStoreDto) {
    return this.prisma.store.create({
      data: createStoreDto,
    });
  }

  /**
   * Obtener todos los puntos aliados activos
   */
  async findAll() {
    return this.prisma.store.findMany({
      where: { status: true },
      orderBy: { store_name: 'asc' },
      select: {
        id: true,
        store_name: true,
        address: true,
        city: true,
        main_phone: true,
        whatsapp: true,
        email: true,
        opening_hours: true,
        google_maps_link: true,
        instructions: true,
        status: true,
        created_at: true,
        _count: {
          select: { keys: true },
        },
      },
    });
  }

  /**
   * Obtener un punto aliado por ID
   */
  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            keys: true,
            key_movements: true,
          },
        },
      },
    });
    if (!store) {
      throw new NotFoundException(`Punto aliado con ID ${id} no encontrado.`);
    }
    return store;
  }

  /**
   * Actualizar datos de un punto aliado
   */
  async update(id: string, updateStoreDto: UpdateStoreDto) {
    await this.findOne(id); // Verifica que existe
    return this.prisma.store.update({
      where: { id },
      data: updateStoreDto,
    });
  }

  /**
   * Desactivar un punto aliado (borrado lógico)
   */
  async remove(id: string) {
    await this.findOne(id); // Verifica que existe
    return this.prisma.store.update({
      where: { id },
      data: { status: false },
    });
  }
}
