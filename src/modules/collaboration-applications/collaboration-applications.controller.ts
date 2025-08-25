import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CollaborationApplicationsService } from './collaboration-applications.service';
import { CreateCollaborationApplicationDto } from './dto/create-collaboration-application.dto';
import { UpdateCollaborationApplicationDto, CollaborationApplicationQueryDto } from './dto/update-collaboration-application.dto';
import { CollaborationApplication } from '../../core/entities/collaboration-application.entity';

@ApiTags('合作申请')
@Controller('collaboration-applications')
export class CollaborationApplicationsController {
  constructor(private readonly collaborationApplicationsService: CollaborationApplicationsService) {}

  @Post()
  @ApiOperation({ summary: '提交合作申请' })
  @ApiResponse({ status: 201, description: '提交成功', type: CollaborationApplication })
  create(@Body() createDto: CreateCollaborationApplicationDto) {
    return this.collaborationApplicationsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: '合作申请列表', description: '支持分页和状态筛选' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiQuery({ name: 'status', required: false, description: '状态', example: 'pending' })
  @ApiResponse({ status: 200, description: '合作申请列表', type: [CollaborationApplication] })
  findAll(@Query() query: CollaborationApplicationQueryDto) {
    return this.collaborationApplicationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '合作申请详情' })
  @ApiResponse({ status: 200, description: '合作申请详情', type: CollaborationApplication })
  findOne(@Param('id') id: string) {
    return this.collaborationApplicationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新合作申请' })
  @ApiResponse({ status: 200, description: '更新成功', type: CollaborationApplication })
  update(@Param('id') id: string, @Body() updateDto: UpdateCollaborationApplicationDto) {
    return this.collaborationApplicationsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除合作申请' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.collaborationApplicationsService.remove(id);
  }
}
