/*
 * @Author: yzy
 * @Date: 2025-08-23 03:56:23
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-23 06:49:36
 */
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../core/entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcryptjs';

import { isEmail } from 'class-validator';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const { username, email, password } = registerUserDto;

    // 检查用户名或邮箱是否已存在
    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictException('用户名或邮箱已存在');
    }

    // 密码加密
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = this.usersRepository.create({
      username,
      email,
      passwordHash: hashedPassword,
    });

    return this.usersRepository.save(newUser);
  }

  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    const { identifier, password } = loginUserDto;

    // 查找用户，支持用户名或邮箱登录
    const user = await this.usersRepository.findOne({
      where: [{ username: identifier }, { email: identifier }], // ✅ Use correct field name
    });

    if (!user) {
      throw new UnauthorizedException('无效的凭证');
    }

    // 验证密码
    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('无效的凭证');
    }

    // 生成 JWT
    const payload = { sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async validateUser(identifier: string, password: string): Promise<any> {
    let user: User | null = null;

    // Check if identifier is an email
    if (isEmail(identifier)) {
      user = await this.usersRepository.findOne({ where: { email: identifier } });
    } else {
      user = await this.usersRepository.findOne({ where: { username: identifier } });
    }

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash: _, ...result } = user;
      return result;
    }

    return null;
  }
}
