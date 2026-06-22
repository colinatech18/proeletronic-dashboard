import { NextResponse } from 'next/server';
import { parseSheetRows } from '@/lib/parse';
import { fetchSheetRange } from '@/lib/sheets-fetch';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const RANGE =
  process.env.GOOGLE_SHEETS_VENDAS_RANGE ||
  process.env.GOOGLE_SHEETS_RANGE ||
  process.env.NEXT_PUBLIC_SHEET_NAME ||
  'vendas_nuvemshop';

export async function GET() {
  try {
    const rows = await fetchSheetRange(RANGE);
    const orders = parseSheetRows(rows);
    return NextResponse.json(
      { orders, fetchedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
