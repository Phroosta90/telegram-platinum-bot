import Database from "better-sqlite3";
import path from 'path';
import fs from 'fs';
import { GameSearchResult } from "../types";

export class DatabaseManager {
  private db: Database.Database;

  constructor(dbPath: string = './data/bot.db') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.initTables();
  }

  private initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS searches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id INTEGER NOT NULL,
        game_title TEXT NOT NULL,
        psnprofiles_url TEXT NOT NULL,
        searched_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id INTEGER NOT NULL,
        game_title TEXT NOT NULL,
        psnprofiles_url TEXT NOT NULL,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(chat_id, psnprofiles_url)
      );
    `);
  }

  saveSearch(chatId: number, game: GameSearchResult) {
    const stmt = this.db.prepare(`
      INSERT INTO searches (chat_id, game_title, psnprofiles_url)
      VALUES (?, ?, ?)
    `);
    stmt.run(chatId, game.title, game.url)
  }

  getRecentSearches(chatId: number, limit: number = 10): GameSearchResult[] {
    const stmt = this.db.prepare(`
      SELECT game_title, psnprofiles_url 
      FROM searches 
      WHERE chat_id = ?
      ORDER BY searched_at DESC 
      LIMIT ?
    `);
    const rows = stmt.all(chatId, limit) as { game_title: string, psnprofiles_url: string }[];

    return rows.map(row => ({
      title: row.game_title,
      url: row.psnprofiles_url
    }));
  }

  addFavorite(chatId: number, game: GameSearchResult) {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO favorites (chat_id, game_title, psnprofiles_url)
      VALUES (?, ?, ?)
    `);
    stmt.run(chatId, game.title, game.url)
  }

  getFavorites(chatId: number): GameSearchResult[] {
    const stmt = this.db.prepare(`
      SELECT game_title, psnprofiles_url 
      FROM favorites 
      WHERE chat_id = ?
      ORDER BY added_at DESC
    `);
    const rows = stmt.all(chatId) as { game_title: string, psnprofiles_url: string }[];

    return rows.map(row => ({
      title: row.game_title,
      url: row.psnprofiles_url
    }));
  }

  removeFavorite(chatId: number, url: string) {
    const stmt = this.db.prepare(`
      DELETE FROM favorites
      WHERE
      chat_id = ?
      AND
      psnprofiles_url = ?
    `)
    stmt.run(chatId, url);
  }
}