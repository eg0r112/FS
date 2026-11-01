# Анализ флоу бронирования: booking vs fs-search-mini-app

## Описание флоу пользователя

### Booking проект (полный флоу):
1. **Главная** → **Туры** → **Выбор тура** → **Выбор номера тура**
2. **Регистрация/Авторизация**:
   - `sign-up-buyer-short` (если новый пользователь) → возвращает `{ email, password, userId }`
   - `accountSigIn` (всегда после регистрации) → возвращает `{ token_type, access_token, expires_in }`
   - Токен сохраняется в **cookies** (`VueCookies.set('token_type_fs', ...)`, `VueCookies.set('access_token_fs', ...)`)
   - После авторизации вызывается `setCartAfterSignIn()` - переносит корзину из Redis в API (если была)
3. **Ввод данных туристов** (bookingTouristStep)
4. **Подтверждение** (bookingPayStep):
   - `fetchMindBoxPreorder` (если есть телефон) - опционально, для MindBox
   - `saveBasket` → `createOrUpdate` (`/api/v2/Draft/createOrUpdate`) - создает/обновляет корзину
   - `fetchBasketBook` → `reserve` (`/api/Draft/reserve`) - бронирует тур
   - `fetchBasketStatus` → `status` (`/api/Draft/status`) - проверяет статус бронирования
   - `fetchUserPayment` → `createPaymentBooking` - создает платеж
5. **Диалоговое окно** ("Вы будете перенаправлены...")
6. **Оплата на внешней странице**
7. **Возврат в приложение** → проверка через `fetchUserPaymentStatus` (`/pay/status`)

### fs-search-mini-app (текущая реализация):
1. **Главная** → **Туры** → **Выбор тура** → **Выбор номера тура**
2. **Регистрация/Авторизация** (AuthPage):
   - `registerUserWithoutAuth` (sign-up-buyer-short) → возвращает `{ email, password, userId }`
   - `signIn` → возвращает `{ token_type, access_token, expires_in }`
   - Токен сохраняется в **sessionStorage** (`sessionStorage.setItem('authToken', ...)`)
3. **Ввод данных туристов** (PaymentPage)
4. **Подтверждение** (PaymentPage.handlePayment):
   - `createPreorder` (если есть телефон) - опционально
   - `createOrUpdateDraft` → `/api/v2/Draft/createOrUpdate` - создает корзину
   - `reserve` → `/api/Draft/reserve` - бронирует тур
   - `getBookingStatus` → `/api/Draft/status` - проверяет статус
   - `createPaymentBooking` → создает платеж
5. **Диалоговое окно** ("Вы будете перенаправлены...")
6. **Оплата на внешней странице**
7. **Возврат в приложение** → проверка через `checkPaymentStatus` (`/pay/status`)

## Сравнение и анализ

### ✅ Правильно реализовано:

1. **Последовательность вызовов API** - полностью соответствует booking:
   - `createPreorder` (опционально) → `createOrUpdate` → `reserve` → `status` → `createPaymentBooking`
   
2. **Структура данных для createOrUpdate** - соответствует booking:
   - Используется `/api/v2/Draft/createOrUpdate`
   - Структура `CreateDraftRequest` соответствует `getBasket` из booking
   - `draftType: 'FunSun'` (как в booking)
   - `customerInfo` заполняется правильно

3. **Обработка токена авторизации**:
   - Токен передается в заголовке `Authorization: {token_type} {access_token}`
   - Используется для всех запросов к API (createOrUpdate, reserve, status)

4. **Обработка ответа signIn**:
   - Правильно извлекается `token_type` и `access_token`
   - Сохраняется в формате `{token_type} {access_token}` для использования в заголовках

### ⚠️ Потенциальные проблемы:

1. **Хранение токена в sessionStorage вместо cookies**:
   - **Booking**: использует `VueCookies` (cookies) с TTL из `expires_in`
   - **fs-search-mini-app**: использует `sessionStorage` (очищается при закрытии вкладки)
   - **Рекомендация**: Для долгосрочной авторизации лучше использовать cookies, но для Telegram Mini App sessionStorage может быть достаточным (сессия приложения)

