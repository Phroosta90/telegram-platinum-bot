import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';
import { GameSearchResult } from "../types";
import { Browser } from 'puppeteer';

puppeteer.use(StealthPlugin());

export class PSNProfilesScraper {
  private baseUrl = 'https://psnprofiles.com';
  private browser: Browser | null = null;

  async init() {
    if (!this.browser) {
      console.log('🚀 Avvio browser con stealth mode...');
      this.browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });
      console.log('✅ Browser pronto');
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async searchGame(query: string): Promise<GameSearchResult[]> {
    try {
      await this.init();
      const searchUrl = `${this.baseUrl}/search/guides?q=${encodeURIComponent(query)}`;

      const page = await this.browser!.newPage();
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 2000));

      const html = await page?.content();

      await page.close();

      const $ = cheerio.load(html!);
      const results: GameSearchResult[] = [];

      $('div.guide-page-info a[href^="/guide/"]').each((index, element) => {
        const title = $(element).find('h3.ellipsis span').text().trim();
        const url = this.baseUrl + $(element).attr('href');

        results.push({ title, url });
      });

      return results;
    } catch (error) {
      console.error('Errore durante lo scraping:', error);
      return [];
    }
  }
}