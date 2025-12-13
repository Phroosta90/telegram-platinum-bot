import 'dotenv/config';
import { PlatinumBot } from './services/telegram-bot';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN non trovato nel file .env');
  process.exit(1);
}

const bot = new PlatinumBot(token);
bot.start();

console.log('✅ Bot Telegram in esecuzione...');