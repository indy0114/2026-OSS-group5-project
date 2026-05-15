import { useMemo, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/common/Header.jsx';
import HeroSection from './components/main/HeroSection.jsx';
import QuizSection from './components/main/QuizSection.jsx';
import Login from './components/auth/Login.jsx';
import Signup from './components/auth/Signup.jsx';

const TEXT = {
  all: '전체', quizTitle: '퀴즈 제목', multipleChoice: '객관식', shortAnswer: '주관식',
  ox: 'O/X', mixed: '혼합형', photo: '사진', simpleQuiz: '카테고리에 어울리는 가벼운 퀴즈',
  commonSense: '상식', commonSenseCheck: '상식 체크', commonSenseDescription: '기본 상식을 빠르게 확인해요',
  movie: '영화', movieQuiz: '영화 장면 맞히기', movieDescription: '인기 영화 속 장면 퀴즈',
  music: '음악', musicQuiz: '음악 퀴즈', musicDescription: '가사와 멜로디 힌트를 보고 맞혀요',
  sports: '스포츠', sportsRecord: '스포츠 기록', sportsDescription: '기억에 남는 스포츠 순간들',
};

const quizzes = [
  { id: 1, title: TEXT.quizTitle, type: TEXT.multipleChoice, category: TEXT.photo, description: TEXT.simpleQuiz, createdAt: '2026-05-05' },
  { id: 2, title: TEXT.commonSenseCheck, type: TEXT.shortAnswer, category: TEXT.commonSense, description: TEXT.commonSenseDescription, createdAt: '2026-05-04' },
  { id: 3, title: TEXT.movieQuiz, type: TEXT.ox, category: TEXT.movie, description: TEXT.movieDescription, createdAt: '2026-05-03' },
  { id: 4, title: TEXT.musicQuiz, type: TEXT.multipleChoice, category: TEXT.music, description: TEXT.musicDescription, createdAt: '2026-05-02' },
  { id: 5, title: TEXT.sportsRecord, type: TEXT.mixed, category: TEXT.sports, description: TEXT.sportsDescription, createdAt: '2026-05-01' },
];

const quizFeed = Array.from({ length: 30 }, (_, index) => {
  const quiz = quizzes[index % quizzes.length];
  return {
    ...quiz,
    id: index + 1,
    title: index < quizzes.length ? quiz.title : `${quiz.title} ${Math.floor(index / quizzes.length) + 1}`,
    createdAt: `2026-04-${String(30 - index).padStart(2, '0')}`,
  };
});

function MainPage() {
  const [activeCategory, setActiveCategory] = useState(TEXT.all);
  const [query, setQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');

  const filteredQuizzes = useMemo(() => {
    const visibleQuizzes = quizFeed.filter((quiz) => {
      const matchesCategory = activeCategory === TEXT.all || quiz.category === activeCategory;
      const keyword = query.trim().toLowerCase();
      const matchesQuery = !keyword || quiz.title.toLowerCase().includes(keyword) || quiz.category.toLowerCase().includes(keyword);
      return matchesCategory && matchesQuery;
    });
    return [...visibleQuizzes].sort((a, b) => {
      if (sortOrder === 'name') return a.title.localeCompare(b.title, 'ko');
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [activeCategory, query, sortOrder]);

  return (
    <main>
      <HeroSection />
      <QuizSection
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        query={query}
        onQueryChange={setQuery}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        quizzes={filteredQuizzes}
      />
    </main>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="app">
      <Header
        isLoggedIn={isLoggedIn}
        onLogin={() => setIsLoginOpen(true)}
        onLogout={() => setIsLoggedIn(false)}
      />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/signup" element={<Signup onLoginOpen={() => setIsLoginOpen(true)} />} />
      </Routes>
      <Login
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          setIsLoginOpen(false);
        }}
      />
    </div>
  );
}
export default App;