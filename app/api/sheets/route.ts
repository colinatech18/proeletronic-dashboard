import { NextResponse } from 'next/server';
import { parseSheetRows } from '@/lib/parse';

export const revalidate = 60;
export const runtime = 'nodejs';

type SheetsResponse = {
  range?: string;
  majorDimension?: string;
  values?: string[][];
  error?: { code: number; message: string; status: string };
};

export async function GET() {
  const apiKey =
    process.env.GOOGLE_SHEETS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
  const spreadsheetId =
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID || process.env.NEXT_PUBLIC_SPREADSHEET_ID;
  const range =
    process.env.GOOGLE_SHEETS_RANGE ||
    process.env.NEXT_PUBLIC_SHEET_NAME ||
    'vendas_nuvemshop';

  if (!apiKey || !spreadsheetId) {
    return NextResponse.json(
      {
        error:
          'Missing Google Sheets env vars. Set GOOGLE_SHEETS_API_KEY + GOOGLE_SHEETS_SPREADSHEET_ID (or the NEXT_PUBLIC_ equivalents).',
      },
      { status: 500 }
    );
  }

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}` +
    `/values/${encodeURIComponent(range)}` +
    `?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING` +
    `&key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    const data = (await res.json()) as SheetsResponse;

    if (!res.ok || data.error) {
      return NextResponse.json(
        { error: data.error?.message ?? `Sheets API error ${res.status}` },
        { status: res.status || 500 }
      );
    }

    const orders = parseSheetRows(data.values ?? []);
    return NextResponse.json({ orders, fetchedAt: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
