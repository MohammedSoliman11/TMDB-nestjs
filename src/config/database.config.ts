import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions, MongooseOptionsFactory } from '@nestjs/mongoose';

@Injectable()
export class DatabaseConfig implements MongooseOptionsFactory {
  private readonly logger = new Logger(DatabaseConfig.name);

  constructor(private configService: ConfigService) {}

  createMongooseOptions(): MongooseModuleOptions {
    const uri = this.configService.get<string>('MONGODB_URI');
    return {
      uri,
      retryAttempts: 3,
      retryDelay: 3000,
      connectionFactory: (connection) => {
        connection.on('connected', () => {
          this.logger.log('MongoDB connected successfully');
        });

        connection.on('disconnected', () => {
          this.logger.warn('MongoDB disconnected');
        });

        connection.on('error', (error) => {
          this.logger.error(`MongoDB connection error: ${error}`);
        });

        return connection;
      }
    };
  }
}