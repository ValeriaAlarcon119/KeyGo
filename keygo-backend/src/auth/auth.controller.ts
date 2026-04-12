import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('🔐 Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description: 'Crea un usuario con rol OWNER, STORE o ADMIN. El correo debe ser único. La contraseña se cifra con bcrypt antes de guardarse.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: '✅ Usuario creado exitosamente. Retorna los datos del usuario sin la contraseña.' })
  @ApiResponse({ status: 409, description: '⚠️ El correo ya está registrado en el sistema.' })
  @ApiResponse({ status: 400, description: '❌ Datos inválidos (correo mal formado, contraseña muy corta, etc.).' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Valida las credenciales del usuario y retorna un JWT Access Token. Este token debe usarse en el header Authorization: Bearer {token} para acceder a los endpoints protegidos.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: '✅ Login exitoso. Retorna el access_token y los datos del usuario.' })
  @ApiResponse({ status: 401, description: '❌ Credenciales inválidas o cuenta desactivada.' })
  @ApiResponse({ status: 400, description: '❌ Datos inválidos (correo mal formado, contraseña muy corta).' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}

