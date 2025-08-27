/*
 * @Author: yzy
 * @Date: 2025-08-23 03:57:16
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-27 13:22:24
 */
/*
 * 用户实体，存储注册用户的基本信息和权限
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';

export type UserRole = 'customer' | 'admin';

@Entity('users')
@Index('idx_users_email', ['email'])
export class User {
  @ApiProperty({ description: '用户ID', example: 'a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '用户名', example: 'testuser' })
  @Column({ name: 'username', unique: true, length: 100 })
  username: string;

  @ApiProperty({ description: '邮箱', example: 'test@example.com' })
  @Column({ length: 255, unique: true })
  email: string;

  @ApiProperty({ description: '电话', required: false, example: '13800000000' })
  @Column({ length: 50, nullable: true })
  phone: string;

  @ApiProperty({ description: '昵称', required: false, example: '我是昵称' })
  @Column({ name: 'nickname', length: 50, nullable: true })
  nickName: string;

  @ApiProperty({ description: '密码哈希', readOnly: true })
  @Column({ name: 'password_hash', length: 255 })
  @Exclude() // 确保密码哈希不会被意外地序列化到响应中
  passwordHash: string;

  @ApiProperty({ description: '用户角色', enum: ['customer', 'admin'], example: 'customer' })
  @Column({ length: 20, default: 'customer' })
  role: UserRole;

  @ApiProperty({ description: '头像URL', required: false, example: 'https://example.com/avatar.png' })
  @Column('text', { name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @ApiProperty({ description: '创建时间', example: '2025-08-23T03:57:16.000Z' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2025-08-23T06:29:13.000Z' })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt: Date;

  /**
   * 密码哈希处理
   * @param password 明文密码
   */
  async hashPassword(password: string): Promise<void> {
    this.passwordHash = await bcrypt.hash(password, 10);
  }

  /**
   * 密码验证
   * @param password 明文密码
   * @returns 是否匹配
   */
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }
}
