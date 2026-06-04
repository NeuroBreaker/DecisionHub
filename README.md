# Запуск через docker:
```bash
docker-compose up -d --build
```

# Локальный запуск каждого сервиса по отдельности

**Frontend**
Запуск из DecisionHub/frontend
```bash
npm install
npm run build
```

**Backend**
Запуск из DecisionHub/backend
```
uv run main.py
```

**PostgreSQL**
Установите для своей системы, настройте пользователя  
включите сервис и скопируйте ссылку на базу данных
в файл .env в корне директории
