import TelegramBot from "node-telegram-bot-api";
import { PSNProfilesScraper } from "./psnprofiles-scraper";
import { GameSearchResult } from "../types";

export class PlatinumBot {
  private bot: TelegramBot;
  private scraper: PSNProfilesScraper;
  private searchCache: Map<number, {
    games: GameSearchResult[],
    currentPage: number
  }> = new Map();

  private readonly RESULTS_PER_PAGE = 5;

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
      this.bot.sendMessage(msg.chat.id, missingTitleText, { parse_mode: 'Markdown' });
      return;
    }

    const searchingMsg = await this.bot.sendMessage(
      msg.chat.id,
      `🔍 Cerco "${gameTitle}"...`
    );

    const games: GameSearchResult[] = await this.scraper.searchGame(gameTitle);

    await this.bot.deleteMessage(msg.chat.id, searchingMsg.message_id);

    if (games && games.length > 0) {
      this.searchCache.set(msg.chat.id, {
        games: games,
        currentPage: 0
      });

      const keyboard = this.buildPaginatedKeyboard(msg.chat.id);

      this.bot.sendMessage(msg.chat.id,
        `📊 Ho trovato *${games.length} giochi*:`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: keyboard
          }
        }
      );
    } else {
      this.bot.sendMessage(msg.chat.id, '*Nessun gioco trovato!*', { parse_mode: 'Markdown' });
    }
  }

  private handleGameSelection(query: TelegramBot.CallbackQuery): void {
    const chatId = query.message!.chat.id;
    const messageId = query.message!.message_id;
    const data = query.data;

    if (data === 'noop') {
      this.bot.answerCallbackQuery(query.id);
      return;
    }

    if (data === 'next_page' || data === 'prev_page') {
      const cache = this.searchCache.get(chatId);
      if (!cache) {
        this.bot.answerCallbackQuery(query.id, { text: '❌ Ricerca scaduta, riprova!' });
        return;
      }

      cache.currentPage += (data === 'next_page' ? 1 : -1);

      const keyboard = this.buildPaginatedKeyboard(chatId);

      this.bot.editMessageReplyMarkup(
        { inline_keyboard: keyboard },
        { chat_id: chatId, message_id: messageId }
      );

      this.bot.answerCallbackQuery(query.id);
      return;
    }

    if (data?.startsWith('game_')) {
      const index = parseInt(data.split('_')[1]);
      const cache = this.searchCache.get(chatId);

      if (cache && cache.games[index]) {
        const selectedGame = cache.games[index];

        this.bot.sendMessage(chatId,
          `✅ *${selectedGame.title}*\n\n🔗 ${selectedGame.url}`,
          { parse_mode: 'Markdown' }
        );

        this.bot.answerCallbackQuery(query.id);
      } else {
        this.bot.answerCallbackQuery(query.id, { text: '❌ Gioco non trovato!' });
      }
    }
  }

  private buildPaginatedKeyboard(chatId: number): TelegramBot.InlineKeyboardButton[][] {
    const cache = this.searchCache.get(chatId);
    if (!cache) return [];

    const { games, currentPage } = cache;
    const totalPages = Math.ceil(games.length / this.RESULTS_PER_PAGE);
    const startIndex = currentPage * this.RESULTS_PER_PAGE;
    const endIndex = Math.min(startIndex + this.RESULTS_PER_PAGE, games.length);

    const gameButtons = games
      .slice(startIndex, endIndex)
      .map((game, index) => [{
        text: `${startIndex + index + 1}. ${game.title}`,
        callback_data: `game_${startIndex + index}`
      }]);

    const navButtons: TelegramBot.InlineKeyboardButton[] = [];

    if (currentPage > 0) {
      navButtons.push({ text: '⬅️ Indietro', callback_data: 'prev_page' });
    }

    navButtons.push({
      text: `📄 ${currentPage + 1}/${totalPages}`,
      callback_data: 'noop'
    });

    if (currentPage < totalPages - 1) {
      navButtons.push({ text: 'Avanti ➡️', callback_data: 'next_page' });
    }

    return [...gameButtons, navButtons];
  }
}