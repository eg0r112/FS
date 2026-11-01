# FUN&SUN Search

Telegram Mini App + бэкенд с ботом.

| Часть | Папка | На Render |
|---|---|---|
| Mini App (Vue) | `fs-search-mini-app` | Static Site |
| Бот + API (.NET 8) | `fs-search-bot` | Web Service (Docker) |

## Локально

```bash
cd fs-search-mini-app
npm run dev
npm run build
```

```bash
cd fs-search-bot
dotnet run
```

Токен бота: переменная `TelegramBotToken` или `TELEGRAM_BOT_TOKEN`. Не класть в git.

## Render

1. [Dashboard](https://dashboard.render.com) → **New** → **Blueprint** → репозиторий `eg0r112/FS`.
2. Подтянется `render.yaml`: статика `fs-mini-app` и Docker `fs-search-bot`.
3. В сервисе бота задай **TelegramBotToken**.
4. `MINI_APP_URL` подставится с хоста статики. Если бот открывает не тот URL — пропиши `https://<fs-mini-app>.onrender.com/`.
5. В BotFather / кнопке Mini App тот же HTTPS URL фронта.

Бесплатный Docker на Render засыпает без трафика ~15 минут — polling бота после сна надо разбудить запросом на `/health`. Для постоянной работы нужен платный инстанс.

Swagger бота: `https://<fs-search-bot>.onrender.com/swagger`.