2. **Отсутствие корзины до ввода данных туристов**:
   - **Booking**: корзина может существовать до ввода данных туристов (сохраняется в Redis для неавторизованных, переносится в API после авторизации)
   - **fs-search-mini-app**: корзина создается только при подтверждении бронирования
   - **Анализ**: Это **правильно** для вашего случая, так как вы делаете "без формирования корзины" - корзина создается только один раз перед бронированием, а не на каждом шаге

3. **createPreorder вызывается в PaymentPage, а не в AuthPage**:
   - **Booking**: `fetchMindBoxPreorder` вызывается в `saveBasket` перед `createOrUpdate`
   - **fs-search-mini-app**: `createPreorder` вызывается в `handlePayment` перед `createOrUpdateDraft`
   - **Анализ**: Это **правильно**, так как preorder нужен только перед созданием корзины, а не сразу после авторизации

4. **Отсутствие обработки ошибок при создании корзины**:
   - **Booking**: есть обработка ошибок и валидации в `saveBasket`
   - **fs-search-mini-app**: есть базовая обработка, но можно улучшить

### 🔍 Детальный анализ ответа signIn:

**Booking (accountSigIn)**:
```javascript
// booking/resources/js/store/modules/account.js
let responseAuth = await axios.post(urlAuth, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-User-Agent': ' FUNSUN' },
})
if (responseAuth.status === 200) {
    VueCookies.set('token_type_fs', responseAuth.data.token_type, responseAuth.data.expires_in)
    VueCookies.set('access_token_fs', responseAuth.data.access_token, responseAuth.data.expires_in)
}
// Затем вызывается /api/login/signin с данными токена
let response = await axios({
    url: variables.routeSigIn,
    method: 'POST',
    data: { ...responseAuth.data, post },
    headers: { 'X-User-Agent': ' FUNSUN' },
})
```

**fs-search-mini-app (signIn)**:
```typescript
// fs-search-mini-app/src/api/auth.ts
const response = await axios.post(url, params, {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-User-Agent': 'mopsapp_b2c_ru'
    }
})
if (response.status === 200) {
    return {
        token_type: response.data.token_type,
        access_token: response.data.access_token,
        expires_in: response.data.expires_in
    }
}
// В AuthPage.vue:
const signInResponse = await signIn({ email: data.email, password: data.password })
if (signInResponse) {
    const authToken = `${signInResponse.token_type} ${signInResponse.access_token}`
    sessionStorage.setItem('authToken', authToken)
}
```

**Разница**: 
- Booking делает дополнительный запрос к `/api/login/signin` (Laravel роут) после получения токена:
  - Устанавливает сессию на Laravel бэкенде
  - Вызывает `getUserInfo()` который делает запрос к `/api/auth2/user/info` для получения `userId` и `userSub`
  - Сохраняет `userId` в сессию Laravel
- fs-search-mini-app:
  - Нет Laravel бэкенда, поэтому нет запроса к `/api/login/signin`
  - Но **нужно** получить `userId` для работы с API (`createOrUpdate` требует `userId` в теле запроса)
  - Решение: напрямую вызываем `/api/auth2/user/info` после получения токена для получения `userId`

**⚠️ ВАЖНО**: Bearer токен **ОБЯЗАТЕЛЬНО** нужен после `sign-up-buyer-short`:
- Получается через `signIn` (`/api/auth2/token/by-email`)
- Используется в заголовке `Authorization: {token_type} {access_token}` для всех запросов:
  - `createPreorder`
  - `createOrUpdate`
  - `reserve`
  - `status`
  - `createPaymentBooking`
  - Без токена эти запросы не будут работать
### 📋 Рекомендации:

1. **✅ Текущая реализация правильная** - флоу соответствует booking, но адаптирован для Telegram Mini App:
   - Корзина создается один раз перед бронированием (без промежуточных сохранений)
   - Токен хранится в sessionStorage (подходит для сессии приложения)
   - Все API вызовы в правильной последовательности

