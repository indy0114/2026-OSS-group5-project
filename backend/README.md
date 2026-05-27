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

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/health`

개발 서버 실행 후 API 문서는 아래에서 확인할 수 있습니다.

```text
http://127.0.0.1:8000/docs
```
