/*
 * @Author: yzy
 * @Date: 2025-08-20 10:50:48
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-24 15:03:14
 */
// test/bookings.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import request from 'supertest';
describe('BookingsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdBookingNumber: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 根据您的认证系统调整登录逻辑
    // 如果没有认证，可以移除这部分
    try {
      const loginResponse = await request(app.getHttpServer()).post('/auth/login').send({
        username: 'admin',
        password: 'password',
      });
      authToken = loginResponse.body.accessToken;
    } catch (error) {
      // 如果没有认证系统，使用空token
      authToken = '';
    }
  });

  it('/api/bookings/create (POST) - 创建预约', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/bookings/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        customerFullname: '测试用户',
        customerEmail: 'test@example.com',
        productId: 1,
        bookingDate: '2024-03-20',
        bookingTime: '10:00',
        timeSlot: '10:00 - 11:30',
        participants: 2,
        totalAmount: 89.99,
        bookingType: 'standard',
      })
      .expect(201);

    expect(response.body.bookingNumber).toBeDefined();
    expect(response.body.customerFullname).toBe('测试用户');

    // 保存预约号用于后续测试
    createdBookingNumber = response.body.bookingNumber;
  });

  it('/api/bookings/list (GET) - 获取预约列表', () => {
    return request(app.getHttpServer())
      .get('/api/bookings/list')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect(res => {
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.count).toBeDefined();
        expect(res.body.page).toBeDefined();
        expect(res.body.limit).toBeDefined();
      });
  });

  it('/api/bookings/number/:bookingNumber (GET) - 按预约号查询', () => {
    return request(app.getHttpServer())
      .get(`/api/bookings/number/${createdBookingNumber}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect(res => {
        expect(res.body.bookingNumber).toBe(createdBookingNumber);
      });
  });

  it('/api/bookings/available-slots/1/2024-03-20 (GET) - 获取可用时间段', () => {
    return request(app.getHttpServer())
      .get('/api/bookings/available-slots/1/2024-03-20')
      .expect(200)
      .expect(res => {
        expect(res.body).toBeInstanceOf(Array);
      });
  });

  it('/api/bookings/update/:bookingNumber (PATCH) - 更新预约', () => {
    return request(app.getHttpServer())
      .patch(`/api/bookings/update/${createdBookingNumber}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        participants: 3,
        totalAmount: 120.0,
        notes: '更新测试',
      })
      .expect(200)
      .expect(res => {
        expect(res.body.participants).toBe(3);
      });
  });

  it('/api/bookings/cancel/:bookingNumber (PATCH) - 取消预约', () => {
    return request(app.getHttpServer())
      .patch(`/api/bookings/cancel/${createdBookingNumber}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect(res => {
        expect(res.body.status).toBe('cancelled');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
