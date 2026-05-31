// api/quizzes.js
//
// 백엔드(FastAPI) 퀴즈 API 연동 모듈.
//   POST   /api/quizzes          퀴즈 등록 (로그인 필요)
//   GET    /api/quizzes          공개 퀴즈 목록 (메인페이지)
//   GET    /api/quizzes/{id}     퀴즈 단건 + 문제 (풀기 페이지)

import { getToken } from './auth.js';

const API_BASE = 'http://127.0.0.1:8000';

async function handle(res) {
  if (!res.ok) {
    let message = '요청에 실패했습니다.';
    try {
      const data = await res.json();
      if (data?.detail) message = data.detail;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return res.json();
}

export async function createQuiz(quizData) {
  const { order, order_mode, ...rest } = quizData;
  const body = {
    ...rest,
    order_mode: order_mode ?? order ?? 'random',
  };

  const res = await fetch(`${API_BASE}/api/quizzes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function updateQuiz(id, quizData) {
  const { order, order_mode, ...rest } = quizData;
  const body = {
    ...rest,
    order_mode: order_mode ?? order ?? 'random',
  };

  const res = await fetch(`${API_BASE}/api/quizzes/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function getQuizzes() {
  const res = await fetch(`${API_BASE}/api/quizzes`);
  return handle(res);
}


export async function getQuiz(id) {
  const res = await fetch(`${API_BASE}/api/quizzes/${id}`);
  return handle(res);
}