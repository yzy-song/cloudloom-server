/*
 * @Author: yzy
 * @Date: 2025-08-29 20:01:48
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-29 20:06:36
 */
import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryColumn({ name: 'role_id', type: 'int' })
  roleId: number;

  @PrimaryColumn({ name: 'permission_id', type: 'int' })
  permissionId: number;

  @CreateDateColumn({ name: 'granted_at' })
  grantedAt: Date;

  @ManyToOne(() => Role, role => role.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Permission, permission => permission.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
