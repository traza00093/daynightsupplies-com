const required = [
  'NEXTAUTH_URL',
];

const dbVars = [
  'POSTGRES_URL_NON_POOLING',
  'POSTGRES_URL',
  'DATABASE_URL',
];

function hasDb() {
  return dbVars.some((k) => process.env[k] && process.env[k].trim().length > 0);
}

const missing = required.filter((k) => !process.env[k] || !process.env[k].trim());
if (!hasDb()) missing.push('DATABASE_URL or POSTGRES_URL');

if (missing.length > 0) {
  console.error('Missing required environment variables:', missing.join(', '));
  process.exit(1);
}

process.exit(0);
