import { useMemo, useState } from 'react';
import logoUrl from '../assets/quizzly-logo-cropped.png';
import './MainPage.css';

const TEXT = {
  all: '전체',
  makeQuiz: '퀴즈 만들기',
  solveQuiz: '퀴즈 풀기',
  goToList: '퀴즈 목록으로 이동',
  quizList: '퀴즈 목록',
  search: '퀴즈 검색',
  placeholder: '검색어를 입력하세요.',
  sortLabel: '정렬',
  sort: '정렬',
  latest: '최신순',
  name: '이름순',
  category: '카테고리',
  commonSense: '상식',
  photo: '사진',
  movie: '영화',
  music: '음악',
  sports: '스포츠',
  quizTitle: '퀴즈 제목',
  multipleChoice: '객관식',
  shortAnswer: '주관식',
  ox: 'O/X',
  mixed: '혼합형',
  simpleQuiz: '카테고리에 어울리는 가벼운 퀴즈',
  commonSenseCheck: '상식 체크',
  commonSenseDescription: '기본 상식을 빠르게 확인해요',
  movieQuiz: '영화 장면 맞히기',
  movieDescription: '인기 영화 속 장면 퀴즈',
  musicQuiz: '음악 퀴즈',
  musicDescription: '가사와 멜로디 힌트를 보고 맞혀요',
  sportsRecord: '스포츠 기록',
  sportsDescription: '기억에 남는 스포츠 순간들',
};

const categories = [TEXT.all, TEXT.commonSense, TEXT.photo, TEXT.movie, TEXT.music, TEXT.sports];

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

//HeroSection
function HeroSection({ onCreateQuiz }) {
  return (
    <section className="hero" aria-labelledby="home-title">
      <h1 id="home-title" className="sr-only">Quizzly</h1>
      <img className="hero-logo" src={logoUrl} alt="Quizzly" />
      <div className="hero-actions">
        <button className="primary-action" type="button" onClick={onCreateQuiz}>
          {TEXT.makeQuiz}
        </button>
        <button className="secondary-action" type="button">
          {TEXT.solveQuiz}
        </button>
      </div>
      <a className="scroll-cue" href="#quiz-list" aria-label={TEXT.goToList}>
        <span />
      </a>
    </section>
  );
}

//QuizCard
function QuizCard({ quiz }) {
  return (
    <article className="quiz-card">
      <div className="thumbnail" aria-hidden="true" />
      <div className="card-body">
        <h2>{quiz.title}</h2>
        <div className="card-meta">
          <span>{quiz.type}</span>
          <span>{quiz.category}</span>
        </div>
        <p>{quiz.description}</p>
      </div>
    </article>
  );
}

//QuizSection
function QuizSection({ activeCategory, onCategoryChange, query, onQueryChange, sortOrder, onSortOrderChange, quizzes }) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const currentSortText = sortOrder === 'name' ? TEXT.name : TEXT.latest;

  const handleSortChange = (nextSortOrder) => {
    onSortOrderChange(nextSortOrder);
    setIsSortOpen(false);
  };

  return (
    <section className="quiz-section" id="quiz-list" aria-label={TEXT.quizList}>
      <div className="quiz-toolbar">
        <label className="search-field">
          <span className="sr-only">{TEXT.search}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={TEXT.placeholder}
          />
        </label>

        <div className="sort-menu" aria-label={TEXT.sortLabel}>
          <button
            className="sort-button"
            type="button"
            onClick={() => setIsSortOpen((isOpen) => !isOpen)}
            aria-expanded={isSortOpen}
            aria-haspopup="menu"
          >
            {currentSortText}
          </button>

          {isSortOpen && (
            <div className="sort-options" role="menu">
              <button
                className={sortOrder === 'latest' ? 'sort-option active' : 'sort-option'}
                type="button"
                onClick={() => handleSortChange('latest')}
                role="menuitem"
              >
                {TEXT.latest}
              </button>
              <button
                className={sortOrder === 'name' ? 'sort-option active' : 'sort-option'}
                type="button"
                onClick={() => handleSortChange('name')}
                role="menuitem"
              >
                {TEXT.name}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="category-list" aria-label={TEXT.category}>
        {categories.map((category) => (
          <button
            className={category === activeCategory ? 'category-chip active' : 'category-chip'}
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="quiz-grid">
        {quizzes.map((quiz) => (
          <QuizCard quiz={quiz} key={quiz.id} />
        ))}
      </div>
    </section>
  );
}

function MainPage({ onCreateQuiz }) {
  const [activeCategory, setActiveCategory] = useState(TEXT.all);
  const [query, setQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');

  const filteredQuizzes = useMemo(() => {
    const visible = quizFeed.filter((quiz) => {
      const matchesCategory = activeCategory === TEXT.all || quiz.category === activeCategory;
      const keyword = query.trim().toLowerCase();
      const matchesQuery =
        !keyword ||
        quiz.title.toLowerCase().includes(keyword) ||
        quiz.category.toLowerCase().includes(keyword);
      return matchesCategory && matchesQuery;
    });

    return [...visible].sort((a, b) => {
      if (sortOrder === 'name') return a.title.localeCompare(b.title, 'ko');
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [activeCategory, query, sortOrder]);

  return (
    <main>
      <HeroSection onCreateQuiz={onCreateQuiz} />
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

export default MainPage;