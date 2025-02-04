import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '1234',
  database: 'bazar_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // This will automatically create tables
  autoLoadEntities: true,
  logging: true,
}; 