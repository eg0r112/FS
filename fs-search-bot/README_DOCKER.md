# Запуск бэкенда в Docker

## Требования
- Docker
- Docker Compose

## Запуск

1. Перейдите в директорию проекта:
```bash
cd TelegramFunSun
```

2. Запустите контейнер:
```bash
docker-compose up -d --build
```

3. API будет доступно по адресу:
- HTTP: http://localhost:5000
- Swagger UI: http://localhost:5000/swagger

## Остановка

```bash
docker-compose down
```

## Просмотр логов

```bash
docker-compose logs -f funsun-api
```

## Пересборка после изменений

```bash
docker-compose up -d --build
```

