import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { deleteAccount, getMe, getMyQuizzes, deleteQuiz, updateMe, getToken } from '../../api/auth.js';
import { getQuiz, getLikedQuizzes } from '../../api/quizzes.js';
import './MyPage.css';

const TEXT = {
  title: '마이페이지',
  infoSection: '내 정보 조회',
  quizSection: '내 퀴즈 조회',
  likedSection: '좋아요한 퀴즈 조회',
  idLabel: '아이디',
  emailLabel: '이메일',
  passwordLabel: '비밀번호',
  deleteButton: '계정삭제',
  editButton: '수정',
  saveButton: '저장',
  cancelButton: '취소',
  passwordHint: '변경 시에만 입력',
  quizEditButton: '수정',
  quizDeleteButton: '삭제',
  quizSolveButton: '풀기',
  deleteConfirm: '정말 계정을 삭제할까요? 삭제하면 되돌릴 수 없습니다.',
  deleteError: '계정을 삭제하지 못했습니다.',
  editError: '정보를 수정하지 못했습니다.',
};

function Accordion({ title, open, onToggle, children }) {
  return (
    <div className={`mypage-accordion ${open ? 'open' : ''}`}>
      <button className="mypage-accordion-header" type="button" onClick={onToggle}>
        <span>{title}</span>
        <span className="mypage-chevro">{open ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>
      {open && <div className="mypage-accordion-body">{children}</div>}
    </div>
  );
}

//내 정보 관리 -> 유저 정보 조회 및 수정/탈퇴
function UserInfo({ userInfo, onSave, onDeleteAccount }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({id: '', email: '', password: ''});
  const [showPassword, setShowPassword] = useState(false);

  //수정
  const startEdit = () => {
    setDraft({ id: userInfo.id, email: userInfo.email, password: ''});
    setEditing(true);
  };

  //수정 취소
  const cancelEdit = () => {
    setEditing(false);
  };

  //수정 저장
  const handleSave = async () => {
    const changes = {};

    if (draft.id !== userInfo.id) changes.username = draft.id;
    if (draft.email !== userInfo.email) changes.email = draft.email;
    if (draft.password) changes.password = draft.password;

    //바뀐 데이터가 없을 경우 서버 요청 없이 수정 모드 닫음
    if (Object.keys(changes).length == 0) {
      setEditing(false);
      return;
    }

    const ok = await onSave(changes);
    if (ok) {
      setEditing(false);
    }
  };

  return (
    <>
      <div className="mypage-field">
        <label>{TEXT.idLabel}</label>
        <input 
          type="text" 
          value={editing ? draft.id : userInfo.id} 
          onChange={(e) => setDraft({ ...draft, id: e.target.value })} 
          disabled={!editing} 
        />
      </div>

      <div className="mypage-field">
        <label>{TEXT.emailLabel}</label>
        <input 
          type="email" 
          value={editing ? draft.email : userInfo.email} 
          onChange={(e) => setDraft({ ...draft, email: e.target.value })} 
          disabled={!editing} 
        />
      </div>

      <div className="mypage-field">
        <label>{TEXT.passwordLabel}</label>
        <div className="password-row">
          <input
            type={showPassword ? 'text' : 'password'}
            value={editing ? draft.password : '********'}
            placeholder={editing ? TEXT.passwordHint : ''}
            onChange={(e) => setDraft({ ...draft, password: e.target.value })}
            disabled={!editing}
          />
          {editing && (
            <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="mypage-info-actions">
        {/* 계정 삭제 */}
        <button className="mypage-btn danger" type="button" onClick={onDeleteAccount}>
          {TEXT.deleteButton}
        </button>

        <div>
          {/* 수정 모드 여부에 따라 다른 버튼 */}
          {editing ? (
            <>
              <button className="mypage-btn" type="button" onClick={cancelEdit}>
                {TEXT.cancelButton}
              </button>
              <button className="mypage-btn primary" type="button" onClick={handleSave}>
                {TEXT.saveButton}
              </button>
            </>
          ) : (
            <button className="mypage-btn primary" type="button" onClick={startEdit}>
              {TEXT.editButton}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

//퀴즈 목록 -> 내 퀴즈들을 리스트로 보여줌
function QuizList({ quizzes, onDeleteQuiz, onEditQuiz }) {
  return quizzes.map((quiz) => (
    <div key={quiz.id} className="mypage-quiz-item">
      <div className="mypage-quiz-thumbnail" />
      <div className="mypage-quiz-info">
        {quiz.title && <p className="mypage-quiz-title">{quiz.title}</p>}
        {quiz.tags.length > 0 && (
          <div className="mypage-quiz-tags">
            {quiz.tags.map((tag) => (
              <span key={tag} className="mypage-quiz-tag">{tag}</span>
            ))}
          </div>
        )}
        {quiz.description && <p className="mypage-quiz-desc">{quiz.description}</p>}
      </div>
      <div className="mypage-quiz-actions">
        <button className="mypage-btn primary small" type="button" onClick={() => onEditQuiz(quiz.id)}>
          {TEXT.quizEditButton}
        </button>
        <button
          className="mypage-btn danger small"
          type="button"
          onClick={() => onDeleteQuiz(quiz.id)}
        >
          {TEXT.quizDeleteButton}
        </button>
      </div>
    </div>
  ));
}

// 좋아요한 퀴즈 목록
function LikedQuizList({ quizzes }) {
  const navigate = useNavigate();

  if (quizzes.length === 0) {
    return (
      <p style={{ textAlign: 'center', padding: '30px', color: '#888', fontSize: '16px' }}>
        좋아요한 퀴즈가 없습니다.
      </p>
    );
  }

  return quizzes.map((quiz) => (
    <div key={quiz.id} className="mypage-quiz-item">
      <div
        className="mypage-quiz-thumbnail"
        style={
          quiz.thumbnail
            ? {
                backgroundImage: `url(${quiz.thumbnail})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      />
      <div className="mypage-quiz-info">
        <p className="mypage-quiz-title">{quiz.title}</p>
        <div className="mypage-quiz-tags">
          {quiz.category && <span className="mypage-quiz-tag">{quiz.category}</span>}
          <span className="mypage-quiz-tag">{quiz.question_count}문제</span>
          <span className="mypage-quiz-tag liked-count-tag">♥ {quiz.like_count}</span>
        </div>
        {quiz.description && <p className="mypage-quiz-desc">{quiz.description}</p>}
      </div>
      <div className="mypage-quiz-actions">
        <button
          className="mypage-btn primary small"
          type="button"
          onClick={() => navigate(`/solve/${quiz.id}`)}
        >
          {TEXT.quizSolveButton}
        </button>
      </div>
    </div>
  ));
}

//마이페이지 메인 컴포넌트
function MyPage({ user, onAccountDeleted }) {
  const navigate = useNavigate();
  const [infoOpen, setInfoOpen] = useState(true);
  const [quizOpen, setQuizOpen] = useState(false);
  const [likeOpen, setLikeOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [errorMessage, setErrorMessage] = useState('');
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [likedQuizzes, setLikedQuizzes] = useState([]);
  const [likeLoadError, setLikeLoadError] = useState(false);

  const fetchLikedQuizzes = useCallback(() => {
    if (!getToken()) return;
    setLikeLoadError(false);
    getLikedQuizzes()
      .then(setLikedQuizzes)
      .catch((err) => {
        console.error('좋아요 퀴즈 목록 조회 실패:', err);
        setLikeLoadError(true);
      });
  }, []);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    } else {
      getMe().then(setCurrentUser).catch(() => setCurrentUser(null));
    }

    getMyQuizzes()
      .then(setMyQuizzes)
      .catch((err) => console.error(err));

    fetchLikedQuizzes();
  }, [user, fetchLikedQuizzes]);

  //계정 삭제
  const handleDeleteAccount = async () => {
    if (!window.confirm(TEXT.deleteConfirm)) return;
    setErrorMessage('');
    try {
      await deleteAccount();
      onAccountDeleted?.();
    } catch (error) {
      setErrorMessage(error.message || TEXT.deleteError);
    }
  };

  //퀴즈 수정 -> 특정 아이디의 퀴즈만 수정
  const handleEditQuiz = async (quizId) => {
    try {
      const data = await getQuiz(quizId);
      sessionStorage.setItem(
        'quizDraft',
        JSON.stringify({
          editId: data.id,
          title: data.title || '',
          description: data.description || '',
          category: data.category || null,
          visibility: data.visibility || 'public',
          order: data.order_mode || 'random',
          timeLimit: data.questions?.[0]?.timeLimit ?? 20,
          thumbnail: data.thumbnail || null,
          questions: data.questions || [],
        }),
      );
      navigate('/create');
    } catch (error) {
      setErrorMessage(error.message || '퀴즈 정보를 불러오지 못했습니다.');
    }
  };

  //퀴즈 삭제
  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('이 퀴즈를 삭제할까요?')) return;
    try {
      await deleteQuiz(quizId);
      setMyQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    } catch (error) {
      setErrorMessage(error.message || '퀴즈를 삭제하지 못했습니다.');
    }
  };

  //내 정보 저장 (업데이트)
  const handleUpdateInfo = async (changes) => {
    setErrorMessage('');
    try {
      const updated = await updateMe(changes);
      setCurrentUser(updated); //성공 시 화면 업데이트
      return true;
    } catch (error) {
      setErrorMessage(error.message || TEXT.editError);
      return false;
    }
  };

  const userInfo = {
    id: currentUser?.username ?? '',
    email: currentUser?.email ?? '',
  };

  return (
    <div className="mypage-page">
      <div className="mypage-card">
        <p className="mypage-title">{TEXT.title}</p>

        {errorMessage && <p className="mypage-error">{errorMessage}</p>}

        <Accordion title={TEXT.infoSection} open={infoOpen} onToggle={() => setInfoOpen((prev) => !prev)}>
          <UserInfo userInfo={userInfo} onSave={handleUpdateInfo} onDeleteAccount={handleDeleteAccount} />
        </Accordion>

        <Accordion title={TEXT.quizSection} open={quizOpen} onToggle={() => setQuizOpen((prev) => !prev)}>
          {myQuizzes.length > 0 ? (
            <QuizList quizzes={myQuizzes} onDeleteQuiz={handleDeleteQuiz} onEditQuiz={handleEditQuiz} />
          ) : (
            <p style={{ textAlign: 'center', padding: '30px', color: '#888', fontSize: '16px' }}>
              생성한 퀴즈가 없습니다.
            </p>
          )}
        </Accordion>

        <Accordion title={TEXT.likedSection} open={likeOpen} onToggle={() => setLikeOpen((prev) => !prev)}>
          {likeLoadError ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <p style={{ color: '#e74c3c', marginBottom: '12px' }}>좋아요한 퀴즈를 불러오지 못했습니다.</p>
              <button className="mypage-btn primary" type="button" onClick={fetchLikedQuizzes}>
                다시 시도
              </button>
            </div>
          ) : (
            <LikedQuizList quizzes={likedQuizzes} />
          )}
        </Accordion>
      </div>
    </div>
  );
}

export default MyPage;