import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import iconUrl from '../../assets/quizzly-icon.png';
import { createQuiz, updateQuiz } from '../../api/quizzes.js';
import './AddQuiz.css';

const TEXT = {
  home: 'Quizzly',
  cancel: '취소',
  save: '저장',
  deleteSlide: '슬라이드 삭제',
  incompleteError: '퀴즈가 완성되지 않았습니다.',
  noDraftError: '퀴즈 기본정보가 없습니다. 처음부터 다시 시도해주세요.',
  saveFailed: '퀴즈 저장에 실패했습니다.',
  slideCreate: '퀴즈 슬라이드 만들기',
  questionTitle: '문제 타이틀',
  questionTitlePlaceholder: '문제의 제목을 입력하세요. (최대 50자)',
  extraDesc: '부가 설명 (선택)',
  extraDescPlaceholder: '문제에 대한 추가 설명을 입력하세요. (최대 200자)',
  media: '미디어 첨부 (선택)',
  photo: '사진 첨부',
  video: '영상 첨부',
  music: '음악 첨부',
  add: '+ 추가',
  link: '링크',
  linkPlaceholder: '외부 링크(URL)를 입력하세요.',
  mediaFormat: '지원 형식: 이미지 (JPG, PNG) / 영상 (MP4, MOV) / 음악 (MP3, WAV)',
  mediaSize: '파일 크기: 최대 50MB',
  answerType: '답변 형식 선택',
  subjective: '주관식',
  objective: '객관식',
  subjectiveSetting: '주관식 설정',
  objectiveSetting: '객관식 설정',
  allowedAnswer: '허용 가능한 답변',
  addAnswer: '+ 답변 추가',
  answerPlaceholder: '정답으로 인정할 답변을 입력하세요.',
  subjectiveHint: '최소 1개 이상 입력해야 등록한 답변과 유사한 답변을 정답으로 인정합니다.',
  optionPlaceholder: '보기를 입력하세요.',
  addOption: '+ 보기 추가',
  objectiveHint: '정답인 보기를 선택하세요. (여러 개 선택 가능)',
  // 검증 메시지
  titleRequired: '문제 타이틀을 입력해주세요.',
  answerRequired: '정답으로 인정할 답변을 1개 이상 입력해주세요.',
  optionRequired: '보기를 1개 이상 입력해주세요.',
  correctRequired: '정답인 보기를 선택해주세요.',
};

