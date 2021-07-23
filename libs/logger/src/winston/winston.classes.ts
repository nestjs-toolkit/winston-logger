import { Logger } from 'winston';
import { Inject, Injectable, Logger as NestLogger } from '@nestjs/common';
import {
  GraphQLRequestContextDidEncounterErrors,
  GraphQLRequestContextWillSendResponse,
} from 'apollo-server-types';
import { ActivityBuilder } from '../builders';
import { WINSTON_MODULE_PROVIDER } from './winston.constants';
import { CauserActivity } from '../types';

@Injectable()
export class WinstonLogger extends NestLogger {
  private additional?: Record<string, any>;

  @Inject(WINSTON_MODULE_PROVIDER)
  private logger: Logger;

  public setProvider(logger: Logger) {
    this.logger = logger;
  }

  public setContext(context: string): this {
    this.context = context;
    return this;
  }

  public setAdditional(data: Record<string, any>): void {
    this.additional = data;
  }

  public log(message: any, context?: string): Logger {
    return this.logger.info(
      this.extractMessage(message),
      this.extractMeta(message, context),
    );
  }

  public error(
    message: any,
    trace?: string,
    context?: string,
    data?: any,
  ): Logger {
    return this.logger.error(
      this.extractMessage(message),
      this.extractMeta(message, context, {
        trace: trace || message.stack,
        ...data,
      }),
    );
  }

  public warn(message: any, context?: string): Logger {
    return this.logger.warn(
      this.extractMessage(message),
      this.extractMeta(message, context),
    );
  }

  public debug(message: any, context?: string): Logger {
    return this.logger.debug(
      this.extractMessage(message),
      this.extractMeta(message, context),
    );
  }

  public verbose(message: any, context?: string): Logger {
    return this.logger.verbose(
      this.extractMessage(message),
      this.extractMeta(message, context),
    );
  }

  public activity(): ActivityBuilder {
    return new ActivityBuilder(this.logger, this.context);
  }

  public logRequest(
    req: any,
    user?: CauserActivity,
    context?: string,
    data?: any,
  ): Logger {
    return this.activity()
      .kind('HTTP')
      .contextIn(context || this.context)
      .causedBy(user)
      .request(req)
      .withProperties(data)
      .log(':request.method :request.route');
  }

  public logGraphqlRequest(
    requestContext: GraphQLRequestContextWillSendResponse<any>,
    user?: CauserActivity,
    context?: string,
    data?: any,
  ): Logger {
    const gql = requestContext.request
      ? {
        operation: requestContext.operation
          ? requestContext.operation.operation
          : '5',
        operationName: requestContext.request.operationName,
        variables: requestContext.request.variables,
        query: requestContext.request.query,
      }
      : null;

    return this.activity()
      .kind('GQL')
      .level('http')
      .contextIn(context || this.context)
      .causedBy(user)
      .requestGql(requestContext.context.req)
      .withProperties(data)
      .withProperty('gql', gql)
      .log(':properties.gql.operation: :properties.gql.operationName');
  }

  public logGraphqlError(
    requestContext: GraphQLRequestContextDidEncounterErrors<any>,
    user?: CauserActivity,
    context?: string,
    data?: any,
  ): Logger[] {
    const gql = requestContext.request
      ? {
        operation: requestContext.operation
          ? requestContext.operation.operation
          : '5',
        operationName: requestContext.request.operationName,
        variables: requestContext.request.variables,
        query: requestContext.request.query,
      }
      : null;

    return requestContext.errors.map(error =>
      this.activity()
        .kind('GQL_ERROR')
        .contextIn(context || this.context)
        .causedBy(user)
        .requestGql(requestContext.context.req)
        .withProperties(data)
        .withProperty('gql', gql)
        .error(error)
        .log(
          ':properties.gql.operation: :properties.gql.operationName | error: :error.message',
        ),
    );
  }

  public present(
    message: any,
    context?: string,
  ): { meta: Record<string, any>; message: string } {
    return {
      message: this.extractMessage(message),
      meta: this.extractMeta(message, context),
    };
  }

  private extractMessage(message: any): string {
    if (typeof message === 'string') {
      return message;
    }

    if (typeof message === 'object' && message.message) {
      return typeof message.message === 'object'
        ? JSON.stringify(message)
        : message.message;
    }

    if (typeof message === 'object') {
      // return JSON.stringify(message);
      return null;
    }

    return message;
  }

  private extractMeta(
    message: any,
    context?: string,
    additional?: any,
  ): Record<string, any> {
    let merged = Object.assign({}, this.additional, additional);

    if (typeof message === 'object') {
      merged = { ...merged, ...message };
      delete merged.message;
    }

    return { context: context || this.context, ...merged };
  }
}
