import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('角色管理')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: '角色列表' })
  findAll() {
    return this.rolesService.findAll().then(list => ({ data: list }));
  }

  @Get(':id')
  @ApiOperation({ summary: '角色详情' })
  findOne(@Param('id') id: number) {
    return this.rolesService.findOne(id).then(role => ({ data: role }));
  }

  @Post()
  @ApiOperation({ summary: '新增角色' })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto).then(role => ({ data: role, message: '角色创建成功' }));
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑角色' })
  update(@Param('id') id: number, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto).then(role => ({ data: role, message: '角色更新成功' }));
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  remove(@Param('id') id: number) {
    return this.rolesService.remove(id).then(() => ({ message: '角色删除成功' }));
  }
}
