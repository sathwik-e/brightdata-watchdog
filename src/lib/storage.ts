import { promises as fs } from 'fs';
import path from 'path';
import { ScrapedItem } from '@/types/scraper';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const STATUS_FILE = path.join(DATA_DIR, 'status.json');

// ---------------------------------------------------------------------------
// Seed data used when db.json does not yet exist.
// ---------------------------------------------------------------------------
const SEED_DATA: ScrapedItem[] = [
  {
    id: 'item-001',
    url: 'https://example.com/item/1',
    name: 'Honda EU2200i Portable Generator',
    price: 1450.0,
    originalPrice: 899.0,
    inStock: true,
    retailer: 'HardwareDepot',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'item-002',
    url: 'https://example.com/item/2',
    name: 'Aquafina Purified Water 24-Pack',
    price: 38.5,
    originalPrice: 12.99,
    inStock: true,
    retailer: 'QuickMart Online',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'item-003',
    url: 'https://example.com/item/3',
    name: 'Plywood Sheets (4x8, 1/2 in.)',
    price: 85.5,
    originalPrice: 22.0,
    inStock: false,
    retailer: 'BuildIt Supply',
    timestamp: new Date().toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Status shape
// ---------------------------------------------------------------------------

export type SystemStatus = 'healthy' | 'healing' | 'broken';

export interface LogEvent {
  time: string;
  message: string;
}

export interface StatusData {
  status: SystemStatus;
  lastRun: string | null;
  healingEvents: number;
  events: LogEvent[];
}

const DEFAULT_STATUS: StatusData = {
  status: 'healthy',
  lastRun: null,
  healingEvents: 0,
  events: [],
};

// ---------------------------------------------------------------------------
// Database helpers
// ---------------------------------------------------------------------------

/** Ensure the data directory and db.json file exist. */
async function ensureDb(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify(SEED_DATA, null, 2));
  }
}

/** Append incoming webhook items to the persistent store. */
export async function saveItems(items: ScrapedItem[]): Promise<void> {
  await ensureDb();

  const raw = await fs.readFile(DB_FILE, 'utf-8');
  const existing: ScrapedItem[] = JSON.parse(raw);
  const merged = [...existing, ...items];

  await fs.writeFile(DB_FILE, JSON.stringify(merged, null, 2));
}

/** Read every item currently stored in db.json. */
export async function getItems(): Promise<ScrapedItem[]> {
  await ensureDb();

  const raw = await fs.readFile(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

/** Ensure status.json exists with the full shape */
async function ensureStatus(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(STATUS_FILE);
    // Migrate old format if needed
    const raw = await fs.readFile(STATUS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (!('events' in data)) {
      const migrated: StatusData = {
        status: data.status ?? 'healthy',
        lastRun: data.lastRun ?? null,
        healingEvents: data.healingEvents ?? 0,
        events: data.events ?? [],
      };
      await fs.writeFile(STATUS_FILE, JSON.stringify(migrated, null, 2));
    }
  } catch {
    await fs.writeFile(STATUS_FILE, JSON.stringify(DEFAULT_STATUS, null, 2));
  }
}

/** Get the full status data object */
export async function getStatusData(): Promise<StatusData> {
  await ensureStatus();
  const raw = await fs.readFile(STATUS_FILE, 'utf-8');
  return JSON.parse(raw) as StatusData;
}

/** Get current scraper status (backwards compat) */
export async function getStatus(): Promise<SystemStatus> {
  const data = await getStatusData();
  return data.status;
}

/** Update scraper status */
export async function setStatus(status: SystemStatus): Promise<void> {
  await ensureStatus();
  const raw = await fs.readFile(STATUS_FILE, 'utf-8');
  const data = JSON.parse(raw) as StatusData;
  data.status = status;
  await fs.writeFile(STATUS_FILE, JSON.stringify(data, null, 2));
}

/** Push a log event to the events array (keeps last 30 entries) */
export async function pushEvent(message: string): Promise<void> {
  await ensureStatus();
  const raw = await fs.readFile(STATUS_FILE, 'utf-8');
  const data = JSON.parse(raw) as StatusData;
  data.events.push({
    time: new Date().toISOString(),
    message,
  });
  // Keep only the last 30 events to prevent bloat
  if (data.events.length > 30) {
    data.events = data.events.slice(-30);
  }
  await fs.writeFile(STATUS_FILE, JSON.stringify(data, null, 2));
}

/** Record a successful pipeline run -- updates timestamp and increments healing count */
export async function recordPipelineRun(): Promise<void> {
  await ensureStatus();
  const raw = await fs.readFile(STATUS_FILE, 'utf-8');
  const data = JSON.parse(raw) as StatusData;

  const wasBroken = data.status === 'broken';

  data.status = 'healthy';
  data.lastRun = new Date().toISOString();
  if (wasBroken) {
    data.healingEvents = (data.healingEvents || 0) + 1;
  }

  await fs.writeFile(STATUS_FILE, JSON.stringify(data, null, 2));
}
