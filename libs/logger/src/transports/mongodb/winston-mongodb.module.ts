import { Module } from '@nestjs/common';
import { Connection } from 'mongoose';
import { WinstonMongoDBService } from './winston-mongodb.service';
import { LogSchema } from './log.schema';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature()],
  providers: [
    WinstonMongoDBService,
    {
      provide: 'LOG_MODEL',
      useFactory: (connection: Connection) =>
        connection.model('logs', LogSchema),
      inject: [getConnectionToken()],
    },
  ],
  exports: [WinstonMongoDBService, 'LOG_MODEL'],
})
export class WinstonMongoDBModule {}
