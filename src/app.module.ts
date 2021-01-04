import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  nestWinstonUtilities,
  WinstonModule,
  winston,
} from '@nestjs-toolkit/winston-logger';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WinstonMongoDBModule,
  WinstonMongoDBService,
} from '@nestjs-toolkit/winston-logger/transports/mongodb';
import { LoggerInterceptor } from '@nestjs-toolkit/winston-logger/interceptors';

//
// Logging levels
//
const configWinston = {
  levels: {
    error: 0,
    debug: 1,
    warn: 2,
    data: 3,
    http: 4,
    info: 5,
    verbose: 6,
    silly: 7,
    custom: 8,
  },
  colors: {
    error: 'red',
    debug: 'blue',
    warn: 'yellow',
    data: 'grey',
    http: 'grey',
    info: 'green',
    verbose: 'cyan',
    silly: 'magenta',
    custom: 'yellow',
  },
};

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGO_TEST_URI,
        useNewUrlParser: true,
      }),
    }),
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
            db: process.env.MONGO_TEST_URI,
            leaveConnectionOpen: false,
            collection: 'logs',
            options: {
              useNewUrlParser: true,
            },
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

        winston.addColors(configWinston.colors);

        return {
          levels: configWinston.levels,
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
