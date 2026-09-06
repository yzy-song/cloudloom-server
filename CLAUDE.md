# CLAUDE.md — cloudloom-server

NestJS 11 · TypeScript 5.9 · PostgreSQL + TypeORM 0.3 · JWT + Firebase OAuth · Stripe · Winston
See @package.json for up-to-date dependency versions and available scripts.

## Project architecture

```
src/
├── main.ts                    # CORS, /api prefix, raw body for /payments/webhook
├── app.module.ts              # All feature modules registered here
├── data-source.ts             # TypeORM CLI DataSource (migrations)
├── core/entities/             # 13 entities: User, Role, Product, Booking, Category, etc.
├── modules/<feature>/         # One folder per domain
│   ├── <feature>.module.ts
│   ├── <feature>.controller.ts
│   ├── <feature>.service.ts
│   └── dto/                   # create-*.dto.ts, update-*.dto.ts, index.ts (barrel)
├── filters/                   # AllExceptionsFilter (global)
├── migrations/                # TypeORM migration files
├── scripts/                   # seed-data.ts + deploy shell scripts
└── utils/logger.ts            # Winston LoggerService (scope: TRANSIENT)
```

## Module list (14 modules)

| Module | Has Controller | Auth Required | Notes |
|--------|---------------|---------------|-------|
| `auth` | yes | register/login | JWT + Firebase OAuth, token blacklist via Redis |
| `users` | yes | yes | User CRUD |
| `roles` | yes | yes | Role CRUD |
| `permissions` | yes | yes | Permission CRUD |
| `products` | yes | no (list/detail), yes (mutate) | QueryBuilder for dynamic filtering |
| `bookings` | yes | yes | Booking CRUD |
| `categories` | yes | no (read), yes (mutate) | Category CRUD |
| `collaboration-applications` | yes | — | Collaboration application CRUD |
| `notifications` | no | — | Service only |
| `payments` | yes | partial | Stripe checkout + webhook (no auth on webhook) |
| `photos` | yes | yes | Photo records |
| `survey` | yes | partial | Survey responses |
| `uploads` | yes | yes | Multer file upload to `public/uploads/` |
| `user-favorites` | yes | yes | User favorite items |

## Convention: creating a new module

When adding a new feature, follow this exact order:

1. Create DTOs in `modules/<name>/dto/` — use `class-validator` + `@ApiProperty({ description: '中文' })`
2. Create `modules/<name>/<name>.service.ts`
3. Create `modules/<name>/<name>.controller.ts` (optional)
4. Create `modules/<name>/<name>.module.ts` — always import `TypeOrmModule.forFeature([...entities])`
5. Register in `app.module.ts` imports array

## Entity rules

- **File location**: `src/core/entities/<name>.entity.ts`
- **Table name**: snake_case, `@Entity('table_name')` explicit
- **Column names**: snake_case, `@Column({ name: 'column_name' })`
- **Primary key**: `@PrimaryGeneratedColumn('uuid')` for User/Role etc., `@PrimaryGeneratedColumn()` for auto-increment
- **Timestamps**: `@CreateDateColumn({ type: 'timestamptz' })` / `@UpdateDateColumn({ type: 'timestamptz' })`
- **Sensitive fields**: `@Exclude()` from class-transformer
- **Swagger**: `@ApiProperty({ description: '...' })` on every field
- **No cascade** unless explicitly required
- **No business logic** in entities (except password hash/validate)

## Controller rules

- Path = resource name: `@Controller('products')` — the `/api` prefix is global
- **Auth guard**: always use `JwtAuthGuard` from `../auth/jwt-auth.guard`, never `AuthGuard('jwt')` directly
- **Swagger**: `@ApiTags('中文名')` on class, `@ApiOperation({ summary: '...' })` on methods
- **Don't** call `res.status().json()` — just return the data, framework handles serialization
- **Don't** try-catch in controllers — let `AllExceptionsFilter` handle errors
- **Params**: `@Param('id', ParseIntPipe)` for numeric IDs, `@Param('id')` for UUID strings

## Service rules

```typescript
@Injectable()
export class XxxService {
  private readonly logger = new Logger(XxxService.name);

  constructor(
    @InjectRepository(SomeEntity)
    private readonly someEntityRepo: Repository<SomeEntity>,
  ) {}
}
```

- **Logger**: every service gets `private readonly logger = new Logger(XxxService.name)`
- **Repository naming**: `xxxRepo` (short) or `xxxRepository` (long) — pick one and stay consistent per module
- **Log at start** of each method: `this.logger.log('description', { params })`
- **Log errors** with stack: `this.logger.error('...', error?.stack, { context })`
- **Query**: use `createQueryBuilder` for dynamic conditions, `repository.find()` for simple lookups
- **Relations**: use `relations: [...]` or `leftJoinAndSelect` in QueryBuilder

## DTO rules

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateXxxDto {
  @ApiProperty({ description: '名称', example: '示例' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: '名称至少需要2个字符' })
  name: string;
}
```

- Every field: `@ApiProperty({ description: '中文' })`
- Required: `@IsNotEmpty()`, strings: `@IsString()`, emails: `@IsEmail()`
- **Error messages in Chinese**
- `UpdateXxxDto` uses `PartialType(CreateXxxDto)` from `@nestjs/swagger`
- `dto/index.ts` must barrel-export all DTOs

## API response conventions

| Method | Return shape |
|--------|-------------|
| List | `{ data: T[], total: number }` |
| Detail | `{ data: T, message: '...' }` |
| Create | `{ data: T, message: '...' }` |
| Update | `{ data: T }` |
| Delete | `void` or `{ message: '...' }` |
| Auth | `{ data: { accessToken, user }, message: '...' }` |

Errors handled by `AllExceptionsFilter`: `{ statusCode, message, timestamp, path }`

## Imports

- No path alias (`@/`). Use **relative paths** for project imports
- `import { User } from '../../core/entities/user.entity'` — not `src/core/entities/...`
- Import order: NestJS core → third-party → @nestjs/* → project entities → project DTOs

## Database migrations

```bash
# Generate (local dev only):
npx ts-node --transpile-only ./node_modules/typeorm/cli.js migration:generate src/migrations/<Name> --dataSource src/data-source.ts

