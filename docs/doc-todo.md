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
