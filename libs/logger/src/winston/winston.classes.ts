import { Logger } from 'winston';
import { LoggerService } from '@nestjs/common';

export class WinstonLogger implements LoggerService {
  private context?: string;
  private additional?: Record<string, any>;

  constructor(private readonly logger: Logger) {
  }

  public setContext(context: string): void {
    this.context = context;
  }

  public setAdditional(data: Record<string, any>): void {
    this.additional = data;
  }

  public log(message: any, context?: string): Logger {
    return this.logger.info(this.extractMessage(message), this.extractMeta(message, context));
  }

  public error(message: any, trace?: string, context?: string): Logger {
    return this.logger.error(this.extractMessage(message), this.extractMeta(message, context, { trace }));
  }

  public warn(message: any, context?: string): Logger {
    return this.logger.warn(this.extractMessage(message), this.extractMeta(message, context));
  }

  public debug?(message: any, context?: string): Logger {
    return this.logger.debug(this.extractMessage(message), this.extractMeta(message, context));
  }

  public verbose?(message: any, context?: string): Logger {
    return this.logger.verbose(this.extractMessage(message), this.extractMeta(message, context));
  }

  private extractMessage(message: any): string {
    if (typeof message === 'string') {
      return message;
    } else if (typeof message === 'object' && message.message) {
      return typeof message.message === 'object' ? JSON.stringify(message) : message.message;
    } else if (typeof message === 'object') {
      return null;
      // return JSON.stringify(message);
    } else {
      return message;
    }
  }

  private extractMeta(message: any, context?: string, additional?: any): Record<string, any> {
    let merged = Object.assign({}, this.additional, additional);

    if (typeof message === 'object') {
      merged = { ...merged, ...message };
      delete merged.message;
    }

    return { context: context || this.context, ...merged };
  }
}
