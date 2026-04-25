import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const fallbackUrl = 'postgresql://postgres.ygphobmmdlsxcfzfqdrn:...decV11931912Vaaa@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true';
    
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || fallbackUrl,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
