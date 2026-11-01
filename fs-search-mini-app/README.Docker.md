# Docker Setup для Frontend (Production)

## 🚀 Быстрый старт

```bash
# Собрать и запустить
docker-compose up -d

# Приложение будет доступно на http://localhost:8080
```

## 📦 Доступные команды

### Основные команды
```bash
# Собрать образ
docker build -t fs-mini-app-frontend .

# Запустить контейнер
docker run -p 8080:80 fs-mini-app-frontend

# Или через docker-compose (рекомендуется)
docker-compose up -d

# Посмотреть логи
docker-compose logs -f

# Остановить
docker-compose down
```

### Управление контейнерами
```bash
# Пересобрать образ
docker-compose build

# Пересобрать и запустить
docker-compose up --build -d

# Пересобрать без кэша
docker-compose build --no-cache

# Остановить и удалить контейнеры
docker-compose down

# Посмотреть статус
docker-compose ps

# Зайти в контейнер
docker-compose exec frontend sh
```

## 🔧 Конфигурация

### Порты
- **Production (nginx)**: `8080:80`

Изменить порт можно в `docker-compose.yml`:
```yaml
ports:
  - "3000:80"  # Например, на 3000
```

### Структура файлов
```
fs-search-mini-app/
├── Dockerfile              # Production сборка с nginx
├── docker-compose.yml      # Оркестрация контейнеров
├── nginx.conf             # Конфигурация nginx
├── .dockerignore          # Исключения для Docker
└── README.Docker.md       # Эта документация
```

### Переменные окружения
Создайте `.env` файл если нужно:
```env
VITE_API_URL=https://api.example.com
VITE_APP_ENV=production
```

## 🐛 Troubleshooting

### Проблема: Порт занят
```bash
# Найти процесс на порту (Windows)
netstat -ano | findstr :8080

# Или изменить порт в docker-compose.yml
```

### Проблема: Изменения не применяются
```bash
# Пересобрать без кэша
docker-compose build --no-cache
docker-compose up -d
```

### Проблема: Ошибка сборки
```bash
# Очистить Docker кэш
docker system prune -a

# Пересобрать
docker-compose up --build -d
```

### Проблема: Контейнер падает
```bash
# Посмотреть логи
docker-compose logs

# Посмотреть статус
docker-compose ps
```

## 📝 Особенности

1. ✅ **Multi-stage build** - минимальный размер образа (~25MB)
2. ✅ **nginx** настроен для SPA с правильным роутингом
3. ✅ **Gzip сжатие** включено для оптимизации загрузки
4. ✅ **Кэширование** статических файлов (1 год для assets)
5. ✅ **Security headers** - базовая защита
6. ✅ **Оптимизация** - только необходимые файлы попадают в образ

## 🔗 Полезные ссылки

- [Docker Documentation](https://docs.docker.com/)
- [nginx Docker](https://hub.docker.com/_/nginx)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

