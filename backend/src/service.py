import asyncio

from sqlalchemy.orm import session
from database import MembersCRUD, AsyncSessionLocal
from analyze import MembersPres, DocumentationAnaluzer, doc_video_analytic
from loguru import logger
import io
import re
import urllib.request
import zipfile

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






async def doc_git_analytic(url: str, words_list: list) -> dict:
    try:
        # 1. Парсим URL гитхаба, чтобы получить владельца и имя репозитория
        url_clean = url.rstrip("/")
        parts = url_clean.split("/")
        if "github.com" not in url_clean or len(parts) < 5:
            return {
                "source": url,
                "is_valid": False,
                "error": "Неверный формат ссылки. Поддерживается только GitHub (https://github.com/owner/repo)"
            }
        
        owner = parts[-2]
        repo = parts[-1]

        # Ссылка на архив ветки по умолчанию (GitHub перенаправит на main/master)
        zip_url = f"https://api.github.com/repos/{owner}/{repo}/zipball"
        
        # Скачиваем архив репозитория в оперативную память
        req = urllib.request.Request(zip_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as response:
            zip_data = response.read()

        # Читаем ZIP-архив в памяти
        with zipfile.ZipFile(io.BytesIO(zip_data)) as z:
            namelist = z.namelist()

            # 2. Проверка структуры репозитория (по ТЗ)
            has_readme = any("readme.md" in f.lower() or "readme.txt" in f.lower() for f in namelist)
            has_license = any("license" in f.lower() for f in namelist)
            has_deps = any(
                "requirements.txt" in f or "package.json" in f or "pyproject.toml" in f or "go.mod" in f or "pom.xml" in f
                for f in namelist
            )
            has_startup_instruction = any(
                "docker-compose" in f.lower() or "dockerfile" in f.lower() or "makefile" in f.lower() or "setup.sh" in f.lower()
                for f in namelist
            )

            # 3. Анализ кода (LOC, Сложность, Секреты)
            total_loc = 0
            total_complexity = 0
            detected_secrets = []
            analyzed_files_count = 0

            # Отбираем только файлы с кодом для анализа (максимум 25 файлов, чтобы не перегружать память)
            code_files = [f for f in namelist if f.endswith(('.py', '.js', '.ts', '.go', '.java', '.cpp'))]
            
            for file_path in code_files[:25]:
                try:
                    content_bytes = z.read(file_path)
                    content = content_bytes.decode('utf-8', errors='ignore')
                except Exception:
                    continue

                analyzed_files_count += 1
                lines = content.splitlines()
                
                # Считаем чистые строки кода (без пустых строк и комментариев)
                loc = len([line for line in lines if line.strip() and not line.strip().startswith(('#', '//', '/*', '*'))])
                total_loc += loc

                # Расчет цикломатической сложности (McCabe Approximation)
                # Базовый уровень сложности файла = 1. Каждое ветвление (+ if, for, while, catch/except, &&, ||) увеличивает сложность
                file_complexity = 1
                file_complexity += len(re.findall(r'\b(if|for|while|except|catch|elif)\b', content))
                file_complexity += content.count('&&') + content.count('||') + content.count(' and ') + content.count(' or ')
                total_complexity += file_complexity

                # Детекция секретов (API ключи, токены, пароли)
                secret_patterns = [
                    r'(?i)(api_key|client_secret|db_password|password|passwd|token|secret_key)\s*=\s*[\'"][a-zA-Z0-9_\-\.]{12,}[\'"]',
                    r'(?i)ghp_[a-zA-Z0-9]{36}', # GitHub Personal Access Token
                ]
                for pattern in secret_patterns:
                    matches = re.finditer(pattern, content)
                    for match in matches:
                        clean_match = match.group(0).split('=')[0].strip() if '=' in match.group(0) else "token/key"
                        detected_secrets.append(f"{file_path.split('/')[-1]}: найден секрет ({clean_match})")

            # Средняя сложность на один файл
            avg_complexity = round(total_complexity / analyzed_files_count, 1) if analyzed_files_count > 0 else 1.0

            # 4. Расчет оценки по критериям ТЗ
            structure_score = 0
            if has_readme: structure_score += 2.5
            if has_license: structure_score += 2.5
            if has_deps: structure_score += 2.5
            if has_startup_instruction: structure_score += 2.5

            # Штрафы за секреты и слишком высокую сложность
            secret_penalty = min(len(detected_secrets) * 2, 4)  # максимум штраф 4 балла
            complexity_penalty = 3 if avg_complexity > 15 else 0

            final_score = int(max(1, 10 - (10 - structure_score) - secret_penalty - complexity_penalty))

            # Вид проверки структуры для отчета
            structure_status = {
                "readme_exists": "✅ Найдено" if has_readme else "❌ Отсутствует",
                "license_exists": "✅ Найдено" if has_license else "❌ Отсутствует",
                "dependency_file_exists": "✅ Найдено" if has_deps else "❌ Отсутствует",
                "startup_instructions_exists": "✅ Найдено" if has_startup_instruction else "❌ Отсутствует",
            }

            is_valid = has_readme and has_deps and len(detected_secrets) == 0

            return {
                "source": url,
                "repository_name": repo,
                "analyzed_files": analyzed_files_count,
                "total_lines_of_code": total_loc,
                "average_cyclomatic_complexity": avg_complexity,
                "structure_check": structure_status,
                "secrets_found": detected_secrets,
                "is_valid": is_valid,
                "score_out_of_10": final_score
            }

    except Exception as e:
        return {
            "source": url,
            "is_valid": False,
            "error": f"Ошибка анализа репозитория: {str(e)}",
            "score_out_of_10": 0
        }
