import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import {
  MongoDBTransportInstance,
  MongoDBConnectionOptions,
} from 'winston-mongodb';
import * as winston from 'winston';

@Injectable()
export class WinstonMongoDBService {
  constructor(@InjectConnection() private connection: Connection) {}

  createTransport(
    options?: Partial<MongoDBConnectionOptions>,
  ): MongoDBTransportInstance {
    const WinstonMongoDB: MongoDBTransportInstance = (winston.transports as any)
      .MongoDB;

    const configure = Object.assign(
      {
        level: 'info',
        db: this.connection as any,
        decolorize: true,
      },
      options,
    );

    return new WinstonMongoDB(configure);
  }
}
