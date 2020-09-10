import { Module } from '@nestjs/common';
import { WinstonMongoDBService } from './winston-mongodb.service';

@Module({
  providers: [WinstonMongoDBService],
  exports: [WinstonMongoDBService],
})
export class WinstonMongoDBModule {

}
