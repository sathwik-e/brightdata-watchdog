import { NextResponse } from 'next/server';
import { getStatusData, setStatus, pushEvent, SystemStatus } from '@/lib/storage';

export async function GET() {
  const data = await getStatusData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const { status } = await request.json();
    
    if (!['healthy', 'healing', 'broken'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Push log events based on what happened
    if (status === 'broken') {
      await pushEvent('[ALERT] Retailer DOM layout change detected');
      await pushEvent('[ALERT] CSS selectors .product-price, #price-main no longer valid');
      await pushEvent('[SYSTEM] Scraper status changed to BROKEN');
      await pushEvent('[SYSTEM] Awaiting next pipeline run for AI self-healing...');
    } else if (status === 'healthy') {
      await pushEvent('[SYSTEM] Status manually set to OPERATIONAL');
    }

    await setStatus(status as SystemStatus);
    return NextResponse.json({ message: 'Status updated', status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
