import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CodeMode } from '@prisma/client';

export class CreatePickupCodeDto {
  @ApiProperty({ example: 'uuid-de-la-llave', description: 'UUID de la llave para la que se genera el código' })
  @IsUUID()
  key_id: string;

  @ApiPropertyOptional({ enum: CodeMode, example: 'SINGLE_USE', description: 'Tipo: SINGLE_USE (solo una vez) o REUSABLE (múltiples veces, máx. 2 activos)' })
  @IsEnum(CodeMode)
  @IsOptional()
  code_mode?: CodeMode;

  @ApiPropertyOptional({ example: 'María García', description: 'Nombre o etiqueta de la persona que recogerá la llave' })
  @IsString()
  @IsOptional()
  label_name?: string;

  @ApiPropertyOptional({ example: '2026-04-22T15:00:00.000Z', description: 'Hora a partir de la cual el código es válido (ISO 8601). Si no se indica, es válido de inmediato.' })
  @IsDateString()
  @IsOptional()
  active_from?: string;
}
