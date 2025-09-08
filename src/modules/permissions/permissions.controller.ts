import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('权限管理')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: '权限列表' })
  findAll() {
    return this.permissionsService.findAll().then(list => ({ data: list }));
  }

  @Get(':id')
  @ApiOperation({ summary: '权限详情' })
  findOne(@Param('id') id: number) {
    return this.permissionsService.findOne(id).then(permission => ({ data: permission }));
  }

  @Post()
  @ApiOperation({ summary: '新增权限' })
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto).then(permission => ({ data: permission, message: '权限创建成功' }));
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑权限' })
  update(@Param('id') id: number, @Body() dto: UpdatePermissionDto) {
    return this.permissionsService.update(id, dto).then(permission => ({ data: permission, message: '权限更新成功' }));
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除权限' })
  remove(@Param('id') id: number) {
    return this.permissionsService.remove(id).then(() => ({ message: '权限删除成功' }));
  }
}
