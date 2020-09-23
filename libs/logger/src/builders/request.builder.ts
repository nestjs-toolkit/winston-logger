import { Request } from 'express';

export interface RequestType {
  host: string;
  method: string;
  route: string;
  data: {
    body: any;
    query: any;
    params: any;
  };
  from: string;
}

export class RequestBuilder {
  present(req: Request): RequestType {
    const body = { ...req.body };
    delete body.password;
    delete body.passwordConfirmation;

    const data = {
      body: this.transformObj(body),
      query: this.transformObj(req.query),
      params: this.transformObj(req.params),
    };

    Object.keys(data).forEach(k => {
      if (!data[k]) {
        delete data[k];
      }
    });

    // fastify
    const raw = (req as any).raw || {};

    return {
      host: req.hostname,
      method: raw.method || req.method,
      route: raw.url || req.originalUrl,
      from: req.ip,
      data,
    };
  }

  private transformObj(obj): any {
    if (!obj || !Object.values(obj).length) {
      return undefined;
    }

    return obj;
  }
}
