from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# 1. НАСТРОЙКА CORS (Обязательно!)
# В разработке разрешаем любые домены ["*"]. 
# В продакшене тут должен быть адрес твоего сайта, например ["https://my-site.com"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], # Разрешаем любые методы (GET, POST, PUT, DELETE)
    allow_headers=["*"], # Разрешаем любые заголовки
)

# 2. ТВОИ ЭНДПОИНТЫ
@app.get("/api/hello")
def read_root():
    return {"message": "Привет с бэкенда FastAPI!"}

class Item(BaseModel):
    name: str
    price: float

@app.post("/api/items")
def create_item(item: Item):
    return {"status": "success", "received_data": item}
