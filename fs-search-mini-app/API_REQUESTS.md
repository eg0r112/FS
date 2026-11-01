# API Запросы для fs-search-mini-app

## 🔑 Авторизация

### 1. Регистрация (sign-up-buyer-short)
- **URL**: `https://auth2.fstravel.com/api/v1/account/sign-up-buyer-short`
- **Метод**: POST
- **Content-Type**: `application/x-www-form-urlencoded`
- **Заголовки**: `X-User-Agent: mopsapp_b2c_ru`
- **Параметры**:
  - `email`: string
  - `phoneNumber`: string
  - `grant_type`: `client_credentials`
  - `clientId`: `b2c:ru`
- **Ответ**: `{ email, password, userId }`
- **Статус**: ✅ Работает

### 2. Получение Bearer токена (signIn)
- **URL**: `https://apigate.fstravel.com/api/auth2/token/by-email`
- **Метод**: POST
- **Content-Type**: `application/x-www-form-urlencoded`
- **Заголовки**: `X-User-Agent: mopsapp_b2c_ru`
- **Параметры**:
  - `email`: string
  - `password`: string
  - `grant_type`: `client_credentials`
- **Ответ**: `{ token_type, access_token, expires_in }`
- **⚠️ ОБЯЗАТЕЛЬНО**: Токен нужен для всех последующих запросов
- **Статус**: ❌ Антибот защита (servicepipe.ru) - возвращает HTML вместо JSON
- **См. также**: `ANTIBOT_PROTECTION_ISSUE.md`

## 📦 Корзина и бронирование

### 3. Создание preorder (MindBox)
- **URL**: `https://apigate.fstravel.com/api/v1/order/preorder`
- **Метод**: POST
- **Content-Type**: `application/json`
- **Заголовки**: 
  - `X-User-Agent: mopsapp_b2c_ru`
  - `Authorization: {token_type} {access_token}` (опционально)
- **Статус**: ❌ Антибот защита (servicepipe.ru)

### 4. Создание/обновление корзины (createOrUpdate)
- **URL**: `https://apigate.fstravel.com/api/v2/Draft/createOrUpdate`
- **Метод**: POST
- **Content-Type**: `application/json`
- **Заголовки**: 
  - `X-User-Agent: mopsapp_b2c_ru`
  - `Authorization: {token_type} {access_token}` (обязательно)
- **Статус**: ❌ Антибот защита (servicepipe.ru)

### 5. Бронирование (reserve)
- **URL**: `https://apigate.fstravel.com/api/Draft/reserve`
- **Метод**: POST
- **Content-Type**: `application/json`
- **Заголовки**: 
  - `X-User-Agent: mopsapp_b2c_ru`
  - `Authorization: {token_type} {access_token}` (обязательно)
- **Параметры**: `{ draftId: string }`
- **Статус**: ❌ Антибот защита (servicepipe.ru)

### 6. Проверка статуса (status)
- **URL**: `https://apigate.fstravel.com/api/Draft/status`
- **Метод**: GET
- **Заголовки**: 
  - `X-User-Agent: mopsapp_b2c_ru`
  - `Authorization: {token_type} {access_token}` (обязательно)
- **Параметры**: `?draftId={draftId}`
- **Статус**: ❌ Антибот защита (servicepipe.ru)

### 7. Создание платежа (createPaymentBooking)
- **URL**: `https://booking.funsun.ru/api-booking/customer/payment`
- **Метод**: POST
- **Content-Type**: `application/json`
- **Заголовки**: `X-User-Agent: mopsapp_b2c_ru`
- **Статус**: ✅ Работает (через booking API)

## 🎁 Дополнительные услуги

### 8. Получение пакета (GetPacket)
- **URL**: `https://apigate.fstravel.com/api/PacketTour/GetPacket`
- **Метод**: POST
- **Content-Type**: `application/json`
- **Заголовки**: `X-User-Agent: mopsapp_b2c_ru`
- **Параметры**: `{ claim: string, clientId: 'b2c:ru' }`
- **Статус**: ❌ Антибот защита (servicepipe.ru)

