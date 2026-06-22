export type SheetsResponse = {
  range?: string;
  majorDimension?: string;
  values?: string[][];
  error?: { code: number; message: string; status: string };
};

export function getSheetsCredentials() {
  const apiKey =
    process.env.GOOGLE_SHEETS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
  const spreadsheetId =
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID || process.env.NEXT_PUBLIC_SPREADSHEET_ID;
  return { apiKey, spreadsheetId };
}

export async function fetchSheetRange(range: string): Promise<string[][]> {
  const { apiKey, spreadsheetId } = getSheetsCredentials();
  if (!apiKey || !spreadsheetId) {
    throw new Error(
      'Missing Google Sheets env vars (GOOGLE_SHEETS_API_KEY + GOOGLE_SHEETS_SPREADSHEET_ID).'
    );
  }
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}` +
    `/values/${encodeURIComponent(range)}` +
    `?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING` +
    `&key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, { cache: 'no-store' });
  const data = (await res.json()) as SheetsResponse;
  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? `Sheets API error ${res.status}`);
  }
  return data.values ?? [];
}
