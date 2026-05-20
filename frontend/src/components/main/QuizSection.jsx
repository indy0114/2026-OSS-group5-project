/*import { useState } from 'react';
import QuizCard from './QuizCard.jsx';

const TEXT = {
  all: '\uC804\uCCB4',
  commonSense: '\uC0C1\uC2DD',
  photo: '\uC0AC\uC9C4',
  movie: '\uC601\uD654',
  music: '\uC74C\uC545',
  sports: '\uC2A4\uD3EC\uCE20',
  quizList: '\uD034\uC988 \uBAA9\uB85D',
  search: '\uD034\uC988 \uAC80\uC0C9',
  placeholder: '\uAC80\uC0C9\uC5B4\uB97C \uC785\uB825\uD558\uC138\uC694.',
  sortLabel: '\uC815\uB82C',
  sort: '\uC815\uB82C',
  latest: '\uCD5C\uC2E0\uC21C',
  name: '\uC774\uB984\uC21C',
  category: '\uCE74\uD14C\uACE0\uB9AC',
};

const categories = [TEXT.all, TEXT.commonSense, TEXT.photo, TEXT.movie, TEXT.music, TEXT.sports];

function QuizSection({
  activeCategory,
  onCategoryChange,
  query,
  onQueryChange,
  sortOrder,
  onSortOrderChange,
  quizzes,
}) {
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

export default QuizSection;