### 9. Проверка резервирования (CheckReservation)
- **URL**: `https://apigate.fstravel.com/api/PacketTour/CheckReservation`
- **Метод**: POST
- **Content-Type**: `application/json`
- **Заголовки**: `X-User-Agent: mopsapp_b2c_ru`
- **Статус**: ❌ Антибот защита (servicepipe.ru)

### 10. Уточнение цены (GetReservationPrice)
- **URL**: `https://apigate.fstravel.com/api/PacketTour/GetReservationPrice`
- **Метод**: POST
- **Content-Type**: `application/json`
- **Заголовки**: `X-User-Agent: mopsapp_b2c_ru`
- **Статус**: ❌ Антибот защита (servicepipe.ru)

### 11. Изменение услуги (ChangeService)
- **URL**: `https://apigate.fstravel.com/api/PacketTour/ChangeService`
- **Метод**: POST
- **Content-Type**: `application/json`
- **Заголовки**: `X-User-Agent: mopsapp_b2c_ru`
- **Параметры**: `{ claim: { claimDocument, notes }, clientId: 'b2c:ru', userAgent: 'mopsapp_b2c_ru' }`
- **Статус**: ❌ Антибот защита (servicepipe.ru)

## 🏨 Информация об отелях

### 12. Получение туров по отелям (GetByHotels)
- **URL**: `https://apigate.fstravel.com/api/Tours/GetByHotels`
- **Метод**: POST/GET (нужно уточнить)
- **Назначение**: Получение информации по конкретному отелю (цены и т.д.)
- **Статус**: ✅ Реализовано в `tour-details.ts` как `getTourOffersByHotels()`

## 🔴 Проблема с антибот защитой и CORS

### Причина
- В booking все запросы идут через Laravel бэкенд, который проксирует запросы к API (нет CORS и антибот проблем)
- В fs-search-mini-app запросы идут напрямую к API
- API защищен антибот системой **servicepipe.ru**, которая блокирует запросы не из браузера
- Возвращается HTML страница с проверкой вместо JSON ответа

**Подробности**: См. `ANTIBOT_PROTECTION_ISSUE.md`

### Решение

#### Вариант 1: Настроить CORS на стороне API (рекомендуется)
Нужно настроить CORS на серверах:
- `apigate.fstravel.com`
- `stage-apigate.fstravel.com`

**Требуемые настройки**:
- **Allowed Origins**: `https://fs-search-mini-app.netlify.app`
- **Allowed Methods**: GET, POST, PUT, OPTIONS
- **Allowed Headers**: 
  - `Authorization`
  - `Content-Type`
  - `X-User-Agent`
  - `X-TUI-ClientId`
  - `Accept`
  - `Accept-Language`
- **Exposed Headers**: все необходимые заголовки ответа
- **Allow Credentials**: true (если используются cookies)

#### Вариант 2: Создать прокси-сервер
Создать Node.js/Express сервер, который будет проксировать запросы:
```javascript
// Пример прокси-сервера
app.post('/api/proxy/*', async (req, res) => {
  const targetUrl = req.url.replace('/api/proxy', 'https://apigate.fstravel.com')
  const response = await axios.post(targetUrl, req.body, {
    headers: {
      ...req.headers,
      'X-User-Agent': 'mopsapp_b2c_ru'
    }
  })
  res.json(response.data)
})
```

#### Вариант 3: Использовать существующий бэкенд
Если есть доступ к booking бэкенду, можно добавить роуты для проксирования запросов.

## 📝 Stage окружение

Для stage окружения используйте:
- `https://stage-apigate.fstravel.com` вместо `https://apigate.fstravel.com`

Все запросы аналогичны, только меняется базовый URL.

## ✅ Реализованные функции

Все функции реализованы в:
- `src/api/auth.ts` - авторизация
- `src/api/booking.ts` - корзина, бронирование, доп услуги
- `src/api/payment.ts` - платежи
- `src/api/tour-details.ts` - информация об отелях

