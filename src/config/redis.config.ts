import { CacheModule,CACHE_MANAGER } from '@nestjs/cache-manager';
import { Global, Module, OnModuleInit, Injectable } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-store';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { RedisHealthController } from './redis.health';

@Injectable()
class RedisService implements OnModuleInit {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async onModuleInit() {
    try {
      await this.cacheManager.set('test', 'test');
      const result = await this.cacheManager.get('test');
      if (result === 'test') {
        console.log('✅ Redis connection successful');
      }
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
    }
  }
}

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: () => ({
        store: redisStore,
        host: 'localhost',
        port: 6379,
      }),
    }),
  ],
  providers: [RedisService],
  controllers: [RedisHealthController],
  exports: [CacheModule],
})
export class RedisModule {}