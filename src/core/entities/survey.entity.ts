import { Entity, PrimaryColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Response } from './response.entity';

/**
 * 问卷实体类
 * 对应 PostgreSQL 中的 `surveys` 表
 */
@Entity({ name: 'surveys' })
export class Survey {
  /**
   * 问卷的唯一标识符（主键）
   * @PrimaryColumn: 手动指定主键值
   */
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  /**
   * 问卷标题
   */
  @Column({ type: 'varchar', length: 255 })
  title: string;

  /**
   * 问卷描述
   * @Column: 对应 PostgreSQL 中的 TEXT 类型
   */
  @Column({ type: 'text', nullable: true })
  description: string;

  /**
   * 问卷创建时间
   * @CreateDateColumn: TypeORM 自动生成创建时间
   */
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  /**
   * 与 Response 实体的一对多关系
   * OneToMany: 一个问卷可以有多个回答
   */
  @OneToMany(() => Response, response => response.survey)
  responses: Response[];
}
