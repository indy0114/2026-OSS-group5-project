import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { gameSocketUrl } from '../../api/game.js';
import { playCorrect, playWrong, playWhoosh, playTick } from './sounds.js';
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

function PlayerGame({ user }) {
  const { code: codeParam } = useParams();
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  const [codeInput, setCodeInput] = useState(codeParam || '');
  const [nickname, setNickname] = useState(user?.username || '');
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');

  const [phase, setPhase] = useState('lobby'); // lobby | question | answered | reveal | gameover
  const [quizTitle, setQuizTitle] = useState('');
  const [question, setQuestion] = useState(null);
  const [reveal, setReveal] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

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

  const join = () => {
    setError('');
    if (!codeInput.trim() || !nickname.trim()) {
      setError('코드와 닉네임을 입력해주세요.');
      return;
    }
    const socket = new WebSocket(gameSocketUrl(codeInput.trim()));
    socketRef.current = socket;

    socket.onopen = () =>
      socket.send(
        JSON.stringify({
          type: 'join',
          role: 'player',
          nickname: nickname.trim(),
          userId: user?.id ?? null,
        })
      );

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      switch (msg.type) {
        case 'joined':
          setQuizTitle(msg.quizTitle || '');
          setJoined(true);
          setPhase('lobby');
          break;
        case 'question':
          setReveal(null);
          setQuestion(msg);
          setPhase('question');
          startTimer(msg.timeLimit);
          playWhoosh();
          break;
        case 'answer_ack':
          setPhase('answered');
          break;
        case 'reveal':
          stopTimer();
          setReveal(msg);
          setPhase('reveal');
          if (msg.correct) playCorrect();
          else playWrong();
          break;
        case 'game_over':
          stopTimer();
          setFinalResult(msg);
          setPhase('gameover');
          break;
        case 'host_left':
          stopTimer();
          setError('호스트가 게임을 종료했습니다.');
          setJoined(false);
          break;
        case 'error':
          setError(msg.message || '오류가 발생했습니다.');
          break;
        default:
          break;
      }
    };

    socket.onclose = () => {
      // 게임 종료가 아닌 비정상 종료만 알림
    };
  };

  useEffect(() => {
    return () => {
      stopTimer();
      socketRef.current?.close();
    };
  }, []);

  const send = (obj) => socketRef.current?.send(JSON.stringify(obj));

  const submitAnswer = (value) => {
    send({ type: 'answer', value });
    setPhase('answered');
  };

  // ---- 입장 폼 ----
  if (!joined) {
    return (
      <div className="game-player game-join">
        <h1 className="game-join-logo">Quizzly Live</h1>
        <div className="game-join-card">
          <label className="game-join-field">
            <span>참여 코드</span>
            <input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ''))}
              inputMode="numeric"
              placeholder="6자리 코드"
              maxLength={6}
            />
          </label>
          <label className="game-join-field">
            <span>닉네임</span>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임 입력"
              maxLength={20}
            />
          </label>
          {error && <p className="game-join-error">{error}</p>}
          <button className="game-primary-btn" type="button" onClick={join}>
            입장하기
          </button>
        </div>
      </div>
    );
  }

  // ---- 대기실 ----
  if (phase === 'lobby') {
    return (
      <div className="game-player game-player-wait">
        <p className="game-wait-nick">{nickname}</p>
        <p className="game-wait-msg">곧 시작됩니다!</p>
        <p className="game-wait-sub">{quizTitle}</p>
        <div className="game-spinner" />
      </div>
    );
  }

  // ---- 문제 풀이 ----
  if (phase === 'question' && question) {
    const q = question.question;
    if (q.type === 'short') {
      return <ShortAnswer onSubmit={submitAnswer} question={q} timeLeft={timeLeft} />;
    }
    return (
      <MultipleChoice
        key={question.index}
        question={q}
        timeLeft={timeLeft}
        onSubmit={submitAnswer}
      />
    );
  }

  // ---- 제출 완료 대기 ----
  if (phase === 'answered') {
    return (
      <div className="game-player game-player-wait">
        <p className="game-wait-msg">제출 완료!</p>
        <p className="game-wait-sub">다른 참가자를 기다리는 중...</p>
        <div className="game-spinner" />
      </div>
    );
  }

  // ---- 정답 공개 ----
  if (phase === 'reveal' && reveal) {
    return (
      <div className={`game-player game-player-result ${reveal.correct ? 'correct' : 'wrong'}`}>
        <div className="game-result-icon">{reveal.correct ? '⭕' : '❌'}</div>
        <p className="game-result-text">{reveal.correct ? '정답!' : '오답'}</p>
        {reveal.correct && reveal.delta > 0 && (
          <p className="game-result-delta">+{reveal.delta}</p>
        )}
        {reveal.streak > 1 && reveal.correct && (
          <p className="game-result-streak">🔥 {reveal.streak}연속 정답!</p>
        )}
        <div className="game-result-rankbox">
          <span className="game-result-rank">{reveal.rank}위</span>
          <span className="game-result-score">{reveal.score}점</span>
        </div>
      </div>
    );
  }

  // ---- 최종 결과 ----
  if (phase === 'gameover' && finalResult) {
    return (
      <div className="game-player game-player-final">
        <div className="game-final-medal">
          {finalResult.rank <= 3 ? ['🥇', '🥈', '🥉'][finalResult.rank - 1] : '🎉'}
        </div>
        <p className="game-final-rank">{finalResult.rank}위</p>
        <p className="game-final-score">{finalResult.score}점</p>
        <p className="game-wait-nick">{nickname}</p>
      </div>
    );
  }

  return (
    <div className="game-player game-player-wait">
      {error ? <p className="game-join-error">{error}</p> : <div className="game-spinner" />}
    </div>
  );
}

