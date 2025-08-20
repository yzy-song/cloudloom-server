/*
 * @Author: yzy
 * @Date: 2025-08-19 22:53:05
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-19 22:53:13
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export type InquiryStatus = 'new' | 'contacted' | 'resolved';

@Entity('inquiries')
export class Inquiry {
  @ApiProperty({ description: '咨询ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '姓名' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: '联系方式' })
  @Column({ length: 255 })
  contact: string;

  @ApiProperty({ description: '公司/机构', required: false })
  @Column({ length: 255, nullable: true })
  company: string;

  @ApiProperty({ description: '合作类型' })
  @Column({ name: 'collaboration_type' })
  collaborationType: number;

  @ApiProperty({ description: '咨询消息' })
  @Column('text')
  message: string;

  @ApiProperty({ description: '处理状态', enum: ['new', 'contacted', 'resolved'] })
  @Column({ default: 'new' })
  status: InquiryStatus;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
