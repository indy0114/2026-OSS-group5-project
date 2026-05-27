import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import './MyPage.css';

const TEXT = {
  title: '마이페이지',
  infoSection: '내 정보 수정',
  quizSection: '내 퀴즈 조회',
  idLabel: '아이디',
  emailLabel: '이메일',
  passwordLabel: '비밀번호',
  deleteButton: '계정삭제',
  editButton: '수정',
  saveButton: '저장',
  quizEditButton: '수정',
  quizDeleteButton: '삭제',
};

const MOCK_QUIZZES = [
  { id: 1, title: '퀴즈제목', tags: ['주종류', '난이도'], description: '퀴즈설명 어쩌고 저쩌고' },
  { id: 2, title: '', tags: [], description: '' },
  { id: 3, title: '', tags: [], description: '' },
];

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

//유저정보
function UserInfo({userInfo, setUserInfo}) {
  const [isEditing, setIsEditing] = useState(false);
  const [temp, setTmp] = useState(userInfo);

  const handleSave = () => {
    setUserInfo(temp);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTmp(userInfo);
    setIsEditing(false);
  };

  return (
    <>
      {['id', 'email', 'password'].map((field) => (
        <div className="mypage-field" key={field}>
          <label>{TEXT[`${field}Label`]}</label>
          <input
            type={field === 'password' ? 'password' : 'text'}
            value={temp[field]}
            disabled={!isEditing}
            placeholder={field === 'password' ? '••••••••' : ''}
            onChange={(e) => setTmp({...temp, [field]: e.target.value})}
          />
        </div>
      ))}

      <div className="mypage-info-actions">
        <button className="mypage-btn danger" onClick={handleCancel}>
          {TEXT.deleteButton}
        </button>

        <div>
          {!isEditing ? (
            <button className="mypage-btn primary" onClick={() => setIsEditing(true)}>
              {TEXT.editButton}
            </button>
          ) : (
            <button className="mypage-btn primary" onClick={handleSave}>
              {TEXT.saveButton}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

//퀴즈리스트
function QuizList({quizzes}) {
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

        {quiz.description && (
          <p className="mypage-quiz-desc">{quiz.description}</p>
        )}
      </div>

      <div className="mypage-quiz-actions">
        <button className="mypage-btn primary small">{TEXT.quizEditButton}</button>
        <button className="mypage-btn danger small">{TEXT.quizDeleteButton}</button>
      </div>
    </div>
  ));
}

//메인
function MyPage() {
  const [isfoOpen, setInfoOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);

  const [userInfo, setUserInfo] = useState({
    id: 'user123',
    email: 'user@example.com',
    password: '',
  });

  return (
    <div className="mypage-page">
      <div className="mypage-card">
        <p className="mypage-title">{TEXT.title}</p>

        <Accordion
          title={TEXT.infoSection}
          open={isfoOpen}
          onToggle={() => setInfoOpen((prev) => !prev)}
        >
          <UserInfo userInfo={userInfo} setUserInfo={setUserInfo} />
        </Accordion>

        <Accordion
          title={TEXT.quizSection}
          open={quizOpen}
          onToggle={() => setQuizOpen((prev) => !prev)}
        >
          <QuizList quizzes={MOCK_QUIZZES} />
        </Accordion>
      </div>
    </div>
  );
}

export default MyPage;