function QuestionBody({ question, timeLeft }) {
  const photo = question.media?.photo;
  return (
    <div className="game-q-body">
      {timeLeft > 0 && <span className="game-timer-badge">{timeLeft}</span>}
      <h2 className="game-q-title">{question.title}</h2>
      {question.description && <p className="game-q-desc">{question.description}</p>}
      {photo && <img className="game-q-image" src={photo} alt="" />}
    </div>
  );
}

function MultipleChoice({ question, timeLeft, onSubmit }) {
  const [selected, setSelected] = useState([]);
  const multi = !!question.multiSelect;

  const toggle = (id) => {
    if (multi) {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      onSubmit(id);
    }
  };

  return (
    <div className="game-player game-player-question">
      <QuestionBody question={question} timeLeft={timeLeft} />
      {multi && <p className="game-player-qhint">정답을 모두 선택하세요 (복수 정답)</p>}
      <div className="game-player-options">
        {question.options.map((opt, i) => {
          const s = optionStyle(i);
          const on = selected.includes(opt.id);
          return (
            <button
              className={`game-player-option${multi && on ? ' selected' : ''}`}
              style={{ background: s.color }}
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
            >
              <span className="game-option-shape">{multi ? (on ? '☑' : '☐') : s.shape}</span>
              <span className="game-option-text">{opt.text}</span>
            </button>
          );
        })}
      </div>
      {multi && (
        <button
          className="game-primary-btn"
          type="button"
          disabled={selected.length === 0}
          onClick={() => onSubmit(selected)}
        >
          제출
        </button>
      )}
    </div>
  );
}

function ShortAnswer({ onSubmit, question, timeLeft }) {
  const [text, setText] = useState('');
  return (
    <div className="game-player game-player-question">
      <QuestionBody question={question} timeLeft={timeLeft} />
      <input
        className="game-short-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="정답 입력"
        autoFocus
      />
      <button
        className="game-primary-btn"
        type="button"
        disabled={!text.trim()}
        onClick={() => onSubmit(text.trim())}
      >
        제출
      </button>
    </div>
  );
}

export default PlayerGame;
