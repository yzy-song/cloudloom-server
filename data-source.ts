import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'cloudloom',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'dbcloudloom',
  entities: ['src/core/entities/*.entity.{ts,js}'],
  migrations: ['src/migrations/*.{ts,js}'],
  synchronize: false,
  logging: true,
});
