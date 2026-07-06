import { NextResponse } from 'next/server';
import { parseGoogleRows } from '@/lib/parse';
import { fetchSheetRange } from '@/lib/sheets-fetch';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const RANGE = process.env.GOOGLE_SHEETS_GOOGLE_ADS_RANGE || 'google_ads';

export async function GET() {
  try {
    const rows = await fetchSheetRange(RANGE);
    const googleAds = parseGoogleRows(rows);
    return NextResponse.json(
      { googleAds, fetchedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
