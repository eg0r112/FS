# 🔴 Проблема с антибот защитой (servicepipe.ru)

## Описание проблемы

При запросах к `https://apigate.fstravel.com/api/*` из Postman, curl или Telegram Mini App возвращается **HTML страница с антибот защитой** вместо JSON ответа.

### Симптомы:
- ✅ **На сайте fstravel.com** запросы работают нормально
- ❌ **В Postman/curl/мини-приложении** возвращается HTML с проверкой
- Статус ответа: **200 OK**, но тело ответа - HTML вместо JSON

### Пример ответа:
```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <noscript>
        <meta http-equiv="refresh" content="0; url=/exhkqyad">
    </noscript>
</head>
...
<script type="text/javascript" src="//servicepipe.ru/static/checkjs/c997a6/NPUPkkcI20.js"></script>
```

## Причина

API защищен антибот системой **servicepipe.ru**, которая:
1. Проверяет выполнение JavaScript в браузере
2. Требует установки cookies (`spsn`, `oirutpspid`)
3. Анализирует браузерные заголовки (`sec-ch-ua`, `sec-fetch-*`, `user-agent`)
4. Блокирует запросы, которые не проходят проверку

### Почему на сайте работает:
- Браузер выполняет JavaScript от `servicepipe.ru`
- Устанавливаются необходимые cookies
- Проходит проверка браузерных заголовков
- Запросы пропускаются

### Почему в Postman/мини-приложении не работает:
- ❌ Нет выполнения JavaScript
- ❌ Нет cookies от антибота
- ❌ Нет браузерных заголовков
- ❌ Запросы блокируются

## Решения

### ✅ Решение 1: Прокси-сервер (рекомендуется)

**Как в booking проекте**: Все запросы идут через Laravel бэкенд, который проксирует запросы к API.

**Для мини-приложения нужно:**
1. Создать прокси-сервер (Node.js/Express или использовать существующий бэкенд)
2. Прокси-сервер делает запросы к `apigate.fstravel.com` от своего имени
3. Мини-приложение обращается к прокси-серверу

**Преимущества:**
- ✅ Обходит антибот защиту (прокси-сервер работает как браузер)
- ✅ Решает проблему CORS
- ✅ Централизованное управление запросами
- ✅ Можно добавить кэширование, логирование

**Пример реализации:**
```javascript
// Node.js/Express прокси
app.post('/api/proxy/*', async (req, res) => {
  const targetUrl = req.url.replace('/api/proxy', 'https://apigate.fstravel.com')
  const response = await axios.post(targetUrl, req.body, {
    headers: {
      ...req.headers,
      'X-User-Agent': 'mopsapp_b2c_ru',
      'Origin': 'https://fstravel.com',
      'Referer': 'https://fstravel.com/'
    }
  })
  res.json(response.data)
})
```

### ✅ Решение 2: Whitelist для мини-приложения

Обратиться к бэкенд команде для настройки whitelist:

**Требуется:**
1. Добавить User-Agent `mopsapp_b2c_ru` в whitelist антибота
2. Или добавить origin мини-приложения в whitelist
3. Или настроить отдельный endpoint без антибот защиты для мини-приложения

**Что нужно передать бэкенд команде:**
- User-Agent: `mopsapp_b2c_ru`
- Origin: Origin вашего Telegram Mini App
- Список endpoints, которые нужны для работы

### ⚠️ Решение 3: Эмуляция браузера (не рекомендуется)

Попытка эмулировать браузерные заголовки и cookies. **Не рекомендуется**, так как:
- Антибот системы постоянно обновляются
- Требует постоянной поддержки
- Может нарушать ToS

## Запросы, которые блокируются

Все запросы к `https://apigate.fstravel.com/api/*`:
- ✅ `POST /api/auth2/token/by-email` - получение токена
- ✅ `POST /api/v1/order/preorder` - создание preorder
- ✅ `POST /api/v2/Draft/createOrUpdate` - создание/обновление корзины
- ✅ `POST /api/Draft/reserve` - бронирование
- ✅ `POST /api/PacketTour/GetPacket` - получение пакета тура
- ✅ `POST /api/PacketTour/GetSupplements` - получение доп. услуг
- ✅ И все остальные endpoints

## Что работает

- ✅ `https://auth2.fstravel.com/api/v1/account/sign-up-buyer-short` - регистрация (нет антибота)

## Рекомендации

1. **Создать прокси-сервер** (как в booking проекте)
2. **Обратиться к бэкенд команде** для настройки whitelist для мини-приложения
3. **Документировать** все запросы, которые нужны для работы

## Контакты для решения проблемы

**Нужно обратиться к:**
- Бэкенд команде (настройка whitelist)
- DevOps команде (настройка прокси, если нужно)
- Команде безопасности (согласование обхода антибота)

## Дополнительная информация

- Антибот система: **servicepipe.ru**
- Проверка происходит на уровне API Gateway
- В booking проекте эта проблема решена через Laravel бэкенд (прокси)

