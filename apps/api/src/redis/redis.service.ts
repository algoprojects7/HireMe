import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: any;
  private isRedisAvailable = false;
  private memoryCache = new Map<string, { value: any; expiry: number }>();

  constructor() {}

  async onModuleInit() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = process.env.REDIS_PORT || 6379;
    const password = process.env.REDIS_PASSWORD;

    try {
      // Use require for runtime check to avoid TS compilation error if not installed
      const Redis = require('ioredis');
      this.client = new Redis({
        host,
        port: Number(port),
        password,
        lazyConnect: true,
      });

      await this.client.connect();
      this.isRedisAvailable = true;
      console.log('Successfully connected to Redis');
    } catch (err) {
      console.warn('Redis not available, falling back to In-Memory Cache.');
    }
  }

  async set(key: string, value: any, ttlSeconds?: number) {
    const stringValue = JSON.stringify(value);
    
    if (this.isRedisAvailable) {
      if (ttlSeconds) {
        await this.client.set(key, stringValue, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, stringValue);
      }
    } else {
      const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : Infinity;
      this.memoryCache.set(key, { value: stringValue, expiry });
    }
  }

  async get(key: string): Promise<any | null> {
    let rawValue: string | null = null;

    if (this.isRedisAvailable) {
      rawValue = await this.client.get(key);
    } else {
      const cached = this.memoryCache.get(key);
      if (cached) {
        if (cached.expiry > Date.now()) {
          rawValue = cached.value;
        } else {
          this.memoryCache.delete(key);
        }
      }
    }

    return rawValue ? JSON.parse(rawValue) : null;
  }

  async del(key: string) {
    if (this.isRedisAvailable) {
      await this.client.del(key);
    } else {
      this.memoryCache.delete(key);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }
}
