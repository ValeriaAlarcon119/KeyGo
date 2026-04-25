import { PartialType } from '@nestjs/swagger';
import { CreateStoreDto } from './create-store.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStoreDto extends PartialType(CreateStoreDto) {
  @ApiPropertyOptional({ example: true, description: 'Estado activo/inactivo del punto aliado' })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
