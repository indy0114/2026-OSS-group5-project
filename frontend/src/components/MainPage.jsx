import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoUrl from '../assets/quizzly-logo-cropped.png';
import { getQuizzes, toggleLike, getMyLikes } from '../api/quizzes.js';
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
        <h2>{quiz.title}</h2>
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
function QuizSection({
  activeCategory,
  onCategoryChange,
  query,
  onQueryChange,
  sortOrder,
  onSortOrderChange,
  quizzes,
  loading,
  error,
  likedIds,
  likeCounts,
  onLike,
}) {
  const navigate = useNavigate();
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
  }, [allQuizzes, activeCategory, query, sortOrder]);
 
  return (
    <main>
      <HeroSection onCreateQuiz={onCreateQuiz} onSolveRandomQuiz={handleSolveRandomQuiz} />
      <QuizSection
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        query={query}
        onQueryChange={setQuery}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        quizzes={filteredQuizzes}
        loading={loading}
        error={error}
        likedIds={likedIds}
        likeCounts={likeCounts}
        onLike={handleLike}
      />
    </main>
  );
}

export default MainPage;
