import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getQuiz } from '../../api/quizzes.js';
import Header from '../common/Header.jsx';
import './SolveQuiz.css';

const TEXT = {
  home: 'Quizzly',
  exit: '나가기',
  question: '문제',
  submit: '제출',
  next: '다음 문제',
  showResult: '결과 보기',
  timeUp: '시간 종료!',
  correct: '정답입니다!',
  wrong: '오답입니다',
  answerLabel: '정답',
  shortPlaceholder: '정답을 입력하세요',
  resultTitle: '퀴즈 완료!',
  scoreSuffix: '점',
  correctCount: '맞힌 문제',
  retry: '다시 풀기',
  goHome: '홈으로',
};

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function SolveQuizPage({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [view, setView] = useState('playing');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    getQuiz(id)
      .then((data) => {
        let questions = (data.questions || []).map((q) => ({
            id: String(q.id),
            type: q.type === 'multiple' ? 'multiple' : 'short',
            title: q.title,
            description: q.description || '',
            timeLimit: q.time_limit ?? q.timeLimit ?? 20,
            options: q.options || [],
            answer: q.answer ?? '',
          }));
        if (data.order_mode === 'random') {
          questions = shuffle(questions);
        }
        setQuiz({ title: data.title, questions });
      })
      .catch((e) => setLoadError(e.message || '퀴즈를 불러오지 못했어요.'));
  }, [id]);

  const questions = quiz?.questions ?? [];
  const total = questions.length;
  const current = questions[index];
  const timeLimit = current?.timeLimit ?? 20;

  const isCorrect = useCallback(() => {
    if (!current) return false;
    if (current.type === 'multiple') return selected === current.answer;
    return inputValue.trim().toLowerCase() === String(current.answer).trim().toLowerCase();
  }, [current, selected, inputValue]);

  const handleSubmit = useCallback(() => {
    if (submitted) return;
    clearInterval(timerRef.current);
    const correct = isCorrect();
    setSubmitted(true);
    if (correct) setScore((s) => s + 1);
    setResults((r) => [...r, { id: current?.id, correct }]);
  }, [submitted, isCorrect, current]);

  useEffect(() => {
    if (!quiz || view !== 'playing' || submitted || timeLimit === 0) return;
    setTimeLeft(timeLimit);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, view, quiz]);

  useEffect(() => {
    if (timeLimit === 0) return;
    if (timeLeft === 0 && !submitted && view === 'playing') {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  if (loadError) {
    return (
      <div className="solve-page">
        <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
        <main className="solve-main">
          <p style={{ textAlign: 'center', marginTop: '4rem' }}>{loadError}</p>
        </main>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="solve-page">
        <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
        <main className="solve-main">
          <p style={{ textAlign: 'center', marginTop: '4rem' }}>불러오는 중...</p>
        </main>
      </div>
    );
  }

  const handleNext = () => {
    if (index + 1 >= total) {
      setView('result');
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setInputValue('');
    setSubmitted(false);
  };

  const handleRetry = () => {
    setView('playing');
    setIndex(0);
    setSelected(null);
    setInputValue('');
    setSubmitted(false);
    setScore(0);
    setResults([]);
  };

  const canSubmit =
    current?.type === 'multiple' ? selected !== null : inputValue.trim() !== '';

  if (view === 'result') {
    const percent = Math.round((score / total) * 100);
    return (
      <div className="solve-page">
        <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
        <main className="solve-main">
          <div className="result-card">
            <p className="result-emoji">{percent >= 60 ? '🎉' : '💪'}</p>
            <h1 className="result-title">{TEXT.resultTitle}</h1>
            <div className="result-score-ring" style={{ '--p': percent }}>
              <span className="result-score-num">
                {percent}
                <em>{TEXT.scoreSuffix}</em>
              </span>
            </div>
            <p className="result-count">
              {TEXT.correctCount} <strong>{score}</strong> / {total}
            </p>
            <div className="result-actions">
              <button className="btn-ghost" type="button" onClick={handleRetry}>
                {TEXT.retry}
              </button>
              <button className="btn-primary" type="button" onClick={() => navigate('/')}>
                {TEXT.goHome}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const progressPercent = ((index + (submitted ? 1 : 0)) / total) * 100;
  const correct = submitted && isCorrect();

  return (
    <div className="solve-page">
      <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />

      <main className="solve-main">
        {/* 진행률 바 */}
        <div className="solve-progress">
          <div className="solve-progress-info">
            <span>
              {TEXT.question} {index + 1} / {total}
            </span>
            {timeLimit > 0 && (
              <span className={`solve-timer ${timeLeft <= 5 ? 'urgent' : ''}`}>
                ⏱ {timeLeft}s
              </span>
            )}
          </div>
          <div className="solve-progress-track">
            <div
              className="solve-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {timeLimit > 0 && (
            <div className="solve-timer-track">
              <div
                className={`solve-timer-fill ${timeLeft <= 5 ? 'urgent' : ''}`}
                style={{ width: `${(timeLeft / timeLimit) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* 문제 카드 */}
        <div className="solve-card">
          <span className="solve-type-badge">
            {current.type === 'multiple' ? '객관식' : '주관식'}
          </span>
          <h1 className="solve-question-title">{current.title}</h1>
          {current.description && (
            <p className="solve-question-desc">{current.description}</p>
          )}

          {/* 객관식 */}
          {current.type === 'multiple' && (
            <div className="solve-options">
              {current.options.map((opt) => {
                let state = '';
                if (submitted) {
                  if (opt.id === current.answer) state = 'correct';
                  else if (opt.id === selected) state = 'wrong';
                } else if (opt.id === selected) {
                  state = 'selected';
                }
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`solve-option ${state}`}
                    disabled={submitted}
                    onClick={() => setSelected(opt.id)}
                  >
                    <span className="solve-option-mark">{opt.id.toUpperCase()}</span>
                    <span className="solve-option-text">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 주관식 */}
          {current.type === 'short' && (
            <input
              className={`solve-short-input ${
                submitted ? (correct ? 'correct' : 'wrong') : ''
              }`}
              type="text"
              value={inputValue}
              disabled={submitted}
              placeholder={TEXT.shortPlaceholder}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canSubmit && !submitted) handleSubmit();
              }}
            />
          )}

          {/* 즉시 피드백 */}
          {submitted && (
            <div className={`solve-feedback ${correct ? 'correct' : 'wrong'}`}>
              <p className="solve-feedback-title">
                {timeLeft === 0 && !correct && !canSubmit
                  ? TEXT.timeUp
                  : correct
                  ? TEXT.correct
                  : TEXT.wrong}
              </p>
              {!correct && (
                <p className="solve-feedback-answer">
                  {TEXT.answerLabel}:{' '}
                  <strong>
                    {current.type === 'multiple'
                      ? current.options.find((o) => o.id === current.answer)?.text
                      : current.answer}
                  </strong>
                </p>
              )}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="solve-footer">
          {!submitted ? (
            <button
              className="btn-primary"
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {TEXT.submit}
            </button>
          ) : (
            <button className="btn-primary" type="button" onClick={handleNext}>
              {index + 1 >= total ? TEXT.showResult : TEXT.next}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}