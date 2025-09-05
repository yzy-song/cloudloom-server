import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Survey } from './survey.entity';

/**
 * 用户回答实体类
 * 对应 PostgreSQL 中的 `responses` 表
 */
@Entity({ name: 'responses' })
export class Response {
  /**
   * 回答的唯一标识符（主键）
   * @PrimaryGeneratedColumn: TypeORM 自动生成 UUID
   */
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  /**
   * 问卷ID，作为外键关联到 Survey 表
   * @Column: 存储外键值
   */
  @Column({ type: 'integer', name: 'survey_id' })
  survey_id: number;

  /**
   * 提交用户的唯一标识符
   * @Column: 对应 PostgreSQL 中的 VARCHAR 类型，可为空
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  user_id: string;

  /**
   * 用户填写的电子邮件（可选）
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  /**
   * 用户填写的姓名（可选）
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  /**
   * 用户填写的电话（可选）
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  phone: string;

  /**
   * 用户填写的城市（可选）
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  city: string;

  /**
   * 新增：用户填写的年龄段（可选）
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  age: string;

  /**
   * 新增：用户填写的性别（可选）
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  gender: string;

  /**
   * 回答提交时间
   * @CreateDateColumn: TypeORM 自动生成创建时间
   */
  @CreateDateColumn({ type: 'timestamptz', name: 'submitted_at' })
  submitted_at: Date;

  /**
   * 存储用户回答的 JSONB 数据
   * @Column: 对应 PostgreSQL 的 JSONB 类型
   */
  @Column({ type: 'jsonb' })
  answers: object;

  /**
   * 与 Survey 实体的多对一关系
   * ManyToOne: 多个回答可以对应一个问卷
   * JoinColumn: 定义外键列
   */
  @ManyToOne(() => Survey, survey => survey.responses)
  @JoinColumn({ name: 'survey_id' })
  survey: Survey;
}
