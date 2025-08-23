/*
 * @Author: yzy
 * @Date: 2025-08-23 03:56:23
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-23 19:20:45
 */
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../core/entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcryptjs';

import { AppLogger } from '../../utils/logger';
import { isEmail } from 'class-validator';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly logger: AppLogger // 依赖注入
  ) {
    this.logger.setContext(AuthService.name);
  }

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
    try {
      const user = await this.validateUser(loginUserDto.identifier, loginUserDto.password);
      const payload = { username: user.username, sub: user.id };
      return {
        accessToken: this.jwtService.sign(payload),
      };
    } catch (error) {
      // 直接抛出 validateUser 中的错误
      throw error;
    }
  }

  async validateUser(identifier: string, password: string): Promise<any> {
    let user: User | null = null;
    // 一次性查询用户（根据用户名或邮箱）
    user = await this.usersRepository.findOne({
      where: [{ username: identifier }, { email: identifier }],
    });

    // 如果用户不存在
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 用户存在但密码错误
    this.logger.debug(password);
    this.logger.debug(user.passwordHash);
    if (!(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('密码错误');
    }

    // 验证成功，返回用户信息（不包含密码）
    const { passwordHash: _, ...result } = user;
    return result;
  }
}
