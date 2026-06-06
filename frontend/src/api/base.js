// api/base.js
//
// 백엔드 호출 주소를 정한다.
// 기본은 "같은 출처(빈 문자열)" — Vite dev 서버의 프록시(/api, /ws)가
// 백엔드로 넘겨준다. 덕분에 ngrok 터널 하나로 프론트·백엔드를 함께 노출할 수
// 있고, 와이파이 없이 데이터로 접속해도 동작한다.
// VITE_API_BASE_URL 을 지정하면 그 값을 최우선으로 쓴다(백엔드 직접 지정).

export function apiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || '';
}

// WebSocket 주소. 같은 출처를 ws/wss 로 변환해 프록시를 타게 한다.
export function wsBaseUrl() {
  const env = import.meta.env.VITE_API_BASE_URL;
  if (env) return env.replace(/^http/, 'ws');

  if (typeof window !== 'undefined' && window.location) {
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${proto}://${window.location.host}`;
  }

  return 'ws://127.0.0.1:8000';
}
