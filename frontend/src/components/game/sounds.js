// 간단한 효과음 (Web Audio API, 외부 파일 없이 즉석 생성)

function ctx() {
  if (!window._quizzlyAudioCtx) {
    window._quizzlyAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return window._quizzlyAudioCtx;
}

function tone(freq, start, duration, type = 'sine', volume = 0.25) {
  const audio = ctx();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audio.currentTime + start);
  gain.gain.setValueAtTime(volume, audio.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + start + duration);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration);
}

export function playTick() {
  try { tone(880, 0, 0.08, 'sine', 0.18); } catch {}
}

export function playCorrect() {
  try {
    [523, 659, 784].forEach((f, i) => tone(f, i * 0.1, 0.2, 'sine', 0.28));
  } catch {}
}

export function playWrong() {
  try {
    [330, 220].forEach((f, i) => tone(f, i * 0.16, 0.24, 'sawtooth', 0.22));
  } catch {}
}

export function playWhoosh() {
  try { tone(440, 0, 0.18, 'triangle', 0.2); tone(660, 0.05, 0.18, 'triangle', 0.15); } catch {}
}

export function playFanfare() {
  try {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.13, 0.35, 'sine', 0.3));
  } catch {}
}
