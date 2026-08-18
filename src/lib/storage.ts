import { promises as fs } from 'fs';
import path from 'path';
import { ScrapedItem } from '@/types/scraper';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

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
