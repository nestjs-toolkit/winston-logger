import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from '@nestjs-toolkit/logger';
import * as winston from 'winston';
import { MongoDBTransportInstance } from 'winston-mongodb';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerInterceptor } from '@nestjs-toolkit/logger';

import 'winston-mongodb';
import { getConnectionToken, InjectConnection, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as Transport from 'winston-transport';

const WinstonMongoDB: MongoDBTransportInstance = (winston.transports as any).MongoDB;

// @InjectConnection()

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest'),
    WinstonModule.forRootAsync({
      useFactory: (connection: Connection) => {

        const transports: Transport[] = [
          new winston.transports.File({
            level: 'verbose',
            filename: 'application.log',
            dirname: 'logs',
          }),
          new WinstonMongoDB({
            level: 'info',
            // db: 'mongodb://localhost/nest',
            db: connection as any,
            decolorize: true,
          }),
        ];

        if (process.env.NODE_ENV !== 'production') {
          transports.push(new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              nestWinstonModuleUtilities.format.nestLike(),
            ),
          }));
        }

        return {
          levels: winston.config.npm.levels,
          level: 'verbose',
          format: winston.format.combine(
            winston.format.metadata(),
            winston.format.json(),
          ),
          transports: [
            ...transports,
          ],
        };
      },
      inject: [getConnectionToken()],
    }),
    // WinstonModule.forRoot({
    //   levels: winston.config.npm.levels,
    //   level: 'verbose',
    //   format: winston.format.combine(
    //     winston.format.metadata(),
    //     winston.format.json(),
    //   ),
    //   transports: [
    //     new winston.transports.File({
    //       level: 'verbose',
    //       filename: 'application.log',
    //       dirname: 'logs',
    //     }),
    //     new winston.transports.Console({
    //       format: winston.format.combine(
    //         winston.format.timestamp(),
    //         nestWinstonModuleUtilities.format.nestLike(),
    //       ),
    //     }),
    //     new WinstonMongoDB({
    //       level: 'info',
    //       db: 'mongodb://localhost/test',
    //       decolorize: true,
    //     }),
    //     // other transports...
    //   ],
    //   // other options
    // }),
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
export class AppModule {
}
