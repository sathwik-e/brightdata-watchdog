import { NextResponse } from 'next/server';
import { ScraperPayload } from '@/types/scraper';
import { saveItems } from '@/lib/storage';

/**
 * POST /api/ingest
 *
 * Receives webhook payloads from Bright Data Scraper Studio,
 * validates the shape, and persists items to the local JSON store.
 */
export async function POST(request: Request) {
  try {
    const payload: ScraperPayload = await request.json();

    // Bright Data's "Test Webhook" button sends empty dummy payloads.
    // Return 200 so the connectivity check passes.
    if (!payload?.data) {
      return NextResponse.json(
        { message: 'Webhook connected successfully' },
        { status: 200 },
      );
    }

    await saveItems(payload.data);

    return NextResponse.json(
      {
        message: 'Data ingested successfully',
        itemsProcessed: payload.data.length,
        runId: payload.metadata?.runId ?? 'unknown',
      },
      { status: 200 },
    );
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 },
    );
  }
}
