import asyncio
from database import PostgrePrepare, Postgrepool
from loguru import logger


async def main() -> None:
   
    pool = Postgrepool.get_pool() 
    await PostgrePrepare.prepare(pool)


if __name__ == "__main__":
    try:
        asyncio.run(main())

    except KeyboardInterrupt:
        logger.exception("Keyboard Iterapt!!!")

