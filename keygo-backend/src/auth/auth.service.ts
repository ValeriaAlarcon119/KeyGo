import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Primera línea de defensa: verificar existencia antes de insertar
    const existingUser = await this.usersService.findByEmail(registerDto.email.toLowerCase().trim());
    if (existingUser) {
      throw new ConflictException('El correo ya está registrado. Usa otro o inicia sesión.');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    try {
      const user = await this.usersService.create({
        full_name: registerDto.full_name,
        email: registerDto.email.toLowerCase().trim(),
        password_hash: hashedPassword,
        role: registerDto.role,
      });

      const { password_hash, ...result } = user;
      return result;
    } catch (error) {
      // Segunda línea de defensa: captura el error único de Prisma (P2002 = unique constraint violation)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('El correo ya está registrado. Usa otro o inicia sesión.');
      }
      throw new InternalServerErrorException('Error al crear el usuario. Intenta de nuevo.');
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email.toLowerCase().trim());
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    if (!user.status) {
      throw new UnauthorizedException('Tu cuenta está desactivada. Contacta a soporte.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
