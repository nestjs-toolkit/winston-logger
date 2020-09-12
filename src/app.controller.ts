import { Controller, Get, Req } from '@nestjs/common';
import { WinstonLogger } from '@nestjs-toolkit/winston-logger';
import { Request } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: WinstonLogger,
  ) {}

  @Get()
  getHello(@Req() req: Request): string {
    this.logger.log('AAA');
    this.logger.log({ foo: 'bar' });
    this.logger.log({ message: 'BBB', foo: 'bar' });

    this.logger
      .activity()
      .request(req)
      .level('warn')
      .withProperties({ message: 'BBB', foo: 'bar' })
      .log('test message');

    return this.appService.getHello();
  }

  @Get('error')
  sampleError(): string {
    throw new Error('Sample error');
  }
}
