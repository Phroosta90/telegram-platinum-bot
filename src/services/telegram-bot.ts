import TelegramBot from "node-telegram-bot-api";
import { PSNProfilesScraper } from "./psnprofiles-scraper";
import { GameSearchResult } from "../types";

export class PlatinumBot {
  private bot: TelegramBot;
  private scraper: PSNProfilesScraper;
  private searchCache: Map<number, GameSearchResult[]> = new Map();

  constructor(token: string) {
    this.bot = new TelegramBot(token, { polling: true });
    this.scraper = new PSNProfilesScraper();
  }

  start() {
    console.log('Bot avviato');

    this.scraper.init();

    this.bot.onText(/\/start/, (msg) => {
      this.handleStart(msg);
    });

    this.bot.onText(/\/help/, (msg) => {
      this.handleHelp(msg);
    });

    this.bot.onText(/\/platino(.*)/, (msg, match) => {
      const gameTitle = match?.at(1)?.trim();
      this.handlePlatinum(msg, gameTitle || '');
    });

    this.bot.on('callback_query', (query) => {
      this.handleGameSelection(query);
    });
  }

  private handleStart(msg: TelegramBot.Message): void {
    const welcomeText = `
    👋 Benvenuto nel *Platinum Guide Bot*!

    Usa /platino <nome gioco> per cercare guide platino su PSNProfiles.

    Scrivi /help per vedere tutti i comandi disponibili.
      `;
    this.bot.sendMessage(msg.chat.id, welcomeText, { parse_mode: 'Markdown' });
  }

  private handleHelp(msg: TelegramBot.Message): void {
    const helpText = `
📚 *Comandi disponibili:*

    /platino <nome gioco> - Cerca guida platino
    /recenti - Ultime ricerche
    /preferiti - I tuoi giochi preferiti
    /help - Mostra questo messaggio
      `;

    this.bot.sendMessage(msg.chat.id, helpText, { parse_mode: 'Markdown' });
  }

  private async handlePlatinum(msg: TelegramBot.Message, gameTitle: string): Promise<void> {
    if (!gameTitle || gameTitle === '') {
      const missingTitleText = '*Ricordati di inserire un titolo dopo /platino!*';
      this.bot.sendMessage(msg.chat.id, missingTitleText, {parse_mode: 'Markdown'});
      return;
    }

    const searchingMsg = await this.bot.sendMessage(
      msg.chat.id, 
      `🔍 Cerco "${gameTitle}"...`
    );

    const games: GameSearchResult[] = await this.scraper.searchGame(gameTitle);

    await this.bot.deleteMessage(msg.chat.id, searchingMsg.message_id);

    if (games && games.length > 0) {
      const displayGames = games.slice(0, 10);

      this.searchCache.set(msg.chat.id, displayGames);

      const keyboard = displayGames.map((game, index) => [{
        text: `${index + 1}. ${game.title}`,
        callback_data: `game_${index}`
      }]);

      this.bot.sendMessage(msg.chat.id,
        `📊 Ho trovato ${games.length} giochi, ecco i primi ${displayGames.length}:`,
        {
          reply_markup: {
            inline_keyboard: keyboard
          }
        }
      );
    } else {
      this.bot.sendMessage(msg.chat.id, '*Nessun gioco trovato!*', {parse_mode: 'Markdown'});
    }
  }

  private handleGameSelection(query: TelegramBot.CallbackQuery): void {
    const chatId = query.message!.chat.id;
    const data = query.data;

    const index = parseInt(data!.split('_')[1]);

    const games = this.searchCache.get(chatId);

    if (games && games[index]) {
      const selectedGame = games[index];

      this.bot.sendMessage(chatId,
        `✅ *${selectedGame.title}*\n\n🔗 ${selectedGame.url}`,
        { parse_mode: 'Markdown' }
      );

      this.bot.answerCallbackQuery(query.id);
    }
  }
}