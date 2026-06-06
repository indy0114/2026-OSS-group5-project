import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { gameSocketUrl } from '../../api/game.js';
import { playWhoosh, playTick, playFanfare } from './sounds.js';
import './Game.css';

const OPTION_STYLES = [
  { color: '#e8482b', shape: '▲' },
  { color: '#1368ce', shape: '◆' },
  { color: '#d89e00', shape: '●' },
  { color: '#26890c', shape: '■' },
];

function optionStyle(i) {
  return OPTION_STYLES[i % OPTION_STYLES.length];
}

function HostGame() {
  const { code } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [phase, setPhase] = useState('lobby'); // lobby | question | reveal | gameover
  const [players, setPlayers] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [question, setQuestion] = useState(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [reveal, setReveal] = useState(null);
  const [finalBoard, setFinalBoard] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket(gameSocketUrl(code));
    socketRef.current = socket;

    socket.onopen = () => socket.send(JSON.stringify({ type: 'join', role: 'host' }));
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      switch (msg.type) {
        case 'joined':
          setQuizTitle(msg.quizTitle || '');
          break;
        case 'lobby':
          setPlayers(msg.players || []);
          break;
        case 'question':
          setReveal(null);
          setQuestion(msg);
          setAnsweredCount(0);
          setPhase('question');
          startTimer(msg.timeLimit);
          playWhoosh();
          break;
        case 'answer_count':
          setAnsweredCount(msg.count);
          break;
        case 'reveal':
          stopTimer();
          setReveal(msg);
          setPhase('reveal');
          break;
        case 'game_over':
          stopTimer();
          setFinalBoard(msg.leaderboard || []);
          setPhase('gameover');
          playFanfare();
          break;
        default:
          break;
      }
    };

    return () => {
      stopTimer();
      socket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const startTimer = (limit) => {
    stopTimer();
    setTimeLeft(limit);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        const next = t - 1;
        if (next <= 0) {
          stopTimer();
          return 0;
        }
        if (next <= 5) playTick();
        return next;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const send = (obj) => socketRef.current?.send(JSON.stringify(obj));

  const joinUrl = `${window.location.origin}/play/${code}`;

  if (phase === 'lobby') {
    return (
      <div className="game-host game-lobby">
        <h1 className="game-lobby-title">{quizTitle || '퀴즈 게임'}</h1>
        <div className="game-pin-box">
          <span className="game-pin-label">참여 코드</span>
          <span className="game-pin">{code}</span>
          <span className="game-join-hint">{joinUrl} 에서 코드 입력</span>
        </div>
        <div className="game-qr">
          <QRCodeCanvas value={joinUrl} size={160} />
        </div>
        <div className="game-lobby-players">
          <p className="game-player-count">참가자 {players.length}명</p>
          <div className="game-player-chips">
            {players.map((p) => (
              <span className="game-player-chip game-pop" key={p.id}>{p.nickname}</span>
            ))}
            {players.length === 0 && <span className="game-waiting">참가자를 기다리는 중...</span>}
          </div>
        </div>
        <button
          className="game-primary-btn"
          type="button"
          disabled={players.length === 0}
          onClick={() => send({ type: 'start' })}
        >
          게임 시작
        </button>
        <button className="game-text-btn" type="button" onClick={() => navigate('/')}>나가기</button>
      </div>
    );
  }

  if (phase === 'question' && question) {
    return (
      <div className="game-host game-question-screen">
        <div className="game-question-top">
          <span className="game-qnum">{question.index + 1} / {question.total}</span>
          <span className="game-timer-badge">{timeLeft}</span>
          <span className="game-answered">{answeredCount}명 응답</span>
        </div>
        <h2 className="game-question-title">{question.question.title}</h2>
        {question.question.description && (
          <p className="game-question-desc">{question.question.description}</p>
        )}
        {question.question.media?.photo && (
          <img className="game-question-image" src={question.question.media.photo} alt="" />
        )}
        <div className="game-options-grid">
          {question.question.options.map((opt, i) => {
            const s = optionStyle(i);
            return (
              <div className="game-option" style={{ background: s.color }} key={opt.id}>
                <span className="game-option-shape">{s.shape}</span>
                <span className="game-option-text">{opt.text}</span>
              </div>
            );
          })}
        </div>
        <button className="game-text-btn" type="button" onClick={() => send({ type: 'skip' })}>
          정답 공개
        </button>
      </div>
    );
  }

  if (phase === 'reveal' && reveal && question) {
    const maxCount = Math.max(1, ...Object.values(reveal.distribution || {}));
    return (
      <div className="game-host game-reveal-screen">
        <h2 className="game-reveal-answer">정답: {reveal.answerText}</h2>
        <div className="game-dist-grid">
          {question.question.options.map((opt, i) => {
            const s = optionStyle(i);
            const count = reveal.distribution?.[opt.id] ?? 0;
            const isCorrect = (reveal.correctOptionIds || []).includes(String(opt.id));
            return (
              <div className="game-dist-col" key={opt.id}>
                <div
                  className={`game-dist-bar${isCorrect ? ' correct' : ''}`}
                  style={{ background: s.color, height: `${(count / maxCount) * 160 + 10}px` }}
                >
                  {count}
                </div>
                <span className="game-dist-shape" style={{ color: s.color }}>
                  {s.shape} {isCorrect ? '✓' : ''}
                </span>
              </div>
            );
          })}
        </div>
        <div className="game-mini-board">
          {(reveal.leaderboard || []).map((row) => (
            <div className="game-mini-row" key={row.nickname}>
              <span className="game-mini-rank">{row.rank}</span>
              <span className="game-mini-name">{row.nickname}</span>
              <span className="game-mini-score">{row.score}</span>
            </div>
          ))}
        </div>
        <button className="game-primary-btn" type="button" onClick={() => send({ type: 'next' })}>
          {reveal.isLast ? '최종 결과 보기' : '다음 문제'}
        </button>
      </div>
    );
  }

  if (phase === 'gameover') {
    const podium = finalBoard.slice(0, 3);
    const rest = finalBoard.slice(3);
    const order = [1, 0, 2]; // 2등, 1등, 3등 순서로 배치
    return (
      <div className="game-host game-over-screen">
        <h1 className="game-over-title">🏆 최종 결과</h1>
        <div className="game-podium">
          {order.map((idx) => {
            const p = podium[idx];
            if (!p) return <div className="game-podium-slot empty" key={idx} />;
            return (
              <div className={`game-podium-slot rank-${p.rank}`} key={idx}>
                <span className="game-podium-medal">{['🥇', '🥈', '🥉'][p.rank - 1]}</span>
                <span className="game-podium-name">{p.nickname}</span>
                <div className="game-podium-bar">
                  <span className="game-podium-score">{p.score}</span>
                </div>
              </div>
            );
          })}
        </div>
        {rest.length > 0 && (
          <div className="game-mini-board">
            {rest.map((row) => (
              <div className="game-mini-row" key={row.nickname}>
                <span className="game-mini-rank">{row.rank}</span>
                <span className="game-mini-name">{row.nickname}</span>
                <span className="game-mini-score">{row.score}</span>
              </div>
            ))}
          </div>
        )}
        <button className="game-primary-btn" type="button" onClick={() => navigate('/')}>
          홈으로
        </button>
      </div>
    );
  }

  return <div className="game-host"><p className="game-waiting">연결 중...</p></div>;
}

export default HostGame;
