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
  latest: '최신순',
  name: '이름순',
  category: '카테고리',
  music: '음악',
  commonSense: '상식',
  movie: '영화',
  game: '게임',
  food: '음식',
  sports: '스포츠',
  person: '인물',
  anime: '애니',
  etc: '기타',
  multipleChoice: '객관식',
  shortAnswer: '주관식',
  ox: 'O/X',
  mixed: '혼합형',
};

const categories = [
  TEXT.all,
  TEXT.music,
  TEXT.commonSense,
  TEXT.movie,
  TEXT.game,
  TEXT.food,
  TEXT.sports,
  TEXT.person,
  TEXT.anime,
  TEXT.etc,
];

const quizzes = [
  {
    id: 1,
    title: '\uC74C\uC545 \uD034\uC988',
    type: TEXT.multipleChoice,
    category: TEXT.music,
    description: '\uC778\uAE30 \uC74C\uC545\uACFC \uAC00\uC218\uB97C \uB9DE\uD600\uBCF4\uC138\uC694.',
    createdAt: '2026-05-05',
  },
  {
    id: 2,
    title: '\uC0C1\uC2DD \uCCB4\uD06C',
    type: TEXT.shortAnswer,
    category: TEXT.commonSense,
    description: '\uAE30\uBCF8 \uC0C1\uC2DD\uC744 \uBE60\uB974\uAC8C \uD655\uC778\uD574\uC694.',
    createdAt: '2026-05-04',
  },
  {
    id: 3,
    title: '\uC601\uD654 \uC7A5\uBA74 \uB9DE\uD788\uAE30',
    type: TEXT.ox,
    category: TEXT.movie,
    description: '\uC778\uAE30 \uC601\uD654 \uC18D \uC7A5\uBA74 \uD034\uC988',
    createdAt: '2026-05-03',
  },
  {
    id: 4,
    title: '\uAC8C\uC784 \uCE90\uB9AD\uD130',
    type: TEXT.multipleChoice,
    category: TEXT.game,
    description: '\uAC8C\uC784 \uC18D \uCE90\uB9AD\uD130\uB97C \uB9DE\uD600\uBCF4\uC138\uC694.',
    createdAt: '2026-05-02',
  },
  {
    id: 5,
    title: '\uC74C\uC2DD \uC0C1\uC2DD',
    type: TEXT.mixed,
    category: TEXT.food,
    description: '\uC5EC\uB7EC \uAC00\uC9C0 \uC74C\uC2DD\uC5D0 \uAD00\uD55C \uD034\uC988',
    createdAt: '2026-05-01',
  },
  {
    id: 6,
    title: '\uC2A4\uD3EC\uCE20 \uAE30\uB85D',
    type: TEXT.shortAnswer,
    category: TEXT.sports,
    description: '\uAE30\uC5B5\uC5D0 \uB0A8\uB294 \uC2A4\uD3EC\uCE20 \uC21C\uAC04\uB4E4',
    createdAt: '2026-04-30',
  },
  {
    id: 7,
    title: '\uC778\uBB3C \uD034\uC988',
    type: TEXT.multipleChoice,
    category: TEXT.person,
    description: '\uC720\uBA85 \uC778\uBB3C\uC744 \uD78C\uD2B8\uB85C \uB9DE\uD600\uBCF4\uC138\uC694.',
    createdAt: '2026-04-29',
  },
  {
    id: 8,
    title: '\uC560\uB2C8 \uC791\uD488 \uD034\uC988',
    type: TEXT.ox,
    category: TEXT.anime,
    description: '\uC560\uB2C8\uBA54\uC774\uC158 \uC791\uD488\uACFC \uCE90\uB9AD\uD130 \uD034\uC988',
    createdAt: '2026-04-28',
  },
  {
    id: 9,
    title: '\uAE30\uD0C0 \uC7A1\uD559',
    type: TEXT.mixed,
    category: TEXT.etc,
    description: '\uC5EC\uB7EC \uC8FC\uC81C\uAC00 \uC11E\uC778 \uC7A1\uD559 \uD034\uC988',
    createdAt: '2026-04-27',
  },
];

const quizFeed = Array.from({ length: 36 }, (_, index) => {
  const quiz = quizzes[index % quizzes.length];

  return {
    ...quiz,
    id: index + 1,
    title: index < quizzes.length ? quiz.title : `${quiz.title} ${Math.floor(index / quizzes.length) + 1}`,
    createdAt: `2026-04-${String(30 - index).padStart(2, '0')}`,
  };
});

function HeroSection({ onCreateQuiz }) {
  return (
    <section className="hero" aria-labelledby="home-title">
      <h1 id="home-title" className="sr-only">
        Quizzly
      </h1>
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
