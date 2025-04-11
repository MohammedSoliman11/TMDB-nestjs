// import { Controller, Get } from '@nestjs/common';
// import { Inject } from '@nestjs/common';
// import { Cache } from 'cache-manager';

// @Controller('health')
// export class RedisHealthController {
//   constructor() {}

//   @Get('redis')
//   async checkRedis() {
//     try {
//       await this.cacheManager.set('health', 'check');
//       const result = await this.cacheManager.get('health');
//       return { status: 'ok', connected: result === 'check' };
//     } catch (error) {
//       return { status: 'error', message: error.message };
//     }
//   }
// }