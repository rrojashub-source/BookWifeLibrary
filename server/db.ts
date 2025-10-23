// PostgreSQL connection using standard pg driver (no WebSockets)
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log('✅ PostgreSQL connection pool initialized (using pg driver)');

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Configuración adicional para PostgreSQL local
  ssl: false, // No SSL para conexiones locales
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });
