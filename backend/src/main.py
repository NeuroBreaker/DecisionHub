import asyncio
from database import PostgrePrepare, Postgrepool
from loguru import logger
import uvicorn


async def main() -> None:
    pool = Postgrepool.get_pool()
    await PostgrePrepare.prepare(pool)


async def process():
    await main()


if __name__ == "__main__":
    try:
        # asyncio.run(main())
        uvicorn.run("handlers:app", host="0.0.0.0", port=8080, reload=True)
    except KeyboardInterrupt:
        logger.exception("Keyboard Iterapt!!!")
