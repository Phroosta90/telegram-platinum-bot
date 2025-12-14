# 🏆 Telegram Platinum Bot

A personal Telegram bot for quick search of PlayStation platinum trophy guides on PSNProfiles, with recent searches and favorites management.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)
![Puppeteer](https://img.shields.io/badge/Puppeteer-40B5A4?style=flat&logo=puppeteer&logoColor=white)

## ✨ Features

- 🔍 **Search platinum guides** on PSNProfiles with partial game names
- 📄 **Smart pagination** (5 results per page)
- 📚 **Recent searches** (last 10)
- ⭐ **Favorites management** (add/remove easily)
- 🤖 **Automatic Cloudflare bypass** with Puppeteer Stealth
- 💾 **SQLite database** for data persistence
- ⚡ **Inline keyboard** for intuitive navigation

## 🎮 Available Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message |
| `/help` | Show command list |
| `/platino <game name>` | Search platinum guide |
| `/recenti` | View last 10 searches |
| `/preferiti` | Manage your favorite games |

## 🚀 Demo

```
User: /platino death stranding 2

Bot: 📊 Found 20 games:

[1] Death Stranding Trophy Guide
[2] Death Stranding 2: On the Beach Trophy Guide
[3] Red Death Trophy Guide
...

[⬅️ Back]  Page 1/4  [Next ➡️]

*User selects a game*

Bot: ✅ Death Stranding 2: On the Beach
🔗 https://psnprofiles.com/guide/22717...

[⭐ Add to favorites]
```

## 🛠️ Tech Stack

- **Runtime:** Node.js v20+
- **Language:** TypeScript
- **Bot Framework:** node-telegram-bot-api
- **Web Scraping:** Puppeteer + Puppeteer-Extra-Stealth
- **HTML Parsing:** Cheerio
- **Database:** SQLite (better-sqlite3)
- **HTTP Client:** Axios
- **Environment:** dotenv

## 📦 Installation

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Telegram account

### Local Setup

1. **Clone the repository**
```bash
git clone https://github.com/Phroosta90/telegram-platinum-bot.git
cd telegram-platinum-bot
```

2. **Install dependencies**
```bash
npm install
```

3. **Create Telegram bot**
   - Open Telegram and search for `@BotFather`
   - Use `/newbot` to create a new bot
   - Copy the provided token

4. **Configure environment variables**

Create a `.env` file in the project root:

```env
# Telegram bot token (from @BotFather)
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

5. **Start the bot**

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

The bot will be active and listening on Telegram! 🎉

## 📁 Project Structure

```
telegram-platinum-bot/
├── src/
│   ├── services/
│   │   ├── telegram-bot.ts        # Main bot logic
│   │   └── psnprofiles-scraper.ts # PSNProfiles scraping
│   ├── utils/
│   │   └── database.ts            # SQLite management
│   ├── types.ts                   # TypeScript types
│   └── index.ts                   # Entry point
├── data/
│   └── bot.db                     # SQLite database (auto-generated)
├── .env                           # Environment variables (not committed)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🗄️ Database Schema

### `searches` Table
```sql
CREATE TABLE searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id INTEGER NOT NULL,
  game_title TEXT NOT NULL,
  psnprofiles_url TEXT NOT NULL,
  searched_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `favorites` Table
```sql
CREATE TABLE favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id INTEGER NOT NULL,
  game_title TEXT NOT NULL,
  psnprofiles_url TEXT NOT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(chat_id, psnprofiles_url)
);
```

## 🔧 Advanced Configuration

### Rate Limiting

The bot uses Puppeteer with intentional delays to avoid overloading PSNProfiles:

```typescript
// In psnprofiles-scraper.ts
await page.goto(searchUrl, { waitUntil: 'networkidle2' });
await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds delay
```

### Results Per Page

Modify the constant in `telegram-bot.ts`:

```typescript
private readonly RESULTS_PER_PAGE = 5; // Change this value
```

### Recent Searches Limit

Modify in `database.ts`:

```typescript
getRecentSearches(chatId: number, limit: number = 10) // Change the default
```

## 🚢 Deployment

### Deploy on Railway (Recommended)

1. **Create account on [Railway](https://railway.app)**

2. **Connect GitHub repository**
   - New Project → Deploy from GitHub repo
   - Select `telegram-platinum-bot`

3. **Add environment variables**
   - Settings → Variables
   - Add `TELEGRAM_BOT_TOKEN`

4. **Automatic deployment**
   - Railway automatically detects Node.js
   - Installs Chromium for Puppeteer
   - Starts the bot

5. **Bot always online!** 🎉

### Deploy on Render (Free)

1. **Create account on [Render](https://render.com)**

2. **New Web Service**
   - Connect repository
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Add Environment Variables**
   - `TELEGRAM_BOT_TOKEN`

4. **Deploy!**

⚠️ **Note:** Render free tier goes to sleep after 15min of inactivity. It wakes up on the first message.

## 🔒 Security

- ✅ `.env` in `.gitignore` (token never committed)
- ✅ Local SQLite database (not exposed)
- ✅ Private bot (not published in directories)
- ✅ Rate limiting for responsible scraping
- ✅ Input sanitization

## 🐛 Troubleshooting

### 403 Error from PSNProfiles

**Problem:** Cloudflare blocks requests

**Solution:** The bot uses `puppeteer-extra-plugin-stealth` to automatically bypass. If it persists:

```bash
npm install puppeteer-extra puppeteer-extra-plugin-stealth --save
```

### Chromium Not Found

**Problem:** Puppeteer can't find the browser

**Solution:** Reinstall Puppeteer

```bash
npm uninstall puppeteer
npm install puppeteer
```

### Database Locked

**Problem:** SQLite is locked by another process

**Solution:** Close all bot instances and restart

```bash
pkill -f "node.*index.ts"
npm start
```

## 📝 TODO / Future Improvements

- [ ] Scrape trophy stats from PSNProfiles
- [ ] PSN API integration for personal stats
- [ ] `/clear` command to clean search cache
- [ ] Export favorites list in readable format
- [ ] Notifications for new guides
- [ ] Bot usage statistics

## 🤝 Contributing

This is a personal project, but suggestions and feedback are always welcome!

## ⚖️ Disclaimer

This bot is intended for **personal use only**. PSNProfiles scraping is done responsibly with rate limiting and delays. Do not use this bot for commercial purposes or high traffic without PSNProfiles permission.

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

## 👤 Author

**Ale (Phroosta90)**
- GitHub: [@Phroosta90](https://github.com/Phroosta90)

## 🙏 Acknowledgments

- [PSNProfiles](https://psnprofiles.com) for the guides
- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)
- [Puppeteer](https://pptr.dev/)

---

⭐ If you found this useful, leave a star!
