# 🔧 Запрос на настройку CORS для Telegram Mini App

## Проблема

Telegram Mini App деплоится на **`https://fs-search-mini-app.netlify.app`** и делает запросы к API Gateway (`apigate.fstravel.com`), но все запросы блокируются CORS политикой.

### Симптомы:
- ❌ В DevTools видно, что запросы падают с **статусом 0** (типичный признак CORS ошибки)
- ❌ В консоли браузера нет детальной информации об ошибке (браузер скрывает CORS ошибки)
- ✅ В Postman/curl запросы работают (нет CORS ограничений)

## Требуемые настройки CORS

### Серверы, на которых нужно настроить CORS:
1. **Production**: `apigate.fstravel.com`
2. **Stage**: `stage-apigate.fstravel.com`

### Настройки CORS:

#### 1. Allowed Origins (разрешённые источники):
```
https://fs-search-mini-app.netlify.app
```

**Важно**: 
- Нужно добавить точный origin с протоколом `https://`
- Это основной production URL приложения

**Примечание о preview деплоях Netlify:**
- Netlify автоматически создает preview URL для каждого PR/ветки:
  - Deploy preview: `https://deploy-preview-{PR_NUMBER}--fs-search-mini-app.netlify.app`
  - Branch deploy: `https://{branch-name}--fs-search-mini-app.netlify.app`
- Для тестирования preview деплоев можно добавить паттерн `https://*.netlify.app` (но это менее безопасно)
- Или добавлять конкретные preview URL по мере необходимости
- **Рекомендация**: Начать с основного production URL, preview деплои добавлять при необходимости

#### 2. Allowed Methods (разрешённые методы):
```
GET
POST
PUT
OPTIONS
```

#### 3. Allowed Headers (разрешённые заголовки):
```
Authorization
Content-Type
X-User-Agent
X-TUI-ClientId
X-TUI-Storefront-Id
Accept
Accept-Language
```

#### 4. Exposed Headers (доступные заголовки ответа):
Все заголовки, которые API возвращает в ответе (для доступа через JavaScript).

#### 5. Allow Credentials:
```
true
```
(Если используются cookies или авторизация через токены)

#### 6. Max Age (для preflight запросов):
```
86400
```
(24 часа в секундах - опционально, для кэширования preflight запросов)

## Пример конфигурации

### Для Nginx:
```nginx
add_header 'Access-Control-Allow-Origin' 'https://fs-search-mini-app.netlify.app' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, OPTIONS' always;
add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, X-User-Agent, X-TUI-ClientId, X-TUI-Storefront-Id, Accept, Accept-Language' always;
add_header 'Access-Control-Allow-Credentials' 'true' always;
add_header 'Access-Control-Max-Age' '86400' always;

if ($request_method = 'OPTIONS') {
    return 204;
}
```

### Для AWS API Gateway:
```json
{
  "allowedOrigins": ["https://fs-search-mini-app.netlify.app"],
  "allowedMethods": ["GET", "POST", "PUT", "OPTIONS"],
  "allowedHeaders": [
    "Authorization",
    "Content-Type",
    "X-User-Agent",
    "X-TUI-ClientId",
    "X-TUI-Storefront-Id",
    "Accept",
    "Accept-Language"
  ],
  "allowCredentials": true,
  "maxAge": 86400
}
```

### Для ASP.NET Core:
```csharp
services.AddCors(options =>
{
    options.AddPolicy("TelegramMiniApp", policy =>
    {
        policy.WithOrigins("https://fs-search-mini-app.netlify.app")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
```

## Endpoints, которые используются

Все запросы идут к следующим endpoints:
- `POST /api/auth2/token/by-email` - получение токена
- `POST /api/v1/order/preorder` - создание preorder
- `POST /api/v2/Draft/createOrUpdate` - создание/обновление корзины
- `POST /api/Draft/reserve` - бронирование
- `GET /api/Draft/status` - проверка статуса
- `POST /api/PacketTour/GetPacket` - получение пакета тура
- `POST /api/PacketTour/CheckReservation` - проверка резервирования
- `POST /api/PacketTour/GetReservationPrice` - уточнение цены
- `POST /api/PacketTour/ChangeService` - изменение услуги
- `GET /api/geocontent/*` - получение geo объектов

## User-Agent

Все запросы отправляются с заголовком:
```
X-User-Agent: mopsapp_b2c_ru
```

## Проверка после настройки

После настройки CORS можно проверить:

1. Открыть DevTools в браузере (F12)
2. Перейти на вкладку Network
3. Выполнить запрос из мини-приложения
4. Проверить, что:
   - ✅ Запрос не блокируется (статус не 0)
   - ✅ В заголовках ответа есть `Access-Control-Allow-Origin: https://fs-search-mini-app.netlify.app`
   - ✅ OPTIONS запрос (preflight) возвращает статус 200/204

## Дополнительная информация

- **Telegram Mini App URL**: `https://fs-search-mini-app.netlify.app`
- **API Gateway Production**: `https://apigate.fstravel.com`
- **API Gateway Stage**: `https://stage-apigate.fstravel.com`
- **User-Agent**: `mopsapp_b2c_ru`

## Контакты

Если нужна дополнительная информация или помощь с настройкой, обращайтесь к команде разработки мини-приложения.

