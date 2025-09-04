import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('应用') // 在 Swagger 中分组
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // 新增的健康检查端点
  @Get('health')
  @ApiOperation({ summary: '健康检查', description: '检查应用是否正常运行' })
  @ApiResponse({ status: 200, description: '服务正常' })
  checkHealth() {
    return this.appService.getHealth();
  }
}
