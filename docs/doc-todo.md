- exemplo `src/app.controller.ts` utilizando `private logger = new Logger(AppController.name)` class padrão do NEST

- mostrar os diferentes tipos de message, ex:

```js
this.logger.log('AAA');
this.logger.log({ foo: 'bar' });
this.logger.log({ message: 'BBB', foo: 'bar' });
```

- utilizando o transport mongodb

- copiar doc de https://github.com/winstonjs/winston-mongodb

- copiar doc de https://github.com/gremo/nest-winston


- use transform console in env=local

`yarn add  cli-color fast-safe-stringify -D`

```js
import { nestWinstonUtilities } from '@nestjs-toolkit/winston-logger';

if (process.env.NODE_ENV !== 'production') {
  transports.push(new winston.transports.Console({
    level: 'verbose',
    format: winston.format.combine(
      winston.format.timestamp(),
      nestWinstonUtilities.format.nestLike(),
    ),
  }));
}
```

- LoggerInterceptor

- logRequest 

```ts
this.logger.logRequest(req, req.user, 'Contextname');
```

- builder

```ts
  this.logger.builder()
      .performedOn(anModel)
      .causedBy(user)
      .level('warn')
      .request(req)
      .tags(['first-tag', 'backend', 'admin'])
      .action('category.create')
      .env('production')
      .withProperties({ 'customProperty': 'customValue' })
      .withProperties({ 'framework': 'nestjs' })
      .withProperty('version', 'v7.0')
      .withProperty('demo', { foo: 'bar' })
      .log('The subject name is :subject.name, the causer name is :causer.username and framework is :properties.framework :properties.version, demo :properties.demo.foo');
  
  // result message: The subject name is Leia, the causer name is Luke and framework is nestjs v7.0, demo bar
```
