# Quizzly Backend

FastAPI + SQLite 기반의 가벼운 인증 API입니다.

## 실행

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## API

인증
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

퀴즈
- `POST /api/quizzes` — 퀴즈 등록 (로그인 필요)
- `GET /api/quizzes` — 공개 퀴즈 목록 (메인페이지용)
- `GET /api/quizzes/{quiz_id}` — 퀴즈 단건 (문제 포함, 풀기 페이지용)
- `GET /api/users/me/quizzes` — 내가 만든 퀴즈 (로그인 필요)
- `DELETE /api/quizzes/{quiz_id}` — 퀴즈 삭제 (로그인 필요)

사용자
- `PATCH /api/users/me`
- `DELETE /api/users/me`

기타
- `GET /api/health`

개발 서버 실행 후 API 문서는 아래에서 확인할 수 있습니다.

```text
http://127.0.0.1:8000/docs
```
