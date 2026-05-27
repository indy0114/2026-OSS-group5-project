import { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { deleteAccount, getMe } from '../../api/auth.js';
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
  quizEditButton: '\uC218\uC815',
  quizDeleteButton: '\uC0AD\uC81C',
  deleteConfirm: '\uC815\uB9D0 \uACC4\uC815\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694? \uC0AD\uC81C\uD558\uBA74 \uB418\uB3CC\uB9B4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
  deleteError: '\uACC4\uC815\uC744 \uC0AD\uC81C\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.',
};

const MOCK_QUIZZES = [
  {
    id: 1,
    title: '\uD034\uC988 \uC81C\uBAA9',
    tags: ['\uC8FC\uAD00\uC2DD', '\uC0C1\uC2DD'],
    description: '\uD034\uC988 \uC124\uBA85\uC774 \uC5EC\uAE30\uC5D0 \uB4E4\uC5B4\uAC11\uB2C8\uB2E4.',
  },
  { id: 2, title: '', tags: [], description: '' },
  { id: 3, title: '', tags: [], description: '' },
];

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

function UserInfo({ userInfo, onDeleteAccount }) {
  return (
    <>
      <div className="mypage-field">
        <label>{TEXT.idLabel}</label>
        <input type="text" value={userInfo.id} disabled />
      </div>

      <div className="mypage-field">
        <label>{TEXT.emailLabel}</label>
        <input type="email" value={userInfo.email} disabled />
      </div>

      <div className="mypage-field">
        <label>{TEXT.passwordLabel}</label>
        <input type="password" value="********" disabled />
      </div>

      <div className="mypage-info-actions">
        <button className="mypage-btn danger" type="button" onClick={onDeleteAccount}>
          {TEXT.deleteButton}
        </button>

        <div>
          <button className="mypage-btn primary" type="button" disabled>
            {TEXT.editButton}
          </button>
        </div>
      </div>
    </>
  );
}

function QuizList({ quizzes }) {
  return quizzes.map((quiz) => (
    <div key={quiz.id} className="mypage-quiz-item">
      <div className="mypage-quiz-thumbnail" />

      <div className="mypage-quiz-info">
        {quiz.title && <p className="mypage-quiz-title">{quiz.title}</p>}

        {quiz.tags.length > 0 && (
          <div className="mypage-quiz-tags">
            {quiz.tags.map((tag) => (
              <span key={tag} className="mypage-quiz-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {quiz.description && <p className="mypage-quiz-desc">{quiz.description}</p>}
      </div>

      <div className="mypage-quiz-actions">
        <button className="mypage-btn primary small" type="button">
          {TEXT.quizEditButton}
        </button>
        <button className="mypage-btn danger small" type="button">
          {TEXT.quizDeleteButton}
        </button>
      </div>
    </div>
  ));
}

function MyPage({ user, onAccountDeleted }) {
  const [infoOpen, setInfoOpen] = useState(true);
  const [quizOpen, setQuizOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      return;
    }

    getMe().then(setCurrentUser).catch(() => setCurrentUser(null));
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
          <UserInfo userInfo={userInfo} onDeleteAccount={handleDeleteAccount} />
        </Accordion>

        <Accordion title={TEXT.quizSection} open={quizOpen} onToggle={() => setQuizOpen((prev) => !prev)}>
          <QuizList quizzes={MOCK_QUIZZES} />
        </Accordion>
      </div>
    </div>
  );
}

export default MyPage;
