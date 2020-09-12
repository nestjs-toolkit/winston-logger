import { Logger } from 'winston';
import { get, set } from 'lodash';
import {
  RequestBuilder,
  RequestType,
} from '@nestjs-toolkit/winston-logger/builders/request.builder';

export interface SubjectActivity {
  _id: string;
  type: string;
}

export interface CauserActivity extends SubjectActivity {
  username?: string;
}

export type LevelActivity =
  | 'error'
  | 'warn'
  | 'info'
  | 'verbose'
  | 'debug'
  | 'silly';

export type ConfigActivity = {
  level: LevelActivity;
};

export type MetaActivity = {
  properties?: Record<string, any>;
  subject?: SubjectActivity;
  causer?: CauserActivity;
  request?: RequestType;
  context?: string;
};

export class ActivityBuilder {
  private meta: MetaActivity = {};

  private config: ConfigActivity = {
    level: 'info',
  };

  constructor(private readonly logger: Logger, context?: string) {
    this.contextIn(context);
  }

  get properties(): Record<string, any> {
    return this.meta.properties || {};
  }

  public log(message: string): Logger {
    const present = this.present(message);
    return this.logger.log(this.config.level, present.message, present.meta);
  }

  public present(
    message: string,
  ): { meta: Record<string, any>; message: string } {
    return {
      message: this.placeholder(message),
      meta: this.meta,
    };
  }

  public level(level: LevelActivity): this {
    this.config.level = level;
    return this;
  }

  public contextIn(context?: string): this {
    if (context) {
      this.meta.context = context;
    }
    return this;
  }

  public performedOn(model: SubjectActivity): this {
    this.meta.subject = model;
    return this;
  }

  public causedBy(user?: CauserActivity): this {
    if (user) {
      this.meta.causer = user;
    }
    return this;
  }

  public request(req: any): this {
    if (req) {
      this.meta.request = new RequestBuilder().present(req);
    }
    return this;
  }

  public withProperty(key: string, value: any): this {
    this.meta.properties = set(this.properties, key, value);
    return this;
  }

  public withProperties(params: Record<string, any>): this {
    this.meta.properties = { ...this.properties, ...params };
    return this;
  }

  private placeholder(message: string): string {
    const regex = new RegExp(
      ':((subject|causer|properties|request)([.a-zA-Z0-9_]+))',
      'g',
    );

    let match: any[] = [];
    let newMessage = message;

    while ((match = regex.exec(message)) !== null) {
      const [search, key] = match;
      newMessage = newMessage.replace(search, get(this.meta, key));
    }

    return newMessage;
  }

  public tags(tags: string[]): this {
    this.withProperty('tags', tags);
    return this;
  }

  public action(action: string): this {
    this.withProperty('tags', action);
    return this;
  }

  public env(env: string): this {
    this.withProperty('env', env);
    return this;
  }
}
