import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

class Config {
  private config: ConfigService;

  constructor() {
    this.config = new ConfigService();
  }

  public get<T = any>(propertyPath: string, defaultValue?: T) {
    return this.config.get(propertyPath, defaultValue);
  }

  public getDatabaseOptions(): TypeOrmModuleOptions {
    return {
      type: this.get('POSTGRES_TYPE'),
      host: this.get('POSTGRES_HOST'),
      port: this.get('POSTGRES_PORT'),
      username: this.get('POSTGRES_USER'),
      password: this.get('POSTGRES_PASSWORD'),
      database: this.get('POSTGRES_DB'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities: true,
    };
  }

  public getTimeExpire() {
    return this.get<number>('EXPIRED');
  }

  public telegramToken(): string {
    return this.get('TOKEN');
  }
}

export const config = new Config();
