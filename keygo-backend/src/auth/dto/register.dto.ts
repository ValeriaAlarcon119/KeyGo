import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'Valeria Martínez' })
  @IsString()
  full_name: string;

  @ApiProperty({ example: 'valeria@keygo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: Role, required: false, default: Role.OWNER })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
