import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import iconUrl from '../../assets/quizzly-icon.png';
import './CreateQuiz.css';

const TEXT = {
  home: 'Quizzly',
  cancel: '취소',
  save: '저장',
  quizCreate: '퀴즈 만들기',
  title: '제목',
  description: '설명',
  category: '카테고리',
  thumbnail: '퀴즈 썸네일',
  visibility: '공개여부 선택',
  order: '문제 출제 순서',
  public: '공개',
  private: '비공개',
  titlePlaceholder: '제목을 입력하세요. (최대 50자)',
  descriptionPlaceholder: '설명을 입력하세요. (최대 100자)',
  categoryPlaceholder: '카테고리를 선택하세요.',
  music: '음악',
  commonSense: '상식',
  movie: '영화',
  game: '게임',
  food: '음식',
  sports: '스포츠',
  person: '인물',
  anime: '애니',
  etc: '기타',
  thumbnailAdd: '이미지 추가',
  thumbnailHint: '클릭하여 이미지를 업로드하세요.',
  thumbnailSpec: '권장: 16:9 비율, 최대 5MB',
  thumbnailSizeError: '파일 크기가 5MB를 초과합니다. 다른 파일을 선택해주세요.',
  titleRequired: '제목을 입력해주세요.',
  timer: '문제 타이머',
};

const categories = [
  TEXT.categoryPlaceholder,
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

const timerOptions = [
  { value: 5, label: '5초' },
  { value: 10, label: '10초' },
  { value: 15, label: '15초' },
  { value: 20, label: '20초' },
  { value: 0, label: '시간제한 없음' },
];

const orderTypes = [
  {
    id: 'random',
    icon: 'random',
    title: '랜덤',
    desc: '문제가 무작위 순서로 출제됩니다.',
  },
  {
    id: 'sequential',
    icon: 'sequential',
    title: '순서대로',
    desc: '문제가 등록된 순서대로 출제됩니다.',
  },
];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('이미지를 읽지 못했습니다.'));
    reader.readAsDataURL(file);
  });
}

function CreateHeader({ onCancel, onSave }) {
  return (
    <header className="site-header create-header">
      <button className="header-logo create-header-logo" type="button" onClick={onCancel} aria-label={TEXT.home}>
        <img src={iconUrl} alt="" />
      </button>
      <nav className="header-actions" aria-label={TEXT.quizCreate}>
        <button className="pill-button compact" type="button" onClick={onCancel}>
          {TEXT.cancel}
        </button>
        <button className="pill-button compact" type="button" onClick={onSave}>
          {TEXT.save}
        </button>
      </nav>
    </header>
  );
}

function Field({ label, children }) {
  return (
    <label className="create-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ThumbnailIcon() {
  return (
    <svg className="thumbnail-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2.5" y="4" width="19" height="16" rx="2.5" fill="none" stroke="#002d56" strokeWidth="1.8" />
      <circle cx="8.5" cy="9.5" r="1.8" fill="#002d56" />
      <path d="M4 18l5-5 3.5 3.5L16 12l4 6z" fill="#002d56" />
    </svg>
  );
}

function ThumbnailUpload({ thumbnailFile, existingUrl, onChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError(TEXT.thumbnailSizeError);
      event.target.value = '';
      return;
    }
    setError('');
    onChange('thumbnailFile', file);
  };

  const handleRemove = (event) => {
    event.stopPropagation();
    setError('');
    onChange('thumbnailFile', null);
    onChange('existingThumbnailUrl', null);
    inputRef.current.value = '';
  };

  const showExisting = !thumbnailFile && existingUrl;

  return (
    <div className="create-field">
      <span>{TEXT.thumbnail}</span>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleChange} />
      <button className="thumbnail-dropzone" type="button" onClick={() => inputRef.current.click()}>
        {thumbnailFile ? (
          <div className="thumbnail-file-info">
            <svg className="thumbnail-file-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="#002d56" strokeWidth="1.8" strokeLinejoin="round" />
              <polyline points="14 2 14 8 20 8" fill="none" stroke="#002d56" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
            <span className="thumbnail-file-name">{thumbnailFile.name}</span>
            <button className="thumbnail-remove" type="button" aria-label="파일 삭제" onClick={handleRemove}>✕</button>
          </div>
        ) : showExisting ? (
          <div className="thumbnail-file-info">
            <img src={existingUrl} alt="기존 썸네일" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
            <span className="thumbnail-file-name">기존 썸네일 (클릭하여 변경)</span>
            <button className="thumbnail-remove" type="button" aria-label="썸네일 제거" onClick={handleRemove}>✕</button>
          </div>
        ) : (
          <>
            <ThumbnailIcon />
            <span className="thumbnail-add">{TEXT.thumbnailAdd}</span>
            <span className="thumbnail-hint">{TEXT.thumbnailHint}</span>
            <span className="thumbnail-spec">{TEXT.thumbnailSpec}</span>
          </>
        )}
      </button>
      {error && <span className="thumbnail-error">{error}</span>}
    </div>
  );
}

