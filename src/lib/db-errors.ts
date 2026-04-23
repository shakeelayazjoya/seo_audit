export function getDatabaseErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('authentication failed against database server')) {
      return 'Database authentication failed. Update DATABASE_URL with valid Postgres credentials.';
    }
    if (message.includes("can't reach database server")) {
      return 'Database server is unreachable. Check that Postgres is running and DATABASE_URL is correct.';
    }
    if (message.includes('table') && message.includes('does not exist')) {
      return 'Database schema is missing. Run `npx prisma db push` after configuring Postgres.';
    }
  }

  return 'Database is unavailable. Check the Postgres connection and schema setup.';
}
