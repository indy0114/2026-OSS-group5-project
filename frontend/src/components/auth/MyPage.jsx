import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { deleteAccount, getMe, getMyQuizzes, deleteQuiz, updateMe } from '../../api/auth.js';
import { getQuiz } from '../../api/quizzes.js';
import './MyPage.css';

const TEXT = {
  title: '\uB9C8\uC774\uD398\uC774\uC9C0',
  infoSection: '\uB0B4 \uC815\uBCF4 \uC870\uD68C',
  quizSection: '\uB0B4 \uD034\uC988 \uC870\uD68C',
  idLabel: '\uC544\uC774\uB514',
  emailLabel: '\uC774\uBA54\uC77C',
  passwordLabel: '\uBE44\uBC00\uBC88\uD638',
  deleteButton: '\uACC4\uC815\uC0AD\uC81C',
  editButton: '\uC218\uC815',
  saveButton: '저장',
  cancelButton: '취소',
  passwordHint: '변경 시에만 입력',
  quizEditButton: '\uC218\uC815',
  quizDeleteButton: '\uC0AD\uC81C',
  deleteConfirm: '\uC815\uB9D0 \uACC4\uC815\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694? \uC0AD\uC81C\uD558\uBA74 \uB418\uB3CC\uB9B4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
  deleteError: '\uACC4\uC815\uC744 \uC0AD\uC81C\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.',
  editError: '정보를 수정하지 못했습니다.',
};

function Accordion({title, open, onToggle, children}) {
  return(
    <div className={`mypage-accordion ${open ? 'open' : ''}`}>
      <button className="mypage-accordion-header" onClick={onToggle}>
        <span>{title}</span>
        <span className="mypage-chevro">
          {open ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </button>
      {open && <div className="mypage-accordion-body">{children}</div>}
    </div>
  );
}

function UserInfo({ userInfo, onSave, onDeleteAccount }) {
  const [editing, setEditing] = useState(false);
  const [id, setId] = useState(userInfo.id);
  const [email, setEmail] = useState(userInfo.email);
  const [password, setPassword] = useState('');

  useEffect(() => {
    setId(userInfo.id);
    setEmail(userInfo.email);
  }, [userInfo.id, userInfo.email]);

  const startEdit = () => {
    setId(userInfo.id);
    setEmail(userInfo.email);
    setPassword('');
    setEditing(true);
  };

  const cancelEdit = () => {
    setPassword('');
    setEditing(false);
  };

  const handleSave = async () => {
    const changes = {};
    if (id !== userInfo.id) changes.username = id;
    if (email !== userInfo.email) changes.email = email;
    if (password) changes.password = password;

    if (Object.keys(changes).length === 0) {
      setEditing(false);
      return;
    }

    const ok = await onSave(changes);
    if (ok) {
      setPassword('');
      setEditing(false);
    }
  };

  return (
    <>
      <div className="mypage-field">
        <label>{TEXT.idLabel}</label>
        <input type="text" value={id} onChange={(e) => setId(e.target.value)} disabled={!editing} />
      </div>

      <div className="mypage-field">
        <label>{TEXT.emailLabel}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!editing} />
      </div>

      <div className="mypage-field">
        <label>{TEXT.passwordLabel}</label>
        <input
          type="password"
          value={editing ? password : '********'}
          placeholder={editing ? TEXT.passwordHint : ''}
          onChange={(e) => setPassword(e.target.value)}
          disabled={!editing}
        />
      </div>

      <div className="mypage-info-actions">
        <button className="mypage-btn danger" onClick={handleCancel}>
          {TEXT.deleteButton}
        </button>

        <div>
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

function MyPage({ user, onAccountDeleted }) {
  const navigate = useNavigate();
  const [infoOpen, setInfoOpen] = useState(true);
  const [quizOpen, setQuizOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [errorMessage, setErrorMessage] = useState('');
  const [myQuizzes, setMyQuizzes] = useState([]);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    } else {
      getMe().then(setCurrentUser).catch(() => setCurrentUser(null));
    }

    getMyQuizzes()
      .then(setMyQuizzes)
      .catch((err) => console.error(err));
  }, [user]);

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

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('이 퀴즈를 삭제할까요?')) return;
    try {
      await deleteQuiz(quizId);
      setMyQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    } catch (error) {
      setErrorMessage(error.message || '퀴즈를 삭제하지 못했습니다.');
    }
  };

  const handleUpdateInfo = async (changes) => {
    setErrorMessage('');
    try {
      const updated = await updateMe(changes);
      setCurrentUser(updated);
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
      </div>
    </div>
  );
}

export default MyPage;