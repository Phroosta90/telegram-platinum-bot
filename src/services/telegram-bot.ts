import TelegramBot from "node-telegram-bot-api";

export class PlatinumBot {
  private bot: TelegramBot;

  constructor(token: string) {
    this.bot = new TelegramBot(token, { polling: true });
  }

  start() {
    console.log('Bot avviato');

    this.bot.onText(/\/start/, (msg) => {
      this.handleStart(msg);
    });

    this.bot.onText(/\/help/, (msg) => {
      this.handleHelp(msg);
    });
  }

  private handleStart(msg: TelegramBot.Message) {
    const welcomeText = `
    👋 Benvenuto nel *Platinum Guide Bot*!

    Usa /platino <nome gioco> per cercare guide platino su PSNProfiles.

    Scrivi /help per vedere tutti i comandi disponibili.
      `;
    this.bot.sendMessage(msg.chat.id, welcomeText, { parse_mode: 'Markdown' });
  }

  private async handleHelp(msg: TelegramBot.Message) {
    const helpText = `
📚 *Comandi disponibili:*

    /platino <nome gioco> - Cerca guida platino
    /recenti - Ultime ricerche
    /preferiti - I tuoi giochi preferiti
    /help - Mostra questo messaggio
      `;

    this.bot.sendMessage(msg.chat.id, helpText, { parse_mode: 'Markdown' });
  }
}