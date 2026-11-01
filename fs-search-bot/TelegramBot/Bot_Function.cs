using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.ReplyMarkups;
using Telegram.Bot.Types.Enums;
using System.Threading.Tasks;
using System.Text.Json;

namespace Bot_Function
{
    public static class BotMethods
    {
        public static string MiniAppUrl { get; set; } = "";

        public static async Task HandleUpdateAsync(ITelegramBotClient bot, Update update)
        {
            
            if (update.Type != UpdateType.Message || update.Message == null)
                return;

            var msg = update.Message;
            var chatId = msg.Chat.Id; // chatId для сообщений
            var webAppUrl = string.IsNullOrWhiteSpace(MiniAppUrl)
                ? "https://eg0r112.github.io/mini_app_funsun/"
                : MiniAppUrl;
            
            var menuButton = new MenuButtonWebApp
            {
                Text = "FUN&SUN",
                WebApp = new WebAppInfo(webAppUrl)
            };

            // Устанавливаем глобально для всех пользователей (chatId = null)
            await bot.SetChatMenuButton(chatId: null, menuButton);

            if (msg.Text == "/start")
            {
                var inlineKeyboard = new InlineKeyboardMarkup(InlineKeyboardButton.WithWebApp("FUN&SUN", new WebAppInfo(webAppUrl)));

                await bot.SendMessage(
                    chatId,
                    $"Привет, {msg.From?.FirstName}! 👋\nДобро пожаловать в FUN&SUN!\n\nНажмите кнопку ниже для поиска туров:",
                    replyMarkup: inlineKeyboard
                );

                return;
            }
        }
    }
    
    // Модель для данных из Web App
    public class WebAppDataModel
    {
        public string SearchQuery { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Timestamp { get; set; } = string.Empty;
        public bool Test { get; set; } = false;
    }
}