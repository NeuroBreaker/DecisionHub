import asyncio

from sqlalchemy.orm import session
from database import MembersCRUD, AsyncSessionLocal
from analyze import MembersPres, DocumentationAnaluzer, doc_video_analytic
from loguru import logger

async def Member_registration_service(fio: str, group_name:str, password:str, email:str, link="No info"):
    try:
        session = AsyncSessionLocal()
        await MembersCRUD.add(session, fio, group_name, password, email, link)
        
        return "succes!"
    except Exception as e:
        return e



async def Member_login_service(password:str, email:str):
    try:
        session = AsyncSessionLocal()
        to_return =  await MembersCRUD.get(session,email,password)
        return to_return

    except Exception as e:
        pass 


async def Present_analytic(file, words_list):
    try:
        session = AsyncSessionLocal()
        result = await MembersPres.analyze(file, words_list)
        logger.info("MemberPres is passed")

        return result
            

    except Exception as e:
        logger.info(f"Problem with presentation... {e}")
        
async def Doc_analytic(file,words_list, min_char=100):
    # Если список ключевых слов не передан извне, задаем дефолтный набор
    if words_list is None:
        words_list = {
            "introduction": ["введение", "цель", "описание", "обзор"],
            "installation": ["установка", "настройка", "запуск", "install"],
            "conclusion": ["заключение", "вывод", "итоги"]
        }

    try:
        # Извлекаем имя файла из объекта FastAPI UploadFile
        filename = file.filename or "unnamed_document"
        
        # Считываем содержимое файла в байты (асинхронная операция)
        file_bytes = await file.read()

        # Вызываем ваш основной класс анализатора
        result = await DocumentationAnaluzer.analyze(
            words_list=words_list,
            min_char=min_char,
            filename=filename,
            file_bytes=file_bytes
        )
        return result

    except Exception as e:
        logger.error(f"Ошибка во время анализа документа {file.filename if file else 'unknown'}: {e}")
        return {
            "filename": file.filename if file else "unknown",
            "is_valid": False,
            "error": f"Внутренняя ошибка сервера при обработке файла: {str(e)}"
        }
    finally:
        # В блоке finally гарантированно закрываем файл после чтения,
        # чтобы освободить системные ресурсы
        if file:
            await file.close()




async def Video_analytic(url: str, words_list = None) -> dict:
    if words_list is None:
        words_list = ["проект", "архитектура", "результат", "демонстрация"]

    try:
        result = await doc_video_analytic(url, words_list)

        return result
        
    except Exception as e:
        return {
            "source": url,
            "is_valid": False,
            "score": 0,
            "quality_score_text": f"Не удалось выполнить анализ ВК Видео: {str(e)}"
        }