# Run (production, in deploy script):
npx ts-node --transpile-only ./node_modules/typeorm/cli.js migration:run --dataSource src/data-source.ts
```

- `synchronize: false` always (both dev and prod)
- Dev: `migrationsRun: false` (manual)
- Prod: `migrationsRun: true` (auto in deploy)

## CI/CD (GitHub Actions)

Push to `main` branch → GitHub Actions builds `dist/` → SCP to server → server runs light deploy.

**Why:** Server memory is insufficient for `nest build` (TypeScript compilation causes OOM). Build is fully offloaded to GitHub's runner.

### Workflow (`./.github/workflows/deploy.yml`)

```
GitHub Runner (ubuntu-latest):
  1. npm ci
  2. npm run build          ← 内存密集，在 CI 上执行
  3. tar.gz (dist/ + package.json + migrations/ + ecosystem.config.js)
  4. SCP → /var/www/cloudloom-server/deploy.tar.gz

Server (via SSH as ubuntu):
  1. 解压到 releases/<timestamp>/
  2. 复制 .env
  3. npm ci                  ← 仅安装依赖，不编译
  4. migration:run           ← 数据库迁移
  5. ln -nfs .../dist → current
  6. sudo -u cloudloom pm2 startOrReload  ← PM2 以 cloudloom 用户运行
  7. 清理旧版本（保留最近 5 个）
```

### Server architecture

| 角色 | 用户 | 用途 |
|------|------|------|
| 应用运行 | `cloudloom` | PM2 守护进程，应用进程 |
| 部署 | `ubuntu` | SSH 连接，文件写入，npm ci |

- `ubuntu` 已加入 `cloudloom` group，release 目录有 setgid 位
- `ubuntu` 通过 sudoers 可免密码以 `cloudloom` 身份执行 PM2 命令
- 服务器 IP: `129.225.181.19`，SSH: `ssh yzy`（PowerShell 别名 → `ssh ubuntu@129.225.181.19`）

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `SSH_PRIVATE_KEY` | 私钥 `~/.ssh/id_rsa` 的内容 |
| `SSH_HOST` | `129.225.181.19` |
| `SSH_USER` | `ubuntu` |

### Server directory structure (post-deploy)

```
/var/www/cloudloom-server/
├── current → releases/20250517120000-abc1234/dist/
├── releases/
│   ├── 20250517120000-abc1234/
│   │   ├── dist/            # 构建产物（CI 产出）
│   │   ├── node_modules/    # 服务器 npm ci 安装
│   │   ├── src/
│   │   │   ├── data-source.ts
│   │   │   └── migrations/
│   │   ├── .env
│   │   ├── package.json
│   │   └── ecosystem.config.js
│   └── ...
├── .env                     # 生产环境变量（手动管理）
├── ecosystem.config.js      # PM2 配置（每次部署更新）
└── logs/
```

### Manual deploy (备用)

```bash
# Local
npm ci && npm run build
tar -czf deploy.tar.gz dist/ package.json package-lock.json ecosystem.config.js tsconfig.json tsconfig.build.json src/data-source.ts src/migrations/
scp deploy.tar.gz ubuntu@129.225.181.19:/var/www/cloudloom-server/

# Server
ssh yzy 'cd /var/www/cloudloom-server && bash src/scripts/deploy-light.sh'
```

### Rollback

```bash
ssh yzy
cd /var/www/cloudloom-server
ls releases/                         # 查看可用版本
ln -nfs releases/<version>/dist current
sudo -u cloudloom pm2 restart cloudloom-server
```

## Environment variables

All config via `ConfigService` — never hardcode. Key vars: `DB_*`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `FIREBASE_*`, `CORS_ORIGINS`, `RATE_LIMIT_*`, `NODE_ENV`, `PORT`.

## Logging

- Winston Logger via `AppLogger` (NestJS built-in logger disabled in `main.ts`)
- `LOG_LEVEL` env controls level (default `info`)
- **Never `console.log`** — always `this.logger.log/warn/error/debug`
- **No PII in logs**: use user IDs not emails/names

## Forbidden patterns

| Don't | Do |
|-------|-----|
| `console.log(...)` | `this.logger.log(...)` |
| `@UseGuards(AuthGuard('jwt'))` | `@UseGuards(JwtAuthGuard)` |
| `import ... from 'src/...'` | Relative path `../../...` |
| `synchronize: true` (any env) | `migration:generate` + `migration:run` |
| Business logic in controller | Put it in service |
| Business logic in entity | Put it in service |
| `res.status().json()` | `return data` |
| Hardcoded config values | `ConfigService` from `.env` |
| Empty catch block | At minimum log the error |

## Before committing

- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] All new endpoints have `@UseGuards(JwtAuthGuard)` (unless intentionally public)
- [ ] User input validated via class-validator DTO
- [ ] No secrets in code (use `ConfigService`)
- [ ] Sensitive entity fields have `@Exclude()`
