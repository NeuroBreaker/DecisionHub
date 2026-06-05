from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from loguru import logger
from database import PostgrePrepare, Postgrepool
from fastapi import Body

from service import Member_registration_service, Member_login_service



@asynccontextmanager
async def lifespan(app: FastAPI):
    # Всё ДО yield — выполняется при старте
    pool = Postgrepool.get_pool()
    #await PostgrePrepare.prepare(pool)
    logger.info("БД инициализирована!")
    yield
    # Всё ПОСЛЕ yield — при остановке (можно оставить пустым)

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/auth/register")
async def register(
    name: str = Body(...),
    email: str =Body(...),
    password: str = Body(...),
    teamName: str = Body(...)
    ):

    logger.info(f'/api/auth/register POST with\n{name}\t{email}\t{password}\t{teamName}')
    msg = await Member_registration_service(name, teamName, password, email)
    logger.info(f'registration class passed with {msg}')

    access_token = "some-jwt-token"
    user = {
        "id": 1,
        "name": name,
        "email": email,
        "role": "user",
        "teamId": None  # можно взять из teamName, если создаётся команда
    }
    
    return {"access_token": access_token, "user": user}






@app.post("/api/auth/login")
async def login(email: str = Body(...), password: str = Body(...) ):
    user = await Member_login_service(password, email)
    logger.info(f'/api/auth/login WITH {user}')


    if user:
        return {
            "access_token": "временно-любая-строка",
            "user": {
                #"id": user.id,
                "name": user.fio,
                "email": user.email,
                "role": "PARTICIPANT",
                "teamname": user.group_name
            }
        }

    else: return "Сначала зарегестрируйтесь"


@app.get("/api/auth/me")
def get_me():
    logger.info('/api/auth/me GET')




#========teams========


@app.get("/api/teams")
def get_teams():
    logger.info('/api/teams GET')

@app.post("/api/teams")           # ← тут было /api/auth/me — это был баг
def create_team():
    logger.info('/api/teams POST')

@app.get("/api/leaderboard")
def get_lead():
    logger.info('/api/lead GET')


#==============

@app.post("/api/artifacts/repo")
def post_arti():
    logger.info('/api/art/repo POST')


@app.post("/api/artifacts/documentation")
def post_doc():
    logger.info('/api/art/doc POST')

@app.post("/api/artifacts/presentation")
def post_prese():
    logger.info('/api/art/present POST')


@app.post("/api/artifacts/screencast")
def post_cast():
    logger.info('/api/art/cast POST')









