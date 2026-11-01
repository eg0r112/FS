# Проверка пути пользователя и запросов

## ✅ Путь пользователя - КОРРЕКТНО

```
Главная 
  → Туры 
  → Выбор тура 
  → Выбор номера тура 
  → Регистрация (sign-up-buyer-short, signIn) 
  → Ввод данных туристов 
  → Подтверждение (createPreorder, createOrUpdate, reserve, status, createPaymentBooking) 
  → Диалоговое окно ("Вы будете перенаправлены на защищенную страницу оплаты...") 
  → Оплата на внешней странице 
  → Возврат в приложение, проверяем через status
```

**Проверка последовательности:**
1. ✅ `sign-up-buyer-short` вызывается первым (в `AuthStep.vue`)
2. ✅ `signIn` вызывается сразу после `sign-up-buyer-short` (в `AuthPage.vue`, строка 47)
3. ✅ `createPreorder` вызывается перед `createOrUpdate` (в `PaymentPage.vue`, строка 302)
4. ✅ `createOrUpdate` вызывается после `createPreorder` (в `PaymentPage.vue`, строка 377)
5. ✅ `reserve` вызывается после `createOrUpdate` (в `PaymentPage.vue`, строка 399)
6. ✅ `status` вызывается после `reserve` (в `PaymentPage.vue`, строка 404)
7. ✅ `createPaymentBooking` вызывается после `status` (в `PaymentPage.vue`, строка 440)

**Вывод**: Последовательность правильная! ✅

## ✅ Все запросы перечислены - КОРРЕКТНО

### Основные запросы (обязательные):

1. ✅ **sign-up-buyer-short**
   - URL: `https://auth2.fstravel.com/api/v1/account/sign-up-buyer-short`
   - Статус: ✅ Работает
   - Реализовано: `src/api/auth.ts` → `registerUserWithoutAuth()`

2. ✅ **signIn** (получение токена)
   - URL: `https://apigate.fstravel.com/api/auth2/token/by-email`
   - Статус: ❌ CORS проблема
   - Реализовано: `src/api/auth.ts` → `signIn()`

3. ✅ **createPreorder**
   - URL: `https://apigate.fstravel.com/api/v1/order/preorder`
   - Статус: ❌ CORS проблема
   - Реализовано: `src/api/booking.ts` → `createPreorder()`

4. ✅ **createOrUpdate**
   - URL: `https://apigate.fstravel.com/api/v2/Draft/createOrUpdate`
   - Статус: ❌ CORS проблема
   - Реализовано: `src/api/booking.ts` → `createOrUpdateDraft()`

5. ✅ **reserve**
   - URL: `https://apigate.fstravel.com/api/Draft/reserve`
   - Статус: ❌ CORS проблема
   - Реализовано: `src/api/booking.ts` → `reserve()`

6. ✅ **status**
   - URL: `https://apigate.fstravel.com/api/Draft/status`
   - Статус: ❌ CORS проблема
   - Реализовано: `src/api/booking.ts` → `getBookingStatus()`

7. ✅ **createPaymentBooking**
   - URL: `https://booking.funsun.ru/api-booking/customer/payment`
   - Статус: ✅ Работает (через booking API)
   - Реализовано: `src/api/payment.ts` → `createPaymentBooking()`

### Дополнительные услуги (4 запроса):

8. ✅ **GetPacket**
   - URL: `https://apigate.fstravel.com/api/PacketTour/GetPacket`
   - Статус: ❌ CORS проблема
   - Реализовано: `src/api/booking.ts` → `getPacket()`

9. ✅ **CheckReservation**
   - URL: `https://apigate.fstravel.com/api/PacketTour/CheckReservation`
   - Статус: ❌ CORS проблема
   - Реализовано: `src/api/booking.ts` → `checkReservation()`

10. ✅ **GetReservationPrice**
    - URL: `https://apigate.fstravel.com/api/PacketTour/GetReservationPrice`
    - Статус: ❌ CORS проблема
    - Реализовано: `src/api/booking.ts` → `getReservationPrice()`

11. ✅ **ChangeService**
    - URL: `https://apigate.fstravel.com/api/PacketTour/ChangeService`
    - Статус: ❌ CORS проблема
    - Реализовано: `src/api/booking.ts` → `changeService()`

**Вывод**: Все запросы перечислены и реализованы! ✅

## 🔴 Проблема с CORS

### Текущая ситуация:
- ✅ `sign-up-buyer-short` работает (через `auth2.fstravel.com`)
- ❌ Все остальные запросы не проходят из-за CORS (через `apigate.fstravel.com` и `stage-apigate.fstravel.com`)

### Причина:
- В Postman запросы работают (нет CORS ограничений)
- В браузере/Telegram Mini App запросы блокируются CORS политикой
- Дебагер показывает статус `0` - это типичный признак CORS ошибки

### Решение:

#### Вариант 1: Настроить CORS на стороне API (рекомендуется)
Нужно обратиться к бэкенд-команде для настройки CORS на:
- `apigate.fstravel.com`
- `stage-apigate.fstravel.com`

**Требуемые настройки CORS:**
```
Access-Control-Allow-Origin: https://fs-search-mini-app.netlify.app
Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, X-User-Agent, X-TUI-ClientId, Accept, Accept-Language
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: [все необходимые заголовки ответа]
```

**Подробная инструкция**: См. `CORS_CONFIGURATION_REQUEST.md`

#### Вариант 2: Временное решение - прокси через ваш бэкенд
Если есть доступ к бэкенду, можно создать прокси-роуты для всех запросов.

#### Вариант 3: Использовать существующий booking бэкенд
Если есть доступ к booking Laravel бэкенду, можно добавить роуты для проксирования.

## 📝 Stage окружение

Для stage окружения все URL аналогичны, только меняется базовый домен:
- `https://stage-apigate.fstravel.com` вместо `https://apigate.fstravel.com`

## ✅ Итоговая проверка

| Элемент | Статус | Комментарий |
|---------|--------|-------------|
| Путь пользователя | ✅ Корректно | Последовательность правильная |
| Все запросы перечислены | ✅ Корректно | Все 11 запросов есть |
| Все запросы реализованы | ✅ Корректно | Все функции в коде |
| Заголовки добавлены | ✅ Корректно | `X-User-Agent: mopsapp_b2c_ru` |
| Проблема с CORS | ❌ Требует решения | Нужна настройка на стороне API |

## 🎯 Рекомендации

1. ✅ **Ваше описание пути пользователя полностью корректно!**
2. ✅ **Все запросы перечислены правильно!**
3. ✅ **Все запросы реализованы в коде!**
4. 🔴 **Нужно решить проблему с CORS** - обратиться к бэкенд-команде для настройки CORS на `apigate.fstravel.com` и `stage-apigate.fstravel.com`

