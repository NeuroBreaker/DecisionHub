# Запуск через docker:
```bash
docker-compose up -d --build
```

Веб страница будет доступна по
http://localhost/

# Локальный запуск каждого сервиса по отдельности

**Frontend**
Запуск из DecisionHub/frontend
```bash
npm install
npm run build
```

**PostgreSQL**
Установите для своей системы, настройте пользователя  
включите сервис и скопируйте ссылку на базу данных
в файл .env в корне директории

**Backend**
Запуск из DecisionHub/backend

> [!NOTE]
> Требуется предварительно настроить PostgreSQL

```
uv run src/main.py
```
