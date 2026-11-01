using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;
using Telegram.Bot;
using Telegram.Bot.Polling;
using Telegram.Bot.Types;
using Bot_Function;

namespace TelegramBotApi
{
    public class TelegramBotHostedService : IHostedService
    {
        private readonly ILogger<TelegramBotHostedService> _logger;
        private readonly string _token;
        private ITelegramBotClient? _botClient;
        private CancellationTokenSource _cts;

        public TelegramBotHostedService(ILogger<TelegramBotHostedService> logger, IConfiguration config)
        {
            _logger = logger;
            _cts = new CancellationTokenSource();
            _token = config["TelegramBotToken"]
                ?? Environment.GetEnvironmentVariable("TELEGRAM_BOT_TOKEN")
                ?? "";
            BotMethods.MiniAppUrl = NormalizeMiniAppUrl(
                config["MiniAppUrl"]
                ?? Environment.GetEnvironmentVariable("MINI_APP_URL")
                ?? "");
        }

        private static string NormalizeMiniAppUrl(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return "";
            if (!url.StartsWith("http://", StringComparison.OrdinalIgnoreCase)
                && !url.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                url = "https://" + url;
            }
            return url.TrimEnd('/') + "/";
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Starting Telegram bot...");

            if (string.IsNullOrWhiteSpace(_token))
            {
                _logger.LogWarning("TelegramBotToken не задан — бот не стартует, HTTP API работает");
                return;
            }

            _botClient = new TelegramBotClient(_token);

            try
            {
                var me = await _botClient.GetMeAsync(cancellationToken);
                _logger.LogInformation($"Bot @{me.Username} started.");
                Console.WriteLine($"Бот запущен: @{me.Username} (ID: {me.Id})");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при запуске бота — API всё равно поднимаем");
                Console.WriteLine($"ОШИБКА при запуске бота: {ex.Message}");
                return;
            }

            var receiverOptions = new ReceiverOptions
            {
                AllowedUpdates = null // Получаем все типы обновлений
            };

            Console.WriteLine("Начинаем получение обновлений...");
            Console.WriteLine($"AllowedUpdates: {receiverOptions.AllowedUpdates?.Length ?? 0} типов");
            
            _botClient.StartReceiving(
                HandleUpdateAsync,
                HandlePollingErrorAsync,
                receiverOptions,
                _cts.Token
            );
            
            Console.WriteLine("Polling запущен успешно!");
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Stopping Telegram bot...");
            _cts.Cancel();
            return Task.CompletedTask;
        }

        private async Task HandleUpdateAsync(ITelegramBotClient bot, Update update, CancellationToken token)
        {
            // Console.WriteLine($"=== ОБРАБОТЧИК ВЫЗВАН ===");
            // Console.WriteLine($"Update ID: {update.Id}");
            // Console.WriteLine($"Update Type: {update.Type}");
            // Console.WriteLine($"Message: {update.Message != null}");
            // Console.WriteLine($"=========================");
            
            await BotMethods.HandleUpdateAsync(bot, update);
        }

        private Task HandlePollingErrorAsync(ITelegramBotClient bot, Exception exception, CancellationToken token)
        {
            _logger.LogError(exception, "Telegram polling error");
            Console.WriteLine($"ОШИБКА POLLING: {exception.Message}");
            Console.WriteLine($"Stack trace: {exception.StackTrace}");
            return Task.CompletedTask;
        }
    }
}