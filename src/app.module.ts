import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  nestWinstonUtilities,
  WinstonModule,
  LoggerInterceptor,
  winston,
} from '@nestjs-toolkit/winston-logger';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WinstonMongoDBModule,
  WinstonMongoDBService,
} from '@nestjs-toolkit/winston-logger/transports/mongodb';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest'),
    WinstonModule.forRootAsync({
      useFactory: (winstonMongoDB: WinstonMongoDBService) => {
        const transports: any[] = [
          new winston.transports.File({
            level: 'info',
            filename: 'application.log',
            dirname: 'logs',
          }),
          winstonMongoDB.createTransport({
            level: 'info',
          }),
        ];

        if (process.env.NODE_ENV !== 'production') {
          transports.push(
            new winston.transports.Console({
              level: 'verbose',
              format: winston.format.combine(
                winston.format.timestamp(),
                nestWinstonUtilities.format.nestLike(),
              ),
            }),
          );
        }

        return {
          levels: winston.config.npm.levels,
          format: winston.format.combine(
            winston.format.metadata(),
            winston.format.json(),
          ),
          transports: [...transports],
        };
      },
      imports: [WinstonMongoDBModule],
      inject: [WinstonMongoDBService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
  ],
})
export class AppModule {}
