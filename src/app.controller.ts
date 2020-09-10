import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private logger = new Logger('a');

  constructor(private readonly appService: AppService) {
  }

  @Get()
  getHello(): string {
    this.logger.log('AAA');
    this.logger.log({ foo: 'bar' });
    this.logger.log({ message: 'BBB', foo: 'bar' });
    return this.appService.getHello();
  }
}
