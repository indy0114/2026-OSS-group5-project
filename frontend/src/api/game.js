// api/game.js
//
// 실시간 멀티플레이 게임 연동.
//   POST /api/games            방 생성 (호스트, 로그인 필요)
//   WS   /ws/game/{code}       방 접속 (호스트/참가자 공용)

import { getToken } from './auth.js';
import { apiBaseUrl, wsBaseUrl } from './base.js';

const API_BASE = apiBaseUrl();

export async function createGame(quizId) {
  const res = await fetch(`${API_BASE}/api/games`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ quiz_id: quizId }),
  });
  if (!res.ok) {
    let message = '게임을 시작하지 못했습니다.';
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

export function gameSocketUrl(code) {
  return `${wsBaseUrl()}/ws/game/${code}`;
}
