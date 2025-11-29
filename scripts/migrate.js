/* eslint-disable @typescript-eslint/no-require-imports */
/*
  Simple migration runner for Postgres.
  Uses DATABASE_URL if set, else supports Cloud SQL socket via env vars.
*/
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
let Connector, IpAddressTypes;
try {
  ({ Connector, IpAddressTypes } = require('@google-cloud/cloud-sql-connector'));
} catch {}

async function createPool() {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    return new Pool({
      connectionString: databaseUrl,
      ssl: /sslmode=require|\?ssl=true/i.test(databaseUrl) ? { rejectUnauthorized: false } : undefined,
      max: 1,
    });
  }

  const instanceConnectionName = process.env.INSTANCE_CONNECTION_NAME;
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'postgres';

  if (!instanceConnectionName) {
    return new Pool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 5432),
      user: dbUser,
      password: dbPassword,
      database: dbName,
      max: 1,
    });
  }
  // Prefer Cloud SQL Connector if available
  if (Connector && IpAddressTypes) {
    const connector = new Connector();
    const opts = await connector.getOptions({ instanceConnectionName, ipType: IpAddressTypes.PUBLIC });
    return new Pool({ ...opts, user: dbUser, password: dbPassword, database: dbName, max: 1 });
  }
  // Fallback to mounted Unix domain socket path
  return new Pool({ host: `/cloudsql/${instanceConnectionName}`,
    user: dbUser, password: dbPassword, database: dbName, max: 1 });
}

async function main() {
  const pool = await createPool();
  const sqlPath = path.join(__dirname, 'migrate.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  try {
    await pool.query(sql);
    console.log('Migration applied');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
