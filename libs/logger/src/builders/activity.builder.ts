import { Logger } from 'winston';
import { get, set } from 'lodash';
import { RequestBuilder, RequestType } from './request.builder';
import { OnModelChangedEvent } from '@nestjs-toolkit/winston-logger/types';

export interface SubjectActivity {
  _id?: string;
  id?: string;
  collection?: string;
  toJSON?: () => any;
}

export interface CauserActivity extends SubjectActivity {
  username?: string;
}

export type LevelActivity =
  | 'error'
  | 'debug'
  | 'warn'
  | 'data'
  | 'http'
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
  subjectCollection?: string;
  causer?: CauserActivity;
  causerCollection?: string;
  request?: RequestType;
  error?: any;
  context?: string;
  kind?: string; // type object, ex: HTTP, GQL, CATEGORY_CREATE...
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
    const text = this.placeholder(message);

    if (this.meta.subject) {
      this.meta.subject = {
        id: this.meta.subject._id || this.meta.subject.id,
        collection: this.meta.subjectCollection,
      };
    }

    if (this.meta.causer) {
      this.meta.causer = {
        id: this.meta.causer._id || this.meta.causer.id,
        collection: this.meta.causerCollection,
      };
    }

    delete this.meta.causerCollection;
    delete this.meta.subjectCollection;

    return {
      message: text,
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

  public performedOn(model: SubjectActivity, type?: string): this {
    if (model) {
      this.meta.subject =
        typeof model.toJSON === 'function' ? model.toJSON() : model;
      this.meta.subjectCollection = type;
    }

    return this;
  }

  public causedBy(user?: CauserActivity, type?: string): this {
    if (user) {
      this.meta.causer = user;
      this.meta.causerCollection = type;
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

  public withEvent(event: OnModelChangedEvent): this {
    this.request(event.req)
      .causedBy(event.user, 'user')
      .tags(event.tags)
      .performedOn(event.model, event.collection)
      .action(event.action);

    if (event.detailedDiff) {
      this.withProperty('diff', event.detailedDiff);
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

  public tags(...args): this {
    if (args.length === 1) {
      if (typeof args[0] === 'string') {
        this.withProperty('tags', [args[0]]);
      } else if (Array.isArray(args[0])) {
        this.withProperty('tags', args[0]);
      }
    } else if (args.length > 1) {
      this.withProperty('tags', [...args]);
    }

    return this;
  }

  public action(action: string): this {
    this.withProperty('action', action);
    return this;
  }

  public env(env: string): this {
    this.withProperty('env', env);
    return this;
  }
}
