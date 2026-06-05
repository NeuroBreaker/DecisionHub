FROM python:slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

COPY . .

RUN uv sync --locked

EXPOSE 8080

CMD ["uv", "run", "src/main.py"]
