from datetime import datetime, timezone
import hashlib
import hmac
import json
import os
import secrets
import sqlite3
from pathlib import Path

from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field


BASE_DIR = Path(__file__).resolve().parent.parent
INSTANCE_DIR = BASE_DIR / "instance"
DB_PATH = INSTANCE_DIR / "quizzly.db"

app = FastAPI(title="Quizzly API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SignupRequest(BaseModel):
    username: str = Field(min_length=2, max_length=30)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=30)
    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UpdateMeRequest(BaseModel):
    username: str | None = Field(default=None, min_length=2, max_length=30)
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=6, max_length=128)

class QuizCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    description: str | None = None
    category: str | None = None
    thumbnail: str | None = None
    # 'public' = 메인에 공개, 'private' = 본인만
    visibility: str = "public"
    # 'random' | 'sequential'
    order_mode: str = "random"
    tags: list[str] = Field(default_factory=list)
    # 프론트 SolveQuizPage 가 기대하는 문제 배열을 그대로 받습니다.
    # [{ id, type:'multiple'|'short', title, description, timeLimit,
    #    options:[{id,text}], answer }, ...]
    questions: list[dict] = Field(default_factory=list)

def get_connection():
    INSTANCE_DIR.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            thumbnail TEXT,
            visibility TEXT NOT NULL DEFAULT 'public',
            order_mode TEXT NOT NULL DEFAULT 'random',
            tags TEXT,
            questions TEXT NOT NULL DEFAULT '[]',
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )

        # 기존 quizzes 테이블에 빠진 컬럼이 있으면 추가 (데이터 보존 마이그레이션)
        existing_columns = {
            row["name"]
            for row in connection.execute("PRAGMA table_info(quizzes)").fetchall()
        }
        column_migrations = {
            "category": "ALTER TABLE quizzes ADD COLUMN category TEXT",
            "thumbnail": "ALTER TABLE quizzes ADD COLUMN thumbnail TEXT",
            "visibility": "ALTER TABLE quizzes ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public'",
            "order_mode": "ALTER TABLE quizzes ADD COLUMN order_mode TEXT NOT NULL DEFAULT 'random'",
            "questions": "ALTER TABLE quizzes ADD COLUMN questions TEXT NOT NULL DEFAULT '[]'",
        }
        for column, sql in column_migrations.items():
            if column not in existing_columns:
                connection.execute(sql)


@app.on_event("startup")
def on_startup():
    init_db()


def utc_now():
    return datetime.now(timezone.utc).isoformat()


def hash_password(password: str):
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120_000)
    return f"pbkdf2_sha256${salt.hex()}${digest.hex()}"


def verify_password(password: str, password_hash: str):
    try:
        algorithm, salt_hex, digest_hex = password_hash.split("$", 2)
    except ValueError:
        return False

    if algorithm != "pbkdf2_sha256":
        return False

    expected = bytes.fromhex(digest_hex)
    actual = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        bytes.fromhex(salt_hex),
        120_000,
    )
    return hmac.compare_digest(actual, expected)


def row_to_user(row):
    return {
        "id": row["id"],
        "username": row["username"],
        "email": row["email"],
        "created_at": row["created_at"],
    }

def row_to_quiz(row, include_questions=False):
    keys = row.keys()
    questions = json.loads(row["questions"]) if "questions" in keys and row["questions"] else []
    quiz = {
        "id": row["id"],
        "user_id": row["user_id"] if "user_id" in keys else None,
        "title": row["title"],
        "description": row["description"],
        "category": row["category"] if "category" in keys else None,
        "thumbnail": row["thumbnail"] if "thumbnail" in keys else None,
        "visibility": row["visibility"] if "visibility" in keys else "public",
        "order_mode": row["order_mode"] if "order_mode" in keys else "random",
        "tags": row["tags"].split(",") if ("tags" in keys and row["tags"]) else [],
        "question_count": len(questions),
        "created_at": row["created_at"],
    }
    if "author" in keys:
        quiz["author"] = row["author"]
    if include_questions:
        quiz["questions"] = questions
    return quiz


