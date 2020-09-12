import { Request } from 'express';

export interface RequestType {
  method: string
  route: string
  data: {
    body: any,
    query: any,
    params: any,
  },
  from: string,
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


    return {
      method: req.method,
      route: req.route.path,
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
