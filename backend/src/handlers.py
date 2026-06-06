from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, Form, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from loguru import logger
from database import Postgrepool
from fastapi import Body
from service import (
    Member_registration_service,
    Member_login_service,
    Present_analytic,
    Doc_analytic,
    Video_analytic,
)
from service import doc_git_analytic
from database import TableCRUD, AsyncSessionLocal
from sqlalchemy import text
from typing import Optional
import uuid
import hashlib


@asynccontextmanager
async def lifespan(app: FastAPI):
    # pool = Postgrepool.get_pool()
    # await PostgrePrepare.prepare(pool)
    # logger.info("БД инициализирована!")
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SimplePasswordManager:
    @staticmethod
    def hash_password(password: str) -> str:
        hash_object = hashlib.sha512(password.encode("utf-8"))
        return hash_object.hexdigest()


@app.post("/api/auth/register")
async def register(
    name: str = Body(...),
    email: str = Body(...),
    password: str = Body(...),
    role: str = Body(...),
    teamName: Optional[str] = Body(None),
):
    password = SimplePasswordManager.hash_password(password)

    if role.upper() == "PARTICIPANT" and teamName:
        final_team = teamName
    else:
        final_team = f"System_{role}_{uuid.uuid4().hex[:8]}"

    logger.info(
        f"/api/auth/register POST with\n{name}\t{email}\t{password}\t{final_team}\t{role}"
    )
    msg = await Member_registration_service(name, final_team, password, email, role)

    access_token = "common"
    user = {"name": name, "email": email, "role": role, "teamname": final_team}
    return {"access_token": access_token, "user": user}


@app.get("/api/artifacts/{teamId}")
async def get_artifacts_status(teamId: str):
    logger.info(f"GET artifacts status for team: {teamId}")
    session = AsyncSessionLocal()
    try:
        query = text(
            "SELECT github_score, doc_score, present_score, video_score "
            "FROM groups WHERE group_name = :teamId"
        )
        result = await session.execute(query, {"teamId": teamId})
        row = result.fetchone()

        if not row:
            return {
                "github_score": 0,
                "doc_score": 0,
                "present_score": 0,
                "video_score": 0,
            }

        return {
            "github_score": row[0] or 0,
            "doc_score": row[1] or 0,
            "present_score": row[2] or 0,
            "video_score": row[3] or 0,
        }

    except Exception as e:
        logger.error(f"Error fetching scores for team {teamId}: {e}")
        return {"error": "Internal Server Error"}
    finally:
        await session.close()


@app.post("/api/auth/login")
async def login(email: str = Body(...), password: str = Body(...)):

    password = SimplePasswordManager.hash_password(password)
    user = await Member_login_service(password, email)
    logger.info(f"/api/auth/login WITH  {email}")

    if user:
        return {
            "access_token": "common",
            "user": {
                # "id": user.id,
                "name": user.fio,
                "email": user.email,
                "role": user.role,
                "teamname": user.group_name,
            },
        }

    else:
        return "Сначала зарегестрируйтесь"


@app.get("/api/auth/me")
def get_me():
    logger.info("/api/auth/me GET")


# ========teams========
@app.get("/api/teams")
async def get_teams():
    logger.info("/api/teams GET")
    session = AsyncSessionLocal()
    try:
        query = text("SELECT db_id, group_name FROM groups")
        result = await session.execute(query)
        rows = result.fetchall()

        return [
            {"id": r[1], "name": r[1]} for r in rows if not r[1].startswith("System_")
        ]
    except Exception as e:
        logger.error(f"Error getting teams: {e}")
        return []
    finally:
        await session.close()


@app.post("/api/scores")
async def submit_scores(data: dict = Body(...)):
    logger.info(f"Scores received: {data}")
    group_name = data.get("teamId")
    total_score = data.get("total", 0)

    session = AsyncSessionLocal()
    try:
        score_int = int(float(total_score) * 10)  # correcting auto scores

        stmt = text(
            "UPDATE groups SET group_score_total = :score WHERE group_name = :gname"
        )
        await session.execute(stmt, {"score": score_int, "gname": group_name})
        await session.commit()
        return {"status": "ok", "saved_score": score_int}
    except Exception as e:
        logger.error(f"Error saving scores: {e}")
        return {"error": str(e)}
    finally:
        await session.close()


