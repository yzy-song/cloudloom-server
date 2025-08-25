/*
 * 合作申请实体，记录用户提交的合作意向信息
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export type ApplicationStatus = 'pending' | 'contacted' | 'rejected';

@Entity('collaboration_applications')
@Index('idx_collaboration_applications_status', ['status'])
export class CollaborationApplication {
  @ApiProperty({ description: '申请ID', example: 'a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '姓名', example: '张三' })
  @Column({ name: 'full_name', length: 255 })
  name: string;

  @ApiProperty({ description: '公司/机构', required: false, example: '云织云科技' })
  @Column({ length: 255, nullable: true })
  company: string;

  @ApiProperty({ description: '邮箱', example: 'zhangsan@email.com' })
  @Column({ name: 'email', length: 255 })
  email: string;

  @ApiProperty({ description: '电话', example: '13800000000' })
  @Column({ name: 'phone', length: 50, nullable: true })
  phone: string;

  @ApiProperty({ description: '合作类型', example: '渠道合作' })
  @Column({ name: 'collaboration_type', length: 100, nullable: true })
  collaborationType: string;

  @ApiProperty({ description: '咨询消息', example: '希望了解合作细节' })
  @Column({ name: 'message', nullable: true })
  message: string;

  @ApiProperty({ description: '处理状态', enum: ['pending', 'contacted', 'rejected'], example: 'pending' })
  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  status: ApplicationStatus;

  @ApiProperty({ description: '创建时间', example: '2025-08-23T03:57:16.000Z' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;
}
