import { neon } from '@neondatabase/serverless';

let _sql: ReturnType<typeof neon> | null = null;

function getSQL(): ReturnType<typeof neon> {
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL!);
  }
  return _sql;
}

// Tagged template function that lazily initializes the Neon connection.
// Uses a Proxy so the connection is not established at module import time
// (which would fail during Next.js build when DATABASE_URL is not available).
export const sql = new Proxy(
  function () {} as unknown as ReturnType<typeof neon>,
  {
    apply(_target: any, _thisArg: any, args: any[]) {
      const realSql = getSQL();
      return (realSql as any).apply(null, args);
    },
  }
) as unknown as (strings: TemplateStringsArray, ...values: any[]) => Promise<Record<string, any>[]>;
