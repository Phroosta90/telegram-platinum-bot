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
      console.log('🚀 Avvio browser Chromium...');
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled'
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
      console.log('🔍 Searching:', searchUrl);

      const page = await this.browser!.newPage();
      console.log('📄 New page created');

      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      console.log('✅ Page loaded');

      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('⏱️ Delay completed');

      const html = await page?.content();
      console.log('📝 HTML length:', html.length);

      await page.close();

      const $ = cheerio.load(html!);
      const results: GameSearchResult[] = [];

      $('div.guide-page-info a[href^="/guide/"]').each((index, element) => {
        const title = $(element).find('h3.ellipsis span').text().trim();
        const url = this.baseUrl + $(element).attr('href');

        results.push({ title, url });
      });

      console.log(`✅ Found ${results.length} results`);
      return results;
    } catch (error) {
      console.error('❌ Scraper error:', error);
      return [];
    }
  }
}