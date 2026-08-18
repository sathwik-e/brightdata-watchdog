/**
 * ScrapedItem represents a single product data point
 * received from the Bright Data webhook.
 */
export interface ScrapedItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  retailer: string;
  url: string;
  inStock: boolean;
  timestamp: string;
}

/**
 * ScraperPayload is the top-level shape of the JSON body
 * sent by Bright Data Scraper Studio on webhook delivery.
 */
export interface ScraperPayload {
  data: ScrapedItem[];
  metadata: {
    runId: string;
    success: boolean;
    duration: number;
  };
}
