from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from config import DATABASE_URL


engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)


# DeclarativeBase in Alchemy 2.0+ is abc class, so we cant use it directly
class Base(DeclarativeBase):
    pass


class Members(Base):
    __tablename__ = "members"

    db_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    fio: Mapped[str] = mapped_column(nullable=False)
    group_name: Mapped[str] = mapped_column(nullable=False)
    role: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)


class Jury(Base):
    __tablename__ = "Jury"
    db_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    fio: Mapped[str] = mapped_column(nullable=False)
    status: Mapped[str] = mapped_column(nullable=False)


class Group(Base):
    __tablename__ = "groups"

    db_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    present_score: Mapped[int] = mapped_column()
    doc_score: Mapped[int] = mapped_column()
    github_score: Mapped[int] = mapped_column()
    video_score: Mapped[int] = mapped_column()
    group_name: Mapped[str] = mapped_column(nullable=False)
    group_score_total: Mapped[int] = mapped_column(nullable=True)