function OrderIcon({ type }) {
  if (type === 'random') {
    return (
      <svg className="order-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M3 5h3.5c1.2 0 2.3.6 3 1.6L17 16c.7 1 1.8 1.6 3 1.6H22M3 17h3.5c1.2 0 2.3-.6 3-1.6l1-1.4M21.5 14l2.5 2.5-2.5 2.5M21.5 8l2.5-2.5L21.5 3M17 8l1-1.4c.7-1 1.8-1.6 3-1.6H22"
          fill="none"
          stroke="#002d56"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(-1 0)"
        />
      </svg>
    );
  }

  return (
    <svg className="order-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9 6h12M9 12h12M9 18h12"
        fill="none"
        stroke="#002d56"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="4" cy="6" r="1.4" fill="#002d56" />
      <circle cx="4" cy="12" r="1.4" fill="#002d56" />
      <circle cx="4" cy="18" r="1.4" fill="#002d56" />
    </svg>
  );
}

function SettingsStep({ form, onChange, onSave }) {
  return (
    <section className="create-large-panel settings-panel" aria-label={TEXT.quizCreate}>
      <div className="panel-title-row">
        <h1>{TEXT.quizCreate}</h1>
      </div>
      <div className="create-panel-line" />

      <div className="settings-grid">
        <div className="settings-left">
          <Field label={TEXT.title}>
            <input
              maxLength={50}
              value={form.title}
              onChange={(event) => onChange('title', event.target.value)}
              placeholder={TEXT.titlePlaceholder}
            />
          </Field>

          <Field label={TEXT.description}>
            <textarea
              maxLength={100}
              value={form.description}
              onChange={(event) => onChange('description', event.target.value)}
              placeholder={TEXT.descriptionPlaceholder}
            />
          </Field>

          <Field label={TEXT.category}>
            <select value={form.category} onChange={(event) => onChange('category', event.target.value)}>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="settings-right">
          <ThumbnailUpload thumbnailFile={form.thumbnailFile} existingUrl={form.existingThumbnailUrl} onChange={onChange} />

          <div className="create-field">
            <span>{TEXT.visibility}</span>
            <button
              className={form.visibility === 'public' ? 'visibility-switch active' : 'visibility-switch'}
              type="button"
              aria-label={form.visibility === 'public' ? TEXT.public : TEXT.private}
              aria-pressed={form.visibility === 'public'}
              onClick={() => onChange('visibility', form.visibility === 'public' ? 'private' : 'public')}
            >
              <span />
            </button>
          </div>

          <div className="create-field">
            <span>{TEXT.timer}</span>
            <div className="timer-chip-group">
              {timerOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={form.timeLimit === opt.value ? 'timer-chip selected' : 'timer-chip'}
                  type="button"
                  onClick={() => onChange('timeLimit', opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="create-field order-field">
        <span className="order-label">
          {TEXT.order}
          <span className="order-info" aria-hidden="true">{'\u24D8'}</span>
        </span>
        <div className="order-card-grid">
          {orderTypes.map((order) => (
            <button
              className={form.order === order.id ? 'order-card selected' : 'order-card'}
              key={order.id}
              type="button"
              aria-pressed={form.order === order.id}
              onClick={() => onChange('order', order.id)}
            >
              <span className="order-radio" aria-hidden="true">
                <span />
              </span>
              <OrderIcon type={order.icon} />
              <span className="order-text">
                <span className="order-title">{order.title}</span>
                <span className="order-desc">{order.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <button className="panel-save-button" type="button" onClick={onSave}>
        {TEXT.save}
      </button>
    </section>
  );
}

function CreateQuizPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: categories[0],
    visibility: 'public',
    order: 'random',
    timeLimit: 20,
    thumbnailFile: null,
    existingThumbnailUrl: null,
  });

  // 편집 모드: sessionStorage에 editId가 있으면 폼 초기화
  useEffect(() => {
    const raw = sessionStorage.getItem('quizDraft');
    if (!raw) return;
    const draft = JSON.parse(raw);
    if (!draft.editId) return;
    setForm({
      title: draft.title || '',
      description: draft.description || '',
      category: draft.category || categories[0],
      visibility: draft.visibility || 'public',
      order: draft.order || 'random',
      timeLimit: draft.timeLimit ?? 20,
      thumbnailFile: null,
      existingThumbnailUrl: draft.thumbnail || null,
    });
  }, []);

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert(TEXT.titleRequired);
      return;
    }

    const prevRaw = sessionStorage.getItem('quizDraft');
    const prev = prevRaw ? JSON.parse(prevRaw) : {};

    let thumbnail = form.existingThumbnailUrl ?? null;
    if (form.thumbnailFile) {
      try {
        thumbnail = await fileToDataUrl(form.thumbnailFile);
      } catch {
        thumbnail = null;
      }
    }

    const draft = {
      ...(prev.editId ? { editId: prev.editId, questions: prev.questions } : {}),
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category === TEXT.categoryPlaceholder ? null : form.category,
      visibility: form.visibility,
      order: form.order,
      timeLimit: form.timeLimit,
      thumbnail,
    };
    sessionStorage.setItem('quizDraft', JSON.stringify(draft));
    navigate('/add');
  };

  const handleCancel = () => {
    sessionStorage.removeItem('quizDraft');
    navigate(-1);
  };
 
  return (
    <div className="create-page">
      <CreateHeader onCancel={handleCancel} onSave={handleSave} />
      <main className="create-main create-main-settings">
        <SettingsStep form={form} onChange={updateForm} onSave={handleSave} />
      </main>
    </div>
  );
}

export default CreateQuizPage;