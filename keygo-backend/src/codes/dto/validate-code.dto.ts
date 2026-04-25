import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateCodeDto {
  @ApiProperty({ example: 'ABCD-1234', description: 'Código a validar (depósito o recogida)' })
  @IsString()
  @IsNotEmpty()
  code_value: string;
}
