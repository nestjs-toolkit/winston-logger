import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Model } from 'mongoose';

describe('AppController (e2e)', () => {
  const mongoServer = new MongoMemoryServer();

  let app: INestApplication;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    process.env['MONGO_TEST_URI'] = await mongoServer.getUri();

    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.getHttpServer().ready;
    await app.init();
  });

  afterAll(async done => {
    await app.close();

    setTimeout(async () => {
      await mongoServer.stop();
      done();
    }, 500);
  });

  it('/ (GET) - see logger', async done => {
    const { status } = await request(app.getHttpServer()).get('/');
    expect(status).toEqual(200);

    setTimeout(async () => {
      const model = moduleFixture.get<Model<any>>('LOG_MODEL');
      const data = await model.find({});

      expect(data).toHaveLength(5);
      // TODO: check log
      // data.forEach(row => console.log(row.toJSON().meta));

      done();
    }, 1000);
  }, 10000);
});
