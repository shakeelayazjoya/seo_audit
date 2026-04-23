import { NextResponse } from 'next/server';
import { getHealthSnapshot } from '@/lib/monitoring';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const snapshot = await getHealthSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json(
      {
        database: 'error',
        error: error instanceof Error ? error.message : 'Health check failed',
        checkedAt: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
