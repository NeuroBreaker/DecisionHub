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

🛠 Технологический стек
    Frontend: React, TypeScript, Tailwind CSS, Shadcn/ui, Zustand, Vite [1, 2]
    Backend: Python, FastAPI, SQLAlchemy, Uvicorn, UV (менеджер пакетов) [1, 2]
    База данных: PostgreSQL [2]
    Анализаторы: Модули статического анализа кода (LOC, цикломатическая сложность, поиск секретов через регулярные выражения), анализаторы PDF/DOCX структуры и парсеры видео-ссылок ВК/YouTube [1, 2]



📐 Архитектура проекта
Приложение построено по клиент-серверной архитектуре:
    Frontend (SPA): Взаимодействует с бэкендом через REST API. Адаптирован под три роли: Участник, Член жюри и Организатор [1, 2].
    Backend (FastAPI): Обрабатывает бизнес-логику, авторизацию и запускает модули анализа артефактов в оперативной памяти без засорения диска временными файлами [1, 2].
    Database (PostgreSQL): Хранит данные пользователей, команд, загруженных результатов автопроверок и экспертных оценок [2].


🔌 Основные API эндпоинты
    POST /api/auth/register — Регистрация нового пользователя [1]
POST /api/auth/login — Авторизация и получение JWT [1]
GET /api/leaderboard — Получение сводной таблицы результатов (динамический расчет весов) [2]
GET /api/teams — Список зарегистрированных команд [1]
POST /api/artifacts/repo — Отправка Git-репозитория на автоанализ [1]
POST /api/scores — Сохранение экспертных оценок жюри в БД [2]


💻 Локальный запуск (для разработки)
база данных (PostgreSQL)
Установите PostgreSQL локально. Создайте базу данных и скопируйте строку подключения в файл .env в корневой директории:
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@localhost:PORT/DATABASENAME

2. Backend
Запуск из папки DecisionHub/backend:
code Bash
# Установка зависимостей и запуск через uv
uv run src/main.py


3. Frontend
Запуск из папки DecisionHub/frontend:

npm install
npm run dev 
