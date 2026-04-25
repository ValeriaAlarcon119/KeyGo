import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStoreDto {
  @ApiProperty({ example: 'Tienda La Esquina', description: 'Nombre del punto aliado' })
  @IsString()
  @IsNotEmpty()
  store_name: string;

  @ApiProperty({ example: 'Cl. 10 #45-12, Barrio Centro', description: 'Dirección física del punto' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Bogotá', description: 'Ciudad donde opera el punto' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: '3001234567', description: 'Teléfono principal de la tienda' })
  @IsString()
  @IsNotEmpty()
  main_phone: string;

  @ApiPropertyOptional({ example: '3007654321', description: 'Teléfono del propietario de la tienda' })
  @IsString()
  @IsOptional()
  owner_phone?: string;

  @ApiPropertyOptional({ example: '3001234567', description: 'Número de WhatsApp para contacto' })
  @IsString()
  @IsOptional()
  whatsapp?: string;

  @ApiPropertyOptional({ example: 'tienda@ejemplo.com', description: 'Correo electrónico de contacto' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Lun-Sab 8am-8pm, Dom 9am-5pm', description: 'Horario de atención' })
  @IsString()
  @IsOptional()
  opening_hours?: string;

  @ApiPropertyOptional({ example: 'https://maps.google.com/?q=...', description: 'Enlace a Google Maps' })
  @IsString()
  @IsOptional()
  google_maps_link?: string;

  @ApiPropertyOptional({ example: 'Pregunta por María en la caja', description: 'Instrucciones adicionales para llegar' })
  @IsString()
  @IsOptional()
  instructions?: string;
}
