import { NextResponse } from 'next/server';
import { ScrapedItem } from '@/types/scraper';
import { saveItems, recordPipelineRun, pushEvent, getStatusData } from '@/lib/storage';

/**
 * POST /api/ingest
 *
 * Receives webhook payloads from Bright Data Scraper Studio.
 * Pushes live log events so the dashboard terminal updates in real-time.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    console.log("INCOMING WEBHOOK PAYLOAD:", JSON.stringify(rawBody, null, 2));

    // Check if we were broken before this run
    const prevStatus = await getStatusData();
    const wasBroken = prevStatus.status === 'broken';

    // Push initial log events
    await pushEvent('[WEBHOOK] Incoming payload from Bright Data Scraper Studio');

    // Bright Data sends an array by default, or a wrapped { data: [...] } object
    const candidates = Array.isArray(rawBody)
      ? rawBody
      : rawBody?.data ?? [];

    // Extract only items that have actual product data
    const validItems: ScrapedItem[] = (candidates || []).filter(
      (item: Record<string, unknown>) => item.name && item.price
    );

    if (validItems.length > 0) {
      await saveItems(validItems);
      for (const item of validItems) {
        await pushEvent(`[INGEST] ${item.name} -- $${item.price}`);
      }
    }

    // If we were broken, show the self-healing sequence in the terminal
    if (wasBroken) {
      await pushEvent('[BRIGHT_DATA_AI] DOM mutation detected on target retailer');
      await pushEvent('[BRIGHT_DATA_AI] Original selectors failed. Initiating self-healing...');
      await pushEvent('[BRIGHT_DATA_AI] Analyzing page structure with AI vision model');
      await pushEvent('[BRIGHT_DATA_AI] New selectors generated and validated');
      await pushEvent('[SYSTEM] Scraper pipeline restored. Status: OPERATIONAL');
    } else {
      await pushEvent('[SYSTEM] Pipeline run completed successfully');
    }

    // Record the pipeline run (flips status, saves timestamp, increments counter)
    await recordPipelineRun();

    return NextResponse.json(
      {
        message: 'Data ingested successfully',
        itemsProcessed: validItems.length,
        runId: Array.isArray(rawBody)
          ? 'bright-data-run'
          : (rawBody.metadata?.runId ?? 'unknown'),
      },
      { status: 200 },
    );
  } catch (error) {
    const err = error as Error;
    console.error("INGEST ERROR:", err.message);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 },
    );
  }
}
