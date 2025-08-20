/*
 * @Author: yzy
 * @Date: 2025-08-19 21:45:37
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-20 10:17:33
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/products (GET)', () => {
    return request(app.getHttpServer())
      .get('/products')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.count).toBeDefined();
      });
  });

  it('/products/1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/products/1')
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(1);
        expect(res.body.title).toBeDefined();
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
