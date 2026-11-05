import { Pool, QueryResult, QueryResultRow } from "pg";

// Prevent multiple Pool instances in development due to Next.js HMR
declare global {
  var __postgres_pool__: Pool | undefined;
}

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres@localhost:5432/occocore_db?schema=public";

export const pool: Pool =
  global.__postgres_pool__ ||
  new Pool({
    connectionString,
    max: 20, // Max concurrent clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 5000, // Return an error after 5s if connection cannot be established
  });

if (process.env.NODE_ENV !== "production") {
  global.__postgres_pool__ = pool;
}

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
});

/**
 * Execute a parameterized native SQL query against PostgreSQL.
 *
 * @example
 * const res = await query<{ id: string; name: string }>(
 *   "SELECT id, name FROM tenants WHERE slug = $1",
 *   ["apexacademy"]
 * );
 */
export async function query<R extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<R>> {
  const start = Date.now();
  try {
    const res = await pool.query<R>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === "development" && duration > 100) {
      console.log(`[PostgreSQL slow query (${duration}ms)]:`, text);
    }
    return res;
  } catch (error) {
    console.error("[PostgreSQL Query Error]:", { text, params, error });
    throw error;
  }
}

/**
 * Get a dedicated client from the pool for multi-query atomic transactions.
 */
export async function getClient() {
  const client = await pool.connect();
  return client;
}

export default pool;
