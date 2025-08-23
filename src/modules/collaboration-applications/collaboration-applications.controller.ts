import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CollaborationApplicationsService } from './collaboration-applications.service';
import { CollaborationApplication } from '../../core/entities/collaboration-application.entity';
import { CreateCollaborationApplicationDto } from './dto/create-collaboration-application.dto';
import { UpdateCollaborationApplicationDto, CollaborationApplicationQueryDto } from './dto/update-collaboration-application.dto';

@ApiTags('collaboration-applications')
@Controller('collaboration-applications')
export class CollaborationApplicationsController {
  constructor(private readonly collaborationService: CollaborationApplicationsService) {}

  @Post()
  @ApiOperation({ summary: '创建新的商业合作申请' })
  @ApiResponse({ status: 201, description: '申请创建成功', type: CollaborationApplication })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  create(@Body() createDto: CreateCollaborationApplicationDto) {
    return this.collaborationService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: '获取合作申请列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'collaborationType', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: '返回申请列表',
    type: [CollaborationApplication],
  })
  findAll(@Query() query: CollaborationApplicationQueryDto) {
    return this.collaborationService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取合作申请统计' })
  @ApiResponse({
    status: 200,
    description: '返回申请统计数据',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        new: { type: 'number' },
        contacted: { type: 'number' },
        resolved: { type: 'number' },
        byCollaborationType: {
          type: 'object',
          additionalProperties: {
            type: 'number',
          },
        },
      },
    },
  })
  getStats() {
    return this.collaborationService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取单个合作申请详情' })
  @ApiParam({ name: 'id', description: '申请ID' })
  @ApiResponse({ status: 200, description: '返回申请详情', type: CollaborationApplication })
  @ApiResponse({ status: 404, description: '申请未找到' })
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.collaborationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新合作申请信息' })
  @ApiParam({ name: 'id', description: '申请ID' })
  @ApiResponse({ status: 200, description: '申请更新成功', type: CollaborationApplication })
  @ApiResponse({ status: 404, description: '申请未找到' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  update(@Param('id', ParseIntPipe) id: string, @Body() updateDto: UpdateCollaborationApplicationDto) {
    return this.collaborationService.update(id, updateDto);
  }

  @Patch(':id/contacted')
  @ApiOperation({ summary: '标记为已联系' })
  @ApiParam({ name: 'id', description: '申请ID' })
  @ApiResponse({ status: 200, description: '标记成功', type: CollaborationApplication })
  @ApiResponse({ status: 404, description: '申请未找到' })
  markAsContacted(@Param('id', ParseIntPipe) id: string) {
    return this.collaborationService.markAsContacted(id);
  }

  @Patch(':id/resolved')
  @ApiOperation({ summary: '标记为已解决' })
  @ApiParam({ name: 'id', description: '申请ID' })
  @ApiResponse({ status: 200, description: '标记成功', type: CollaborationApplication })
  @ApiResponse({ status: 404, description: '申请未找到' })
  markAsResolved(@Param('id', ParseIntPipe) id: string) {
    return this.collaborationService.markAsResolved(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除合作申请' })
  @ApiParam({ name: 'id', description: '申请ID' })
  @ApiResponse({ status: 204, description: '申请删除成功' })
  @ApiResponse({ status: 404, description: '申请未找到' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.collaborationService.remove(id);
  }
}
