import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StoresModule } from './stores/stores.module';
import { KeysModule } from './keys/keys.module';
import { CodesModule } from './codes/codes.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, StoresModule, KeysModule, CodesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
