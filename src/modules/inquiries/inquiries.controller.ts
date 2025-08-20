import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto, UpdateInquiryDto, InquiryQueryDto } from './dto/create-inquiry.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Inquiry } from '../../core/entities/inquiry.entity';

@ApiTags('inquiries')
@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Post()
  @ApiOperation({ summary: '创建新咨询' })
  @ApiResponse({
    status: 201,
    description: '咨询创建成功',
    type: Inquiry,
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
  })
  create(@Body() createInquiryDto: CreateInquiryDto) {
    return this.inquiriesService.create(createInquiryDto);
  }

  @Get()
  @ApiOperation({ summary: '获取咨询列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'collaborationType', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: '返回咨询列表',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Inquiry' } },
        count: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  findAll(@Query() query: InquiryQueryDto) {
    return this.inquiriesService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取咨询统计' })
  @ApiResponse({
    status: 200,
    description: '返回咨询统计数据',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        new: { type: 'number' },
        contacted: { type: 'number' },
        resolved: { type: 'number' },
        byCollaborationType: {
          type: 'object',
          additionalProperties: { type: 'number' },
        },
      },
    },
  })
  getStats() {
    return this.inquiriesService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取咨询详情' })
  @ApiParam({ name: 'id', description: '咨询ID' })
  @ApiResponse({
    status: 200,
    description: '返回咨询详情',
    type: Inquiry,
  })
  @ApiResponse({
    status: 404,
    description: '咨询未找到',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inquiriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新咨询信息' })
  @ApiParam({ name: 'id', description: '咨询ID' })
  @ApiResponse({
    status: 200,
    description: '咨询更新成功',
    type: Inquiry,
  })
  @ApiResponse({
    status: 404,
    description: '咨询未找到',
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateInquiryDto: UpdateInquiryDto) {
    return this.inquiriesService.update(id, updateInquiryDto);
  }

  @Patch(':id/contacted')
  @ApiOperation({ summary: '标记为已联系' })
  @ApiParam({ name: 'id', description: '咨询ID' })
  @ApiResponse({
    status: 200,
    description: '标记成功',
    type: Inquiry,
  })
  @ApiResponse({
    status: 404,
    description: '咨询未找到',
  })
  markAsContacted(@Param('id', ParseIntPipe) id: number) {
    return this.inquiriesService.markAsContacted(id);
  }

  @Patch(':id/resolved')
  @ApiOperation({ summary: '标记为已解决' })
  @ApiParam({ name: 'id', description: '咨询ID' })
  @ApiResponse({
    status: 200,
    description: '标记成功',
    type: Inquiry,
  })
  @ApiResponse({
    status: 404,
    description: '咨询未找到',
  })
  markAsResolved(@Param('id', ParseIntPipe) id: number) {
    return this.inquiriesService.markAsResolved(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除咨询' })
  @ApiParam({ name: 'id', description: '咨询ID' })
  @ApiResponse({
    status: 204,
    description: '咨询删除成功',
  })
  @ApiResponse({
    status: 404,
    description: '咨询未找到',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inquiriesService.remove(id);
  }
}
