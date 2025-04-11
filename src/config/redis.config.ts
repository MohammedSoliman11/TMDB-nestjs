import { Global, Module, OnModuleInit, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  async onModuleInit() {
    try {
      await this.redis.set('test', 'test');
      const result = await this.redis.get('test');
      if (result === 'test') {
        console.log('✅ Redis connection successful');
      }
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
    }
  }

  getClient(): Redis {
    return this.redis;
  }
}

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}