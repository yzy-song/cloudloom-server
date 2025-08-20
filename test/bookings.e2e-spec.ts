/*
 * @Author: yzy
 * @Date: 2025-08-20 10:50:48
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-20 10:52:19
 */
// test/bookings.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('BookingsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 获取认证token（如果有认证）
    const loginResponse = await request.default(app.getHttpServer()).post('/auth/login').send({ username: 'admin', password: 'password' });
    authToken = loginResponse.body.accessToken;
  });

  it('/bookings (POST) - 创建预约', () => {
    return request
      .default(app.getHttpServer())
      .post('/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        customerName: '测试用户',
        contactInfo: 'test@example.com',
        productId: 1,
        selectedSize: 'M',
        bookingDate: '2024-03-20',
        timeSlot: '10:00 - 11:30',
        totalPrice: 89.99,
      })
      .expect(201)
      .expect(res => {
        expect(res.body.id).toBeDefined();
        expect(res.body.customerName).toBe('测试用户');
      });
  });

  it('/bookings (GET) - 获取预约列表', () => {
    return request
      .default(app.getHttpServer())
      .get('/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect(res => {
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.count).toBeDefined();
      });
  });

  it('/bookings/available-slots/1/2024-03-20 (GET) - 获取可用时间段', () => {
    return request
      .default(app.getHttpServer())
      .get('/bookings/available-slots/1/2024-03-20')
      .expect(200)
      .expect(res => {
        expect(res.body).toBeInstanceOf(Array);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