function AddHeader({ onCancel, onSave }) {
  return (
    <header className="site-header add-header">
      <button className="header-logo add-header-logo" type="button" onClick={onCancel} aria-label={TEXT.home}>
        <img src={iconUrl} alt="" />
      </button>
      <nav className="header-actions" aria-label={TEXT.slideCreate}>
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

function PlusIcon() {
  return (
    <svg className="slide-plus-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="none" stroke="#002d56" strokeWidth="1.8" />
      <path d="M12 8v8M8 12h8" stroke="#002d56" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6"
        fill="none"
        stroke="#002d56"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhotoIcon() {
  return (
    <svg className="media-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="#002d56" strokeWidth="1.8" />
      <circle cx="8.5" cy="10" r="1.6" fill="#002d56" />
      <path d="M4 17l5-5 3 3 4-4 4 4" fill="none" stroke="#002d56" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg className="media-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="6" width="13" height="12" rx="2" fill="none" stroke="#002d56" strokeWidth="1.8" />
      <path d="M16 10l5-3v10l-5-3z" fill="none" stroke="#002d56" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function MusicIcon() {
  return (
    <svg className="media-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 18V5l10-2v13" fill="none" stroke="#002d56" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="6" cy="18" r="3" fill="none" stroke="#002d56" strokeWidth="1.8" />
      <circle cx="16" cy="16" r="3" fill="none" stroke="#002d56" strokeWidth="1.8" />
    </svg>
  );
}

function SubjectiveIcon() {
  return (
    <svg className="answer-type-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h16v11H9l-4 3v-3H4z" fill="none" stroke="#002d56" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function ObjectiveIcon() {
  return (
    <svg className="answer-type-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6h12M9 12h12M9 18h12" fill="none" stroke="#002d56" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="4" cy="6" r="1.4" fill="#002d56" />
      <circle cx="4" cy="12" r="1.4" fill="#002d56" />
      <circle cx="4" cy="18" r="1.4" fill="#002d56" />
    </svg>
  );
}

/* ---------- 미디어 첨부 카드 (파일 + 링크) ---------- */
function MediaCard({ icon, label, accept, media, onChangeMedia }) {
  const inputRef = useRef(null);
  // media: { file: File|null, link: string }

  const handlePick = (event) => {
    const selected = event.target.files[0];
    if (!selected) return;
    if (selected.size > 50 * 1024 * 1024) {
      alert('파일 크기가 50MB를 초과합니다.');
      event.target.value = '';
      return;
    }
    onChangeMedia({ ...media, file: selected });
  };

  const handleRemoveFile = () => {
    onChangeMedia({ ...media, file: null });
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleLinkChange = (event) => {
    onChangeMedia({ ...media, link: event.target.value });
  };

  return (
    <div className="media-card">
      {icon}
      <span className="media-label">{label}</span>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={handlePick}
      />

      {media.file ? (
        <button className="media-file-chip" type="button" onClick={handleRemoveFile} title={media.file.name}>
          <span className="media-file-name">{media.file.name}</span>
          <span className="media-file-x">✕</span>
        </button>
      ) : (
        <button className="media-add-button" type="button" onClick={() => inputRef.current.click()}>
          {TEXT.add}
        </button>
      )}

      <input
        className="media-link-input"
        type="url"
        value={media.link}
        onChange={handleLinkChange}
        placeholder={TEXT.linkPlaceholder}
      />
    </div>
  );
}

function SlideListView({ slides, onAdd, onEdit, onDelete }) {
  return (
    <main className="add-main add-main-list">
      <div className="slide-grid">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            className="slide-card"
            type="button"
            onClick={() => onEdit(slide.id)}
          >
            <span className="slide-card-title">{slide.title || `문제 ${index + 1}`}</span>
            <span
              className="slide-card-delete"
              role="button"
              tabIndex={0}
              aria-label={TEXT.deleteSlide}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(slide.id);
              }}
            >
              <TrashIcon className="slide-trash-icon" />
            </span>
          </button>
        ))}

        <button className="slide-card add" type="button" onClick={onAdd}>
          <PlusIcon />
        </button>
      </div>
    </main>
  );
}

function SlideDetailView({ slide, onChange, onSaveSlide, onCancel }) {
  const updateAnswer = (index, value) => {
    const next = [...slide.answers];
    next[index] = value;
    onChange('answers', next);
  };

  const addAnswer = () => {
    onChange('answers', [...slide.answers, '']);
  };

  const removeAnswer = (index) => {
    // 답변은 최소 1개 유지
    if (slide.answers.length <= 1) return;
    const next = slide.answers.filter((_, i) => i !== index);
    onChange('answers', next);
    // 객관식 정답 인덱스 보정 (삭제된 인덱스 제거 + 뒤 인덱스 당기기)
    if (slide.type === 'objective') {
      const nextCorrect = slide.correctList
        .filter((i) => i !== index)
        .map((i) => (i > index ? i - 1 : i));
      onChange('correctList', nextCorrect);
    }
  };

  const toggleCorrect = (index) => {
    const exists = slide.correctList.includes(index);
    const next = exists
      ? slide.correctList.filter((i) => i !== index)
      : [...slide.correctList, index].sort((a, b) => a - b);
    onChange('correctList', next);
  };

  const changeType = (type) => {
    if (type === slide.type) return;
    // 형식 전환 시 답변 목록 초기화 (서로 갯수 안 물려받게)
    onChange('type', type);
    onChange('answers', ['']);
    onChange('correctList', []);
  };

  return (
    <main className="add-main add-main-detail">
      <section className="add-large-panel" aria-label={TEXT.slideCreate}>
        <div className="panel-title-row">
          <h1>{TEXT.slideCreate}</h1>
        </div>
        <div className="add-panel-line" />

        <div className="detail-grid">
          <div className="detail-left">
            <label className="add-field">
              <span>{TEXT.questionTitle}</span>
              <input
                maxLength={50}
                value={slide.title}
                onChange={(event) => onChange('title', event.target.value)}
                placeholder={TEXT.questionTitlePlaceholder}
              />
            </label>

            <label className="add-field">
              <span>{TEXT.extraDesc}</span>
              <textarea
                maxLength={200}
                value={slide.desc}
                onChange={(event) => onChange('desc', event.target.value)}
                placeholder={TEXT.extraDescPlaceholder}
              />
            </label>

            <div className="add-field">
              <span>{TEXT.media}</span>
              <div className="media-grid">
                <MediaCard
                  icon={<PhotoIcon />}
                  label={TEXT.photo}
                  accept="image/*"
                  media={slide.photo}
                  onChangeMedia={(value) => onChange('photo', value)}
                />
                <MediaCard
                  icon={<VideoIcon />}
                  label={TEXT.video}
                  accept="video/*"
                  media={slide.video}
                  onChangeMedia={(value) => onChange('video', value)}
                />
                <MediaCard
                  icon={<MusicIcon />}
                  label={TEXT.music}
                  accept="audio/*"
                  media={slide.audio}
                  onChangeMedia={(value) => onChange('audio', value)}
                />
              </div>
              <span className="media-format">{TEXT.mediaFormat}</span>
              <span className="media-format">{TEXT.mediaSize}</span>
            </div>
          </div>

          <div className="detail-right">
            <div className="add-field">
              <span>{TEXT.answerType}</span>
              <div className="answer-type-grid">
                <button
                  className={slide.type === 'subjective' ? 'answer-type-card selected' : 'answer-type-card'}
                  type="button"
                  aria-pressed={slide.type === 'subjective'}
                  onClick={() => changeType('subjective')}
                >
                  <span className="answer-radio" aria-hidden="true"><span /></span>
                  <SubjectiveIcon />
                  <span className="answer-type-text">{TEXT.subjective}</span>
                </button>
                <button
                  className={slide.type === 'objective' ? 'answer-type-card selected' : 'answer-type-card'}
                  type="button"
                  aria-pressed={slide.type === 'objective'}
                  onClick={() => changeType('objective')}
                >
                  <span className="answer-radio" aria-hidden="true"><span /></span>
                  <ObjectiveIcon />
                  <span className="answer-type-text">{TEXT.objective}</span>
                </button>
              </div>
            </div>

            {slide.type === 'subjective' && (
              <div className="subjective-panel">
                <h2>{TEXT.subjectiveSetting}</h2>
                <div className="subjective-head">
                  <span className="subjective-label">
                    {TEXT.allowedAnswer}
                    <span className="subjective-info" aria-hidden="true">{'\u24D8'}</span>
                  </span>
                  <button className="add-answer-button" type="button" onClick={addAnswer}>
                    {TEXT.addAnswer}
                  </button>
                </div>

                <div className="answer-list">
                  {slide.answers.map((answer, index) => (
                    <div className="answer-row" key={index}>
                      <input
                        value={answer}
                        onChange={(event) => updateAnswer(index, event.target.value)}
                        placeholder={TEXT.answerPlaceholder}
                      />
                      <button
                        className="answer-delete"
                        type="button"
                        aria-label="답변 삭제"
                        disabled={slide.answers.length <= 1}
                        onClick={() => removeAnswer(index)}
                      >
                        <TrashIcon className="answer-trash-icon" />
                      </button>
                    </div>
                  ))}
                </div>
                <span className="subjective-hint">{TEXT.subjectiveHint}</span>
              </div>
            )}

            {slide.type === 'objective' && (
              <div className="subjective-panel">
                <h2>{TEXT.objectiveSetting}</h2>
                <div className="subjective-head">
                  <span className="subjective-label">{TEXT.objectiveHint}</span>
                  <button className="add-answer-button" type="button" onClick={addAnswer}>
                    {TEXT.addOption}
                  </button>
                </div>

                <div className="answer-list">
                  {slide.answers.map((answer, index) => (
                    <div className="answer-row" key={index}>
                      <button
                        className={slide.correctList.includes(index) ? 'option-check checked' : 'option-check'}
                        type="button"
                        aria-label="정답 선택"
                        aria-pressed={slide.correctList.includes(index)}
                        onClick={() => toggleCorrect(index)}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M5 12l5 5 9-10" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <input
                        value={answer}
                        onChange={(event) => updateAnswer(index, event.target.value)}
                        placeholder={TEXT.optionPlaceholder}
                      />
                      <button
                        className="answer-delete"
                        type="button"
                        aria-label="보기 삭제"
                        disabled={slide.answers.length <= 1}
                        onClick={() => removeAnswer(index)}
                      >
                        <TrashIcon className="answer-trash-icon" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button className="panel-save-button" type="button" onClick={onSaveSlide}>
          {TEXT.save}
        </button>
      </section>
    </main>
  );
}

function validateSlide(slide) {
  if (!slide.title.trim()) {
    return TEXT.titleRequired;
  }

  const filledAnswers = slide.answers.filter((answer) => answer.trim());

  if (slide.type === 'subjective') {
    if (filledAnswers.length === 0) {
      return TEXT.answerRequired;
    }
  } else {
    if (filledAnswers.length === 0) {
      return TEXT.optionRequired;
    }

    if (slide.correctList.length === 0) {
      return TEXT.correctRequired;
    }
    const hasEmptyCorrect = slide.correctList.some(
      (i) => !slide.answers[i] || !slide.answers[i].trim(),
    );
    if (hasEmptyCorrect) {
      return TEXT.correctRequired;
    }
  }

  return null;
}

function slideToQuestion(slide, timeLimit) {
  const base = {
    id: String(slide.id),
    title: slide.title.trim(),
    description: (slide.desc || '').trim(),
    timeLimit: timeLimit ?? 20,
  };
 
  if (slide.type === 'objective') {
    // 비어있지 않은 보기만 사용. id 는 원래 인덱스를 유지 → correctList 와 매칭 보존
    const options = slide.answers
      .map((text, index) => ({ id: String(index), text: text.trim() }))
      .filter((option) => option.text !== '');
    const correctIds = slide.correctList.map((index) => String(index));
 
    return {
      ...base,
      type: 'multiple',
      options,
      answer: correctIds[0] ?? null, // 대표 정답 (단일 선택 호환)
      answers: correctIds, // 복수 정답 전체 보존
    };
  }
 
  // 주관식
  const accepted = slide.answers.map((answer) => answer.trim()).filter(Boolean);
  return {
    ...base,
    type: 'short',
    answer: accepted[0] ?? '', // 대표 정답
    answers: accepted, // 허용 답변 전체 보존
  };
}

let slideSeq = 0;
function createSlide() {
  slideSeq += 1;
  return {
    id: slideSeq,
    complete: false,
    title: '',
    desc: '',
    photo: { file: null, link: '' },
    video: { file: null, link: '' },
    audio: { file: null, link: '' },
    type: 'subjective',
    answers: [''],
    correctList: [],
  };
}

function questionToSlide(question) {
  slideSeq += 1;
  const base = {
    id: slideSeq,
    complete: true,
    title: question.title || '',
    desc: question.description || '',
    photo: { file: null, link: '' },
    video: { file: null, link: '' },
    audio: { file: null, link: '' },
  };

  if (question.type === 'multiple') {
    const options = question.options || [];
    const correctIds = question.answers || (question.answer != null ? [String(question.answer)] : []);
    return {
      ...base,
      type: 'objective',
      answers: options.map((o) => o.text),
      correctList: correctIds
        .map((aid) => options.findIndex((o) => String(o.id) === String(aid)))
        .filter((i) => i >= 0),
    };
  }

  return {
    ...base,
    type: 'subjective',
    answers: question.answers?.length ? question.answers : [question.answer ?? ''],
    correctList: [],
  };
}

/* ---------- 메인 페이지 ---------- */
function AddQuizPage() {
  const navigate = useNavigate();
  const [view, setView] = useState('list');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // 편집 모드: draft에 questions가 있으면 슬라이드로 변환해 초기화
  const [slides, setSlides] = useState(() => {
    const raw = sessionStorage.getItem('quizDraft');
    if (!raw) return [];
    const draft = JSON.parse(raw);
    if (!draft.editId || !draft.questions?.length) return [];
    slideSeq = 0;
    return draft.questions.map(questionToSlide);
  });

  const editingSlide = slides.find((slide) => slide.id === editingId) || null;

  const handleAddSlide = () => {
    const slide = createSlide();
    setSlides((current) => [...current, slide]);
    setEditingId(slide.id);
    setView('detail');
  };

  const handleEditSlide = (id) => {
    setEditingId(id);
    setView('detail');
  };

  const handleDeleteSlide = (id) => {
    setSlides((current) => current.filter((slide) => slide.id !== id));
  };

  const handleSlideChange = (key, value) => {
    setSlides((current) =>
      current.map((slide) => (slide.id === editingId ? { ...slide, [key]: value } : slide)),
    );
  };

  const handleSaveSlide = () => {
    const editing = slides.find((slide) => slide.id === editingId);
    if (!editing) return;

    const errorMessage = validateSlide(editing);
    if (errorMessage) {
      alert(errorMessage);
      return;
    }

    setSlides((current) =>
      current.map((slide) => (slide.id === editingId ? { ...slide, complete: true } : slide)),
    );
    setView('list');
    setEditingId(null);
  };

  const handleCancelDetail = () => {
    setSlides((current) => current.filter((slide) => !(slide.id === editingId && !slide.complete)));
    setView('list');
    setEditingId(null);
  };

  const handleHeaderCancel = () => {
    if (view === 'detail') {
      handleCancelDetail();
    } else {
      navigate(-1);
    }
  };

  const handleSaveQuiz = async () => {
    if (slides.length === 0 || slides.some((slide) => !slide.complete)) {
      alert(TEXT.incompleteError);
      return;
    }
 
    const draftRaw = sessionStorage.getItem('quizDraft');
    if (!draftRaw) {
      alert(TEXT.noDraftError);
      navigate('/create');
      return;
    }
    const draft = JSON.parse(draftRaw);
 
    const questions = slides.map((slide) => slideToQuestion(slide, draft.timeLimit));
 
    setSaving(true);
    try {
      if (draft.editId) {
        await updateQuiz(draft.editId, { ...draft, questions });
      } else {
        await createQuiz({ ...draft, questions });
      }
      sessionStorage.removeItem('quizDraft');
      navigate('/');
    } catch (error) {
      alert(error.message || TEXT.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-page">
      <AddHeader onCancel={handleHeaderCancel} onSave={handleSaveQuiz} />

      {view === 'list' ? (
        <SlideListView
          slides={slides}
          onAdd={handleAddSlide}
          onEdit={handleEditSlide}
          onDelete={handleDeleteSlide}
        />
      ) : (
        editingSlide && (
          <SlideDetailView
            slide={editingSlide}
            onChange={handleSlideChange}
            onSaveSlide={handleSaveSlide}
            onCancel={handleCancelDetail}
          />
        )
      )}
    </div>
  );
}

export default AddQuizPage;