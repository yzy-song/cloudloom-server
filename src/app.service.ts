/*
 * @Author: yzy
 * @Date: 2025-08-19 21:45:37
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-28 13:22:44
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to CloudLoom!';
  }
}
