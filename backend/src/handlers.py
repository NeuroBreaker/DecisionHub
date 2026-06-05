from contextlib import asynccontextmanager
from fastapi import FastAPI, Query, UploadFile, Form, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from loguru import logger
from database import PostgrePrepare, Postgrepool
from fastapi import Body
from service import Member_registration_service, Member_login_service, Present_analytic, Doc_analytic, Video_analytic
from service import doc_git_analytic
from database import TableCRUD, AsyncSessionLocal
from sqlalchemy import text



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



@app.get("/api/artifacts/{teamId}")
async def get_artifacts_status(teamId: str):
    logger.info(f"GET artifacts status for team: {teamId}")
    
    # Открываем сессию к БД
    session = AsyncSessionLocal()
    try:
        # Делаем быстрый запрос к таблице groups (как в логах)
        query = text(
            "SELECT github_score, doc_score, present_score, video_score "
            "FROM groups WHERE group_name = :teamId"
        )
        result = await session.execute(query, {"teamId": teamId})
        row = result.fetchone()
        
        # Если команда не найдена в БД
        if not row:
            return {
                "github_score": 0,
                "doc_score": 0,
                "present_score": 0,
                "video_score": 0
            }
        
        # Возвращаем баллы обратно фронтенду
        return {
            "github_score": row[0] or 0,
            "doc_score": row[1] or 0,
            "present_score": row[2] or 0,
            "video_score": row[3] or 0
        }
        
    except Exception as e:
        logger.error(f"Error fetching scores for team {teamId}: {e}")
        return {"error": "Internal Server Error"}
    finally:
        # Обязательно закрываем сессию, чтобы не вызывать утечку соединений на хакатоне
        await session.close()










@app.post("/api/auth/login")
async def login(email: str = Body(...), password: str = Body(...) ):
    user = await Member_login_service(password, email)
    logger.info(f'/api/auth/login WITH {user}')


    if user:
        return {
            "access_token": "common",
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


class GitRequest(BaseModel):
    url: str

@app.post("/api/artifacts/repo")
async def post_arti(data: dict):  # Принимает любой JSON-словарь
    # Пробуем вытащить ссылку по любому из трех ключей
    logger.info(f'DATA IS {data}')
    url = data.get("repoLink") or data.get("git") or data.get("link")
    logger.info(f'URL IS {url}')

    result = await doc_git_analytic(url, ['readme', 'setup'])#type:ignore
    logger.info(f'/api/art/repo POST WITH {result}')
    
    score = result.get("score_out_of_10")
    group_name = data.get('teamId')

    logger.info(f"Try to insert score: {score}, group_name {group_name}")
    await TableCRUD.update(AsyncSessionLocal(), group_name, "github_score", score)#type:ignore

    return result




@app.post("/api/artifacts/documentation")
async def post_doc(file: UploadFile = File(...), teamId: str = Form(...)):
    result = await Doc_analytic(file, words_list=None)
    await TableCRUD.update(AsyncSessionLocal(), teamId, "doc_score", result)#type:ignore

    logger.info(f'/api/art/doc POST WITH {result}')





@app.post("/api/artifacts/presentation")
async def post_prese(file: UploadFile = File(...), teamId: str = Form(...)):
    REQUIRED_KEYWORDS = [
        "проблема", 
        "решение", 
        "целевая аудитория", 
        "стек", 
        "демо", 
        "команда", 
        "контакты"]

    to_return = await Present_analytic(file, REQUIRED_KEYWORDS)
    await TableCRUD.update(AsyncSessionLocal(), teamId, "present_score", to_return)#type:ignore

    logger.info(f"/api/art/present POST ENDED WITH {to_return}")




class VideoRequest(BaseModel):
    url: str
    teamId: str


@app.post("/api/artifacts/screencast")
async def post_cast(data: VideoRequest):
    word_list = ['база данных', 'интерфейс', 'запуск', 'клиент']
    result = await Video_analytic(url=data.url, words_list=word_list) 

    teamId = data.teamId
    score = result.get('score')
    await TableCRUD.update(AsyncSessionLocal(), teamId, "video_score", score)#type:ignore
    logger.info(f'/api/art/cast POST ENDED WITH {result}')
    return result









