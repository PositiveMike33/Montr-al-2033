import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool } = pg;
import * as schema from './schema.ts';

declare global {
  var _postgresPool: pg.Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST || (process.env.DOCKER_ENV ? 'stm-postgres' : '127.0.0.1'),
      port: Number(process.env.SQL_PORT || 5432),
      user: process.env.SQL_USER || 'postgres',
      password: process.env.SQL_PASSWORD || 'postgres_secure_pass',
      database: process.env.SQL_DB_NAME || 'montreal_2033',
      max: 10,
      connectionTimeoutMillis: 15000,
    });

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();
export const db = drizzle(pool, { schema });
