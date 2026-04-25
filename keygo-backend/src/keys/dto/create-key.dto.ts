import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanType } from '@prisma/client';

export class CreateKeyDto {
  @ApiProperty({ example: 'Llave Apartamento 301', description: 'Nombre descriptivo de la llave' })
  @IsString()
  @IsNotEmpty()
  key_name: string;

  @ApiProperty({ example: 'uuid-del-store', description: 'UUID del punto aliado donde se depositará la llave' })
  @IsUUID()
  @IsNotEmpty()
  store_id: string;

  @ApiPropertyOptional({ enum: PlanType, example: 'MONTHLY', description: 'Plan seleccionado: MONTHLY o PAY_PER_USE' })
  @IsEnum(PlanType)
  @IsOptional()
  plan_type?: PlanType;

  @ApiPropertyOptional({ example: 'https://storage.keygo.co/keys/foto.jpg', description: 'URL de la fotografía de la llave' })
  @IsString()
  @IsOptional()
  key_photo_url?: string;
}
