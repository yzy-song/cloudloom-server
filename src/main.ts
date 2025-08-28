/*
 * @Author: yzy
 * @Date: 2025-08-20 16:35:27
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-28 09:13:51
 */
// --- 关键改动：在最顶部直接加载 .env 文件 ---
import * as dotenv from 'dotenv';
import { resolve } from 'path'; // 导入 path 模块的 resolve 方法
import { NestFactory } from '@nestjs/core'; // 提前导入 NestFactory 以便使用 NestJS 的日志系统
import { AppModule } from './app.module';

// 或者直接使用 console.log，因为 dotenv 在 NestJS Logger 初始化之前执行
console.log('--- Dotenv Debugging Started ---');

const currentWorkingDir = process.cwd();
console.log(`[DOTENV DEBUG] Current Working Directory (process.cwd()): ${currentWorkingDir}`);

const pathToEnv = resolve(currentWorkingDir, '.env');
console.log(`[DOTENV DEBUG] Resolved .env file path: ${pathToEnv}`);

// 尝试加载 .env 文件
let dotenvResult;
try {
  dotenvResult = dotenv.config({ path: pathToEnv });
  console.log(`[DOTENV DEBUG] dotenv.config() result: ${JSON.stringify(dotenvResult)}`);
  if (dotenvResult.error) {
    console.error(`[DOTENV DEBUG] Error loading .env file: ${dotenvResult.error}`);
  } else if (dotenvResult.parsed) {
    console.log(`[DOTENV DEBUG] .env parsed keys: ${Object.keys(dotenvResult.parsed).join(', ')}`);
  } else {
    console.log('[DOTENV DEBUG] dotenv.config() returned no parsed content (file might not exist or be empty).');
  }
} catch (e) {
  console.error(`[DOTENV DEBUG] Exception during dotenv.config(): ${e.message}`);
}

// 确保在 NestFactory.create 之前加载环境变量
// 再次检查关键环境变量的值
console.log(`[DOTENV DEBUG] process.env.FIREBASE_PROJECT_ID (after dotenv): ${process.env.FIREBASE_PROJECT_ID}`);
console.log(`[DOTENV DEBUG] process.env.FIREBASE_CLIENT_EMAIL (after dotenv): ${process.env.FIREBASE_CLIENT_EMAIL}`);
console.log(`[DOTENV DEBUG] process.env.FIREBASE_PRIVATE_KEY (first 50 chars, after dotenv): ${process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.substring(0, 50) + '...' : 'N/A'}`);
console.log('--- Dotenv Debugging Ended ---');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ... (你的 CORS 配置，它应该能正常工作了)
  // 确保在 ConfigService 使用之前，process.env 已经被填充
  app.enableCors({
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [], // 避免 CORS_ORIGINS 为 undefined 导致 split 报错
    credentials: true,
  });

  app.setGlobalPrefix('api'); // 如果你设置了全局前缀

  await app.listen(3000);
}
bootstrap();
