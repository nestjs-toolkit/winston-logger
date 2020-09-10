<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Summary

- [Documentação nestjs toolkit - logger](#documenta%C3%A7%C3%A3o-nestjs-toolkit---logger)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Documentação nestjs toolkit - logger


- conf main 
```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './configs/winston.config';

async function bootstrap() {
  const logger = WinstonModule.createLogger(winstonConfig);
  const app = await NestFactory.create(AppModule, { logger });
  await app.listen(3000);
}
bootstrap();
```

- conf com mongo
- melhor interceptor
- criar builder para registrar log (activyties)
