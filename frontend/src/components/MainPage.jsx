import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoUrl from '../assets/quizzly-logo-cropped.png';
import { getQuizzes, toggleLike, getMyLikes } from '../api/quizzes.js';
import './MainPage.css';

const TEXT = {
  all: '전체',
  makeQuiz: '퀴즈 만들기',
  solveQuiz: '랜덤 퀴즈 풀기',
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
  loading: '퀴즈를 불러오는 중...',
  empty: '아직 등록된 퀴즈가 없어요. 첫 퀴즈를 만들어보세요!',
  loadError: '퀴즈를 불러오지 못했어요. 잠시 후 다시 시도해주세요.',
  questionUnit: '문제',
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

/* Hero Section */
function HeroSection({ onCreateQuiz, onSolveRandomQuiz }) {
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
        <button className="secondary-action" type="button" onClick={onSolveRandomQuiz}>
          {TEXT.solveQuiz}
        </button>
      </div>
      <a className="scroll-cue" href="#quiz-list" aria-label={TEXT.goToList}>
        <span />
      </a>
    </section>
  );
}

/* Heart Icon */
function HeartIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill={filled ? '#ff3b5c' : 'none'}
        stroke={filled ? '#ff3b5c' : 'rgba(255,255,255,0.9)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Quiz Card Section */
function QuizCard({ quiz, onClick, liked, likeCount, onLike }) {
  return (
    <article className="quiz-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div
        className="thumbnail"
        style={
          quiz.thumbnail
            ? {
                backgroundImage: `url(${quiz.thumbnail})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        <button
          className={`like-btn${liked ? ' liked' : ''}`}
          type="button"
          onClick={(e) => { e.stopPropagation(); onLike(quiz.id); }}
          aria-label={liked ? '좋아요 취소' : '좋아요'}
        >
          <HeartIcon filled={liked} />
          <span className="like-count">{likeCount}</span>
        </button>
      </div>
      <div className="card-body">
        <div className="card-title-row">
          <h2>{quiz.title}</h2>
          {quiz.viewCount > 0 && <span className="card-view-count">👁 {quiz.viewCount}</span>}
        </div>
        <div className="card-meta">
          <span>{quiz.category}</span>
          <span>
            {quiz.questionCount}
            {TEXT.questionUnit}
          </span>
          {quiz.author && <span>{quiz.author}</span>}
        </div>
        <p>{quiz.description}</p>
      </div>
    </article>
  );
}

/* Quiz Section */
function CustomSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="custom-select" ref={ref}>
      <button
        type="button"
        className="custom-select-btn"
        onClick={() => setOpen((v) => !v)}
      >
        {current?.label}
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="custom-select-options">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`custom-select-option${o.value === value ? ' active' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function QuizSection({
  activeCategory,
  onCategoryChange,
  query,
  onQueryChange,
  searchType,
  onSearchTypeChange,
  sortOrder,
  onSortOrderChange,
  quizzes,
  loading,
  error,
  likedIds,
  likeCounts,
  onLike,
  allCategories,
}) {
  const navigate = useNavigate();
  const [categoryExpanded, setCategoryExpanded] = useState(false);
  const withoutEtc = allCategories.filter((c) => c !== TEXT.etc);
  const visibleCategories = categoryExpanded
    ? allCategories
    : [...withoutEtc.slice(0, 9), TEXT.etc];

  return (
    <section className="quiz-section" id="quiz-list" aria-label={TEXT.quizList}>
      <div className="quiz-toolbar">
        <div className="search-field-wrap">
          <CustomSelect
            value={searchType}
            onChange={onSearchTypeChange}
            options={[
              { value: 'all', label: '전체' },
              { value: 'title', label: '제목' },
              { value: 'author', label: '작성자' },
              { value: 'tag', label: '카테고리' },
            ]}
          />
          <label className="search-field">
            <span className="sr-only">{TEXT.search}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={TEXT.placeholder}
            />
          </label>
        </div>
        <CustomSelect
          value={sortOrder}
          onChange={onSortOrderChange}
          options={[
            { value: 'latest', label: TEXT.latest },
            { value: 'name', label: TEXT.name },
            { value: 'views', label: '조회순' },
          ]}
        />
      </div>

      <div className="category-list" aria-label={TEXT.category}>
        {visibleCategories.map((category) => (
          <button
            className={category === activeCategory ? 'category-chip active' : 'category-chip'}
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
        {allCategories.length > 10 && (
          <button
            className="category-chip category-more"
            type="button"
            onClick={() => setCategoryExpanded((v) => !v)}
          >
            {categoryExpanded ? '접기 ▲' : '더보기 ▼'}
          </button>
        )}
      </div>
 
      {loading ? (
        <p className="quiz-status">{TEXT.loading}</p>
      ) : error ? (
        <p className="quiz-status">{TEXT.loadError}</p>
      ) : quizzes.length === 0 ? (
        <p className="quiz-status">{TEXT.empty}</p>
      ) : (
        <div className="quiz-grid">
          {quizzes.map((quiz) => (
            <QuizCard
              quiz={quiz}
              key={quiz.id}
              onClick={() => navigate(`/solve/${quiz.id}`)}
              liked={likedIds.has(quiz.id)}
              likeCount={likeCounts[quiz.id] ?? quiz.likeCount ?? 0}
              onLike={onLike}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* Main Section */
function MainPage({ onCreateQuiz, isLoggedIn }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(TEXT.all);
  const [query, setQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');
  const [searchType, setSearchType] = useState('all');

  const [allQuizzes, setAllQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [likedIds, setLikedIds] = useState(new Set());
  const [likeCounts, setLikeCounts] = useState({});

  useEffect(() => {
    let alive = true;
    getQuizzes()
      .then((data) => {
        if (!alive) return;
        const mapped = data.map((q) => ({
          id: q.id,
          title: q.title,
          category: q.category || TEXT.etc,
          description: q.description || '',
          questionCount: q.question_count ?? 0,
          thumbnail: q.thumbnail || null,
          createdAt: q.created_at,
          likeCount: q.like_count ?? 0,
          author: q.author || '',
          tags: q.tags || [],
          viewCount: q.view_count ?? 0,
        }));
        setAllQuizzes(mapped);
        const counts = {};
        mapped.forEach((q) => { counts[q.id] = q.likeCount; });
        setLikeCounts(counts);
      })
      .catch((e) => {
        if (alive) setError(e.message || 'error');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setLikedIds(new Set());
      return;
    }
    getMyLikes()
      .then(({ liked_ids }) => setLikedIds(new Set(liked_ids)))
      .catch((err) => console.error('좋아요 목록 조회 실패:', err));
  }, [isLoggedIn]);

  const handleLike = (quizId) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const alreadyLiked = likedIds.has(quizId);
    const prevCount = likeCounts[quizId] ?? 0;

    // 낙관적 업데이트
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (alreadyLiked) next.delete(quizId);
      else next.add(quizId);
      return next;
    });
    setLikeCounts((prev) => ({
      ...prev,
      [quizId]: Math.max(0, prevCount + (alreadyLiked ? -1 : 1)),
    }));

    toggleLike(quizId)
      .then(({ liked, like_count }) => {
        setLikedIds((prev) => {
          const next = new Set(prev);
          if (liked) next.add(quizId);
          else next.delete(quizId);
          return next;
        });
        setLikeCounts((prev) => ({ ...prev, [quizId]: like_count }));
      })
      .catch(() => {
        // 실패 시 원복
        setLikedIds((prev) => {
          const next = new Set(prev);
          if (alreadyLiked) next.add(quizId);
          else next.delete(quizId);
          return next;
        });
        setLikeCounts((prev) => ({ ...prev, [quizId]: prevCount }));
      });
  };
 
  const handleSolveRandomQuiz = () => {
    if (allQuizzes.length === 0) {
      alert('아직 등록된 퀴즈가 없어요. 첫 퀴즈를 만들어보세요!');
      return;
    }
    const randomIndex = Math.floor(Math.random() * allQuizzes.length);
    const randomQuiz = allQuizzes[randomIndex];
    navigate(`/solve/${randomQuiz.id}`);
  };
 
  const filteredQuizzes = useMemo(() => {
    const visible = allQuizzes.filter((quiz) => {
      const matchesCategory = activeCategory === TEXT.all || quiz.category === activeCategory;
      const keyword = query.trim().toLowerCase();
      const matchesQuery = !keyword || (() => {
        const title = quiz.title.toLowerCase().includes(keyword);
        const author = (quiz.author ?? '').toLowerCase().includes(keyword);
        const category = (quiz.category ?? '').toLowerCase().includes(keyword);
        if (searchType === 'title') return title;
        if (searchType === 'author') return author;
        if (searchType === 'tag') return category;
        return title || author || category;
      })();
 
      return matchesCategory && matchesQuery;
    });
 
    return [...visible].sort((a, b) => {
      if (sortOrder === 'name') return a.title.localeCompare(b.title, 'ko');
      if (sortOrder === 'views') return (b.viewCount ?? 0) - (a.viewCount ?? 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [allQuizzes, activeCategory, query, sortOrder, searchType]);
 
  const allCategories = useMemo(() => {
    const withoutEtc = categories.filter((c) => c !== TEXT.etc);
    const custom = allQuizzes
      .map((q) => q.category)
      .filter((c) => c && !categories.includes(c));
    const unique = [...new Set(custom)];
    return [...withoutEtc, ...unique, TEXT.etc];
  }, [allQuizzes]);

  return (
    <main>
      <HeroSection onCreateQuiz={onCreateQuiz} onSolveRandomQuiz={handleSolveRandomQuiz} />
      <QuizSection
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        query={query}
        onQueryChange={setQuery}
        searchType={searchType}
        onSearchTypeChange={setSearchType}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        quizzes={filteredQuizzes}
        loading={loading}
        error={error}
        likedIds={likedIds}
        likeCounts={likeCounts}
        onLike={handleLike}
        allCategories={allCategories}
      />
    </main>
  );
}

export default MainPage;
