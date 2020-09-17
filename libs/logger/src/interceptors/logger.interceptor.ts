import {
  Injectable,
  NestInterceptor,
  CallHandler,
  ExecutionContext,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { WinstonLogger } from '../winston';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: WinstonLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.log(context.switchToHttp().getRequest());
    return next.handle();
  }

  private log(req) {
    if (req) {
      this.logger.logRequest(req, req.user, LoggerInterceptor.name);
    }
  }
}
