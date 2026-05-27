from datetime import datetime, timezone
import hashlib
import hmac
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


@app.delete("/api/users/me")
def delete_me(user=Depends(get_current_user)):
    with get_connection() as connection:
        connection.execute("DELETE FROM sessions WHERE user_id = ?", (user["id"],))
        connection.execute("DELETE FROM users WHERE id = ?", (user["id"],))

    return {"message": "계정이 삭제되었습니다."}
