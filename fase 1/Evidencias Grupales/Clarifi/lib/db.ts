import { Pool } from 'pg';

declare const process: {
  env: {
    DATABASE_URL?: string;
    PGHOST?: string;
    PGPORT?: string;
    PGDATABASE?: string;
    PGUSER?: string;
    PGPASSWORD?: string;
    NODE_ENV?: string;
  };
};

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
