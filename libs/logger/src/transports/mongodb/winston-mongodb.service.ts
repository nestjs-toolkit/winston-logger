import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import {
  MongoDBTransportInstance,
  MongoDBConnectionOptions,
} from 'winston-mongodb';
import * as winston from 'winston';

@Injectable()
export class WinstonMongoDBService implements OnApplicationShutdown {
  private transport: MongoDBTransportInstance;

  onApplicationShutdown(signal?: string): any {
    if (this.transport) {
      this.transport.destroy();
    }
  }

  createTransport(
    options?: Partial<MongoDBConnectionOptions>,
  ): MongoDBTransportInstance {
    const WinstonMongoDB: MongoDBTransportInstance = (winston.transports as any)
      .MongoDB;

    const configure: any = Object.assign(
      {
        level: 'info',
        decolorize: true,
      },
      options,
    );

    this.transport = new WinstonMongoDB(configure);
    return this.transport;
  }
}
