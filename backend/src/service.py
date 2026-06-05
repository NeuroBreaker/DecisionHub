import asyncio
from database import MembersCRUD, AsyncSessionLocal



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
