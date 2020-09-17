import { Logger } from 'winston';
import { get, set } from 'lodash';
import {
  RequestBuilder,
  RequestType,
} from './request.builder';

export interface SubjectActivity {
  _id: string;
  type: string;
}

export interface CauserActivity extends SubjectActivity {
  username?: string;
}

export type LevelActivity =
  | 'error'
  | 'debug'
  | 'warn'
  | 'data'
  | 'info'
  | 'verbose'
  | 'silly'
  | 'custom';

export type ConfigActivity = {
  level: LevelActivity;
};

export type MetaActivity = {
  properties?: Record<string, any>;
  subject?: SubjectActivity;
  causer?: CauserActivity;
  request?: RequestType;
  error?: any;
  context?: string;
  kind?: string;// type object, ex: HTTP, GQL, CATEGORY_CREATE...
};

export class ActivityBuilder {
  private meta: MetaActivity = {};

  private config: ConfigActivity = {
    level: 'data',
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

  public error(error: Error): this {
    this.level('error');
    this.meta.error = {
      message: error.message,
      trace: error.stack,
      name: error.name,
      ...error,
    };
    return this;
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

  public kind(k?: string): this {
    if (k) {
      this.meta.kind = k;
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

  public requestGql(req: any): this {
    if (req) {
      this.meta.request = new RequestBuilder().present(req);
      delete this.meta.request.data;
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
      ':((subject|causer|properties|request|error)([.a-zA-Z0-9_]+))',
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