2. **Можно улучшить**:
   - Добавить обработку ошибок валидации из `createOrUpdate` (как в booking)
   - Добавить проверку статуса после возврата из оплаты (через `checkPaymentStatus`)
   - Рассмотреть использование cookies для долгосрочной авторизации (если нужно)

3. **Корзина (Draft)**:
   - **Можно ли без корзины?** - **НЕТ**, корзина обязательна для бронирования
   - **Но можно создавать корзину только один раз** перед бронированием (как вы и делаете)
   - В booking корзина может существовать до ввода данных туристов, но это не обязательно

## Выводы

✅ **Ваш флоу правильный** и соответствует booking проекту:
- Правильная последовательность API вызовов
- Правильная обработка токена авторизации
- Правильная структура данных для корзины
- Корзина создается только перед бронированием (что правильно для вашего случая)

⚠️ **Отличия от booking** (но они оправданы):
- Токен в sessionStorage вместо cookies (подходит для Telegram Mini App)
- Корзина создается только один раз (без промежуточных сохранений)
- Нет запроса к `/api/login/signin` (Laravel роут) - вместо этого напрямую вызываем `/api/auth2/user/info` для получения userId

## 🔴 Проблема с CORS

**Проблема**: Запросы не проходят из-за CORS, хотя в Postman работают.

**Причина**: 
- В booking все запросы идут через Laravel бэкенд, который проксирует запросы к API (нет CORS проблем)
- В fs-search-mini-app запросы идут напрямую к API, поэтому нужны CORS заголовки на стороне API

**Решение**:
1. **Настроить CORS на стороне API** (apigate.fstravel.com, stage-apigate.fstravel.com):
   - Разрешить origin вашего Telegram Mini App
   - Разрешить методы: GET, POST, PUT, OPTIONS
   - Разрешить заголовки: Authorization, Content-Type, X-User-Agent, X-TUI-ClientId

2. **Альтернативное решение** (если нельзя настроить CORS):
   - Создать прокси-сервер (Node.js/Express) который будет проксировать запросы
   - Или использовать существующий бэкенд для проксирования

**Запросы, которые нужны для работы**:
- `https://apigate.fstravel.com/api/auth2/token/by-email` - получение токена
- `https://apigate.fstravel.com/api/v1/order/preorder` - создание preorder
- `https://apigate.fstravel.com/api/v2/Draft/createOrUpdate` - создание/обновление корзины
- `https://apigate.fstravel.com/api/Draft/reserve` - бронирование
- `https://apigate.fstravel.com/api/Draft/status` - проверка статуса
- `https://apigate.fstravel.com/api/PacketTour/GetPacket` - получение пакета (для доп услуг)
- `https://apigate.fstravel.com/api/PacketTour/CheckReservation` - проверка резервирования (для доп услуг)
- `https://apigate.fstravel.com/api/PacketTour/GetReservationPrice` - уточнение цены (для доп услуг)
- `https://apigate.fstravel.com/api/PacketTour/ChangeService` - изменение услуги (для доп услуг)

**Для stage окружения**:
- `https://stage-apigate.fstravel.com/api/auth2/token/by-email`
- `https://stage-apigate.fstravel.com/api/v1/order/preorder`
- `https://stage-apigate.fstravel.com/api/v2/Draft/createOrUpdate`
- и т.д.

## 📋 Дополнительные запросы

### ChangeService
- **URL**: `/api/PacketTour/ChangeService`
- **Метод**: POST
- **Назначение**: Изменение услуги в пакете тура (питание, номер и т.д.)
- **Используется**: При изменении услуг в уже созданном пакете тура
- **Реализовано**: ✅ Добавлено в `booking.ts` как `changeService()`

### GetByHotels
- **URL**: `/api/Tours/GetByHotels`
- **Метод**: GET/POST (нужно уточнить)
- **Назначение**: Получение информации по конкретному отелю (цены и т.д.)
- **Используется**: На странице деталей отеля для получения доступных туров и цен
- **Реализовано**: ✅ Уже используется в `tour-details.ts` как `getTourOffersByHotels()`

🎯 **Рекомендация**: Продолжайте использовать текущий флоу, он корректен для вашего случая. Нужно решить проблему с CORS на стороне API.