@app.get("/api/leaderboard")
async def get_lead():
    logger.info("/api/lead GET")
    session = AsyncSessionLocal()
    try:
        query = text("""
            SELECT 
                g.db_id, g.group_name, g.github_score, g.doc_score, g.present_score, g.video_score, g.group_score_total,
                m.fio, m.email, m.role, m.db_id as member_id
            FROM groups g
            LEFT JOIN members m ON g.group_name = m.group_name
        """)
        result = await session.execute(query)
        rows = result.fetchall()

        teams_data = {}
        for row in rows:
            g_name = row[1]

            if g_name.startswith("System_"):
                continue
            github_score = row[2] or 0
            doc_score = row[3] or 0
            present_score = row[4] or 0
            video_score = row[5] or 0
            group_score_total = row[6] or 0

            member_fio = row[7]

            if g_name not in teams_data:  # scores system
                autoScore = github_score + doc_score + present_score + video_score
                avg_jury = (group_score_total / 10.0) if group_score_total else 0.0

                auto_normalized = (autoScore / 100.0) * 10.0
                total = (
                    (auto_normalized + avg_jury) / 2.0
                    if avg_jury > 0
                    else auto_normalized
                )

                teams_data[g_name] = {
                    "rank": 0,
                    "team": {
                        "id": str(row[0]),
                        "name": g_name,
                        "status": "CHECKED" if group_score_total > 0 else "ACTIVE",
                        "createdAt": "2024-01-01",
                        "members": [],
                    },
                    "artifacts": {
                        "repoCheck": {
                            "status": "SUCCESS"
                            if github_score > 0
                            else "NOT_SUBMITTED",
                            "score": github_score,
                        },
                        "docCheck": {
                            "status": "SUCCESS" if doc_score > 0 else "NOT_SUBMITTED",
                            "score": doc_score,
                        },
                        "presentationCheck": {
                            "status": "SUCCESS"
                            if present_score > 0
                            else "NOT_SUBMITTED",
                            "score": present_score,
                        },
                        "screencastCheck": {
                            "status": "SUCCESS" if video_score > 0 else "NOT_SUBMITTED",
                            "score": video_score,
                        },
                    },
                    "autoScore": autoScore,
                    "juryScores": [{"score": avg_jury}] if avg_jury > 0 else [],
                    "avgJuryScore": avg_jury,
                    "totalScore": total,
                    "isFinalized": group_score_total > 0,
                }

            if member_fio:
                teams_data[g_name]["team"]["members"].append({"name": member_fio})

        leaderboard = list(teams_data.values())
        leaderboard.sort(key=lambda x: x["totalScore"], reverse=True)  # sort here

        for i, entry in enumerate(leaderboard):
            entry["rank"] = i + 1

        return leaderboard
    except Exception as e:
        logger.error(f"Error in get_lead: {e}")
        return []
    finally:
        await session.close()


# =======================


class GitRequest(BaseModel):
    url: str


@app.post("/api/artifacts/repo")
async def post_arti(data: dict):
    url = data.get("repoLink") or data.get("git") or data.get("link")
    logger.info(f"URL IS {url}")

    result = await doc_git_analytic(url, ["readme", "setup"])  # type:ignore
    logger.info(f"/api/art/repo POST WITH {result}")

    score = result.get("score_out_of_10")
    group_name = data.get("teamId")

    logger.info(f"Try to insert score: {score}, group_name {group_name}")
    await TableCRUD.update(AsyncSessionLocal(), group_name, "github_score", score)  # type:ignore

    return result


@app.post("/api/artifacts/documentation")
async def post_doc(file: UploadFile = File(...), teamId: str = Form(...)):
    result = await Doc_analytic(file, words_list=None)
    result = result * 2  # type:ignore
    await TableCRUD.update(AsyncSessionLocal(), teamId, "doc_score", result)  # type:ignore
    logger.info(f"/api/art/doc POST WITH {result}")


@app.post("/api/artifacts/presentation")
async def post_prese(file: UploadFile = File(...), teamId: str = Form(...)):
    REQUIRED_KEYWORDS = [
        "проблема",
        "решение",
        "целевая аудитория",
        "стек",
        "демо",
        "команда",
        "контакты",
    ]

    to_return = await Present_analytic(file, REQUIRED_KEYWORDS)
    to_return = to_return * 2  # type:ignore
    await TableCRUD.update(AsyncSessionLocal(), teamId, "present_score", to_return)  # type:ignore
    logger.info(f"/api/art/present POST ENDED WITH {to_return}")


class VideoRequest(BaseModel):
    url: str
    teamId: str


@app.post("/api/artifacts/screencast")
async def post_cast(data: VideoRequest):
    word_list = ["база данных", "интерфейс", "запуск", "клиент"]
    result = await Video_analytic(url=data.url, words_list=word_list)

    teamId = data.teamId
    score = result.get("score")
    await TableCRUD.update(AsyncSessionLocal(), teamId, "video_score", score)  # type:ignore
    logger.info(f"/api/art/cast POST ENDED WITH {result}")
    return result