def create_session(connection, user_id: int):
    token = secrets.token_urlsafe(32)
    connection.execute(
        "INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)",
        (token, user_id, utc_now()),
    )
    return token


def get_current_user(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="로그인이 필요합니다.",
        )

    token = authorization.split(" ", 1)[1].strip()

    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT users.*
            FROM sessions
            JOIN users ON users.id = sessions.user_id
            WHERE sessions.token = ?
            """,
            (token,),
        ).fetchone()

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 로그인 정보입니다.",
        )

    return row_to_user(row)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/auth/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest):
    username = payload.username.strip()
    email = payload.email.lower().strip()

    if not username:
        raise HTTPException(status_code=400, detail="아이디를 입력해주세요.")

    with get_connection() as connection:
        existing = connection.execute(
            "SELECT id FROM users WHERE username = ? OR email = ?",
            (username, email),
        ).fetchone()

        if existing is not None:
            raise HTTPException(status_code=409, detail="이미 사용 중인 아이디 또는 이메일입니다.")

        cursor = connection.execute(
            """
            INSERT INTO users (username, email, password_hash, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (username, email, hash_password(payload.password), utc_now()),
        )
        user_id = cursor.lastrowid
        token = create_session(connection, user_id)
        user = connection.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()

    return {"access_token": token, "user": row_to_user(user)}


@app.post("/api/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    username = payload.username.strip()

    with get_connection() as connection:
        user = connection.execute(
            "SELECT * FROM users WHERE username = ?",
            (username,),
        ).fetchone()

        if user is None or not verify_password(payload.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 올바르지 않습니다.")

        token = create_session(connection, user["id"])

    return {"access_token": token, "user": row_to_user(user)}


@app.get("/api/auth/me", response_model=UserResponse)
def me(user=Depends(get_current_user)):
    return user


@app.post("/api/auth/logout")
def logout(authorization: str | None = Header(default=None)):
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
        with get_connection() as connection:
            connection.execute("DELETE FROM sessions WHERE token = ?", (token,))

    return {"message": "로그아웃되었습니다."}


@app.post("/api/quizzes", status_code=status.HTTP_201_CREATED)
def create_quiz(payload: QuizCreateRequest, user=Depends(get_current_user)):
    tags_str = ",".join(t.strip() for t in payload.tags if t.strip())
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO quizzes
                (user_id, title, description, category, thumbnail,
                 visibility, order_mode, tags, questions, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user["id"],
                payload.title.strip(),
                payload.description,
                payload.category,
                payload.thumbnail,
                payload.visibility,
                payload.order_mode,
                tags_str,
                json.dumps(payload.questions, ensure_ascii=False),
                utc_now(),
            ),
        )
        quiz_id = cursor.lastrowid
        row = connection.execute(
            """
            SELECT quizzes.*, users.username AS author
            FROM quizzes
            JOIN users ON users.id = quizzes.user_id
            WHERE quizzes.id = ?
            """,
            (quiz_id,),
        ).fetchone()

    return row_to_quiz(row, include_questions=True)

@app.get("/api/quizzes")
def list_quizzes():
    # 메인페이지용: 공개(public) 퀴즈만, 최신순. 문제 본문은 제외(가벼움).
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT quizzes.*, users.username AS author
            FROM quizzes
            JOIN users ON users.id = quizzes.user_id
            WHERE quizzes.visibility = 'public'
            ORDER BY quizzes.created_at DESC
            """
        ).fetchall()
    return [row_to_quiz(row) for row in rows]

@app.get("/api/quizzes/{quiz_id}")
def get_quiz(quiz_id: int):
    # 풀기 페이지용: 문제 본문 포함.
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT quizzes.*, users.username AS author
            FROM quizzes
            JOIN users ON users.id = quizzes.user_id
            WHERE quizzes.id = ?
            """,
            (quiz_id,),
        ).fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="퀴즈를 찾을 수 없습니다.")

    return row_to_quiz(row, include_questions=True)

