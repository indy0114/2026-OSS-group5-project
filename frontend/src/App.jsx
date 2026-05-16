import { useMemo, useState } from 'react';
import Header from './components/common/Header.jsx';
import HeroSection from './components/main/HeroSection.jsx';
import QuizSection from './components/main/QuizSection.jsx';
import Login from './components/auth/Login.jsx';
import CreateQuizPage from './components/create/CreateQuizPage.jsx';

const TEXT = {
  all: '\uC804\uCCB4',
  quizTitle: '\uD034\uC988 \uC81C\uBAA9',
  multipleChoice: '\uAC1D\uAD00\uC2DD',
  shortAnswer: '\uC8FC\uAD00\uC2DD',
  ox: 'O/X',
  mixed: '\uD63C\uD569\uD615',
  photo: '\uC0AC\uC9C4',
  simpleQuiz: '\uCE74\uD14C\uACE0\uB9AC\uC5D0 \uC5B4\uC6B8\uB9AC\uB294 \uAC00\uBCBC\uC6B4 \uD034\uC988',
  commonSense: '\uC0C1\uC2DD',
  commonSenseCheck: '\uC0C1\uC2DD \uCCB4\uD06C',
  commonSenseDescription: '\uAE30\uBCF8 \uC0C1\uC2DD\uC744 \uBE60\uB974\uAC8C \uD655\uC778\uD574\uC694',
  movie: '\uC601\uD654',
  movieQuiz: '\uC601\uD654 \uC7A5\uBA74 \uB9DE\uD788\uAE30',
  movieDescription: '\uC778\uAE30 \uC601\uD654 \uC18D \uC7A5\uBA74 \uD034\uC988',
  music: '\uC74C\uC545',
  musicQuiz: '\uC74C\uC545 \uD034\uC988',
  musicDescription: '\uAC00\uC0AC\uC640 \uBA5C\uB85C\uB514 \uD78C\uD2B8\uB97C \uBCF4\uACE0 \uB9DE\uD600\uC694',
  sports: '\uC2A4\uD3EC\uCE20',
  sportsRecord: '\uC2A4\uD3EC\uCE20 \uAE30\uB85D',
  sportsDescription: '\uAE30\uC5B5\uC5D0 \uB0A8\uB294 \uC2A4\uD3EC\uCE20 \uC21C\uAC04\uB4E4',
};

const quizzes = [
  {
    id: 1,
    title: TEXT.quizTitle,
    type: TEXT.multipleChoice,
    category: TEXT.photo,
    description: TEXT.simpleQuiz,
    createdAt: '2026-05-05',
  },
  {
    id: 2,
    title: TEXT.commonSenseCheck,
    type: TEXT.shortAnswer,
    category: TEXT.commonSense,
    description: TEXT.commonSenseDescription,
    createdAt: '2026-05-04',
  },
  {
    id: 3,
    title: TEXT.movieQuiz,
    type: TEXT.ox,
    category: TEXT.movie,
    description: TEXT.movieDescription,
    createdAt: '2026-05-03',
  },
  {
    id: 4,
    title: TEXT.musicQuiz,
    type: TEXT.multipleChoice,
    category: TEXT.music,
    description: TEXT.musicDescription,
    createdAt: '2026-05-02',
  },
  {
    id: 5,
    title: TEXT.sportsRecord,
    type: TEXT.mixed,
    category: TEXT.sports,
    description: TEXT.sportsDescription,
    createdAt: '2026-05-01',
  },
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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeCategory, setActiveCategory] = useState(TEXT.all);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [activeView, setActiveView] = useState('home');
  const [query, setQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');

  const filteredQuizzes = useMemo(() => {
    const visibleQuizzes = quizFeed.filter((quiz) => {
        const matchesCategory = activeCategory === TEXT.all || quiz.category === activeCategory;
        const keyword = query.trim().toLowerCase();
        const matchesQuery =
          !keyword ||
          quiz.title.toLowerCase().includes(keyword) ||
          quiz.category.toLowerCase().includes(keyword);

        return matchesCategory && matchesQuery;
      });

    return [...visibleQuizzes].sort((first, second) => {
      if (sortOrder === 'name') {
        return first.title.localeCompare(second.title, 'ko');
      }

      return new Date(second.createdAt) - new Date(first.createdAt);
    });
  }, [activeCategory, query, sortOrder]);

return (
    <div className="app">
      {activeView === 'create' ? (
        <CreateQuizPage onCancel={() => setActiveView('home')} />
      ) : (
        <>
          <Header
            isLoggedIn={isLoggedIn}
            onLogin={() => setIsLoginOpen(true)}
            onLogout={() => setIsLoggedIn(false)}
          />
          <main>
            <HeroSection onCreateQuiz={() => setActiveView('create')} />
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
        </>
      )}

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
