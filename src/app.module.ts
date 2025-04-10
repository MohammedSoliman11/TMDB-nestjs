import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseConfig } from './config/database.config';
import { RedisModule } from './config/redis.config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MovieModule } from './movie/movie.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useClass: DatabaseConfig,
      imports: [ConfigModule],
    }),
    AuthModule,
    UserModule,
    MovieModule,
    RedisModule,
  ],
})
export class AppModule {}