@app.get("/api/users/me/quizzes")
def get_my_quizzes(user=Depends(get_current_user)): 
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, title, description, tags, created_at 
            FROM quizzes 
            WHERE user_id = ?
            ORDER BY created_at DESC
            """,
            (user["id"],),
        ).fetchall()
        
        quizzes = []
        for row in rows:
            quizzes.append({
                "id": row["id"],
                "title": row["title"],
                "description": row["description"],
                "tags": row["tags"].split(",") if row["tags"] else [],
                "created_at": row["created_at"]
            })
    return quizzes


@app.patch("/api/quizzes/{quiz_id}")
def update_quiz(quiz_id: int, payload: QuizCreateRequest, user=Depends(get_current_user)):
    with get_connection() as connection:
        existing = connection.execute(
            "SELECT id FROM quizzes WHERE id = ? AND user_id = ?",
            (quiz_id, user["id"]),
        ).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="퀴즈를 찾을 수 없거나 수정 권한이 없습니다.")

        tags_str = ",".join(t.strip() for t in payload.tags if t.strip())
        connection.execute(
            """
            UPDATE quizzes SET
                title = ?, description = ?, category = ?, thumbnail = ?,
                visibility = ?, order_mode = ?, tags = ?, questions = ?
            WHERE id = ?
            """,
            (
                payload.title.strip(),
                payload.description,
                payload.category,
                payload.thumbnail,
                payload.visibility,
                payload.order_mode,
                tags_str,
                json.dumps(payload.questions, ensure_ascii=False),
                quiz_id,
            ),
        )
        row = connection.execute(
            """
            SELECT quizzes.*, users.username AS author
            FROM quizzes JOIN users ON users.id = quizzes.user_id
            WHERE quizzes.id = ?
            """,
            (quiz_id,),
        ).fetchone()
    return row_to_quiz(row, include_questions=True)

@app.delete("/api/quizzes/{quiz_id}")
def delete_quiz(quiz_id: int, user=Depends(get_current_user)):
    with get_connection() as connection:
        quiz = connection.execute(
            "SELECT id FROM quizzes WHERE id = ? AND user_id = ?", 
            (quiz_id, user["id"])
        ).fetchone()
        
        if not quiz:
            raise HTTPException(status_code=404, detail="퀴즈를 찾을 수 없거나 삭제 권한이 없습니다.")
            
        connection.execute("DELETE FROM quizzes WHERE id = ?", (quiz_id,))
    return {"message": "퀴즈가 성공적으로 삭제되었습니다."}

@app.patch("/api/users/me", response_model=UserResponse)
def update_me(payload: UpdateMeRequest, user=Depends(get_current_user)):
    updates = {}
    if payload.username is not None:
        updates["username"] = payload.username.strip()
    if payload.email is not None:
        updates["email"] = payload.email.lower().strip()
    if payload.password is not None:
        updates["password_hash"] = hash_password(payload.password)

    if not updates:
        raise HTTPException(status_code=400, detail="변경할 내용이 없습니다.")

    with get_connection() as connection:
        if "username" in updates or "email" in updates:
            new_username = updates.get("username", user["username"])
            new_email = updates.get("email", user["email"])
            existing = connection.execute(
                "SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?",
                (new_username, new_email, user["id"]),
            ).fetchone()
            if existing is not None:
                raise HTTPException(status_code=409, detail="이미 사용 중인 아이디 또는 이메일입니다.")

        columns = ", ".join(f"{key} = ?" for key in updates)
        values = list(updates.values()) + [user["id"]]
        connection.execute(f"UPDATE users SET {columns} WHERE id = ?", values)

        updated = connection.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()

    return row_to_user(updated)


@app.delete("/api/users/me")
def delete_me(user=Depends(get_current_user)):
    with get_connection() as connection:
        connection.execute("DELETE FROM sessions WHERE user_id = ?", (user["id"],))
        connection.execute("DELETE FROM users WHERE id = ?", (user["id"],))

    return {"message": "계정이 삭제되었습니다."}