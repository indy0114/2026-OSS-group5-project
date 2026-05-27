import { useState } from 'react';
import iconUrl from '../../assets/quizzly-icon.png';
import './CreateQuiz.css';

const TEXT = {
  home: 'Quizzly \uD648',
  cancel: '\uCDE8\uC18C',
  save: '\uC800\uC7A5',
  typeSelect: '\uD034\uC988\uC720\uD615 \uC120\uD0DD',
  video: '\uC601\uC0C1',
  text: '\uD14D\uC2A4\uD2B8',
  image: '\uC774\uBBF8\uC9C0',
  quizCreate: '\uD034\uC988 \uB9CC\uB4E4\uAE30',
  title: '\uC81C\uBAA9',
  description: '\uC124\uBA85',
  category: '\uCE74\uD14C\uACE0\uB9AC',
  answerFormat: '\uB2F5\uBCC0\uD615\uC2DD \uC120\uD0DD',
  visibility: '\uACF5\uAC1C\uC5EC\uBD80 \uC120\uD0DD',
  shortAnswer: '\uC8FC\uAD00\uC2DD \uB2F5\uBCC0 (\uC785\uB825\uD615)',
  choiceAnswer: '\uAC1D\uAD00\uC2DD \uB2F5\uBCC0 (\uC120\uD0DD\uD615)',
  public: '\uACF5\uAC1C',
  private: '\uBE44\uACF5\uAC1C',
  titlePlaceholder: '\uC81C\uBAA9\uC744 \uC785\uB825\uD558\uC138\uC694. (\uCD5C\uB300 50\uC790)',
  descriptionPlaceholder: '\uC124\uBA85\uC744 \uC785\uB825\uD558\uC138\uC694. (\uCD5C\uB300 100\uC790)',
  categoryPlaceholder: '\uCE74\uD14C\uACE0\uB9AC\uB97C \uC120\uD0DD\uD558\uC138\uC694.',
  music: '\uC74C\uC545',
  commonSense: '\uC0C1\uC2DD',
  movie: '\uC601\uD654',
  game: '\uAC8C\uC784',
  food: '\uC74C\uC2DD',
  sports: '\uC2A4\uD3EC\uCE20',
  person: '\uC778\uBB3C',
  anime: '\uC560\uB2C8',
  etc: '\uAE30\uD0C0',
};

const quizTypes = [
  { id: 'video', label: TEXT.video, icon: 'video' },
  { id: 'text', label: TEXT.text, icon: 'text' },
  { id: 'image', label: TEXT.image, icon: 'image' },
];

const answerTypes = [TEXT.shortAnswer, TEXT.choiceAnswer];
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

function TypeIcon({ type }) {
  if (type === 'video') {
    return (
      <span className="type-icon video" aria-hidden="true">
        <span />
      </span>
    );
  }

  if (type === 'text') {
    return (
      <span className="type-icon text" aria-hidden="true">
        T
      </span>
    );
  }

  return (
    <span className="type-icon image" aria-hidden="true">
      <span />
    </span>
  );
}

function TypeStep({ selectedType, onSelect }) {
  return (
    <section className="create-type-panel" aria-label={TEXT.typeSelect}>
      <h1>{TEXT.typeSelect}</h1>
      <div className="create-panel-line" />

      <div className="type-card-list">
        {quizTypes.map((type) => (
          <button
            className={selectedType === type.id ? 'type-card selected' : 'type-card'}
            key={type.id}
            type="button"
            onClick={() => onSelect(type.id)}
          >
            <TypeIcon type={type.icon} />
            <span>{type.label}</span>
          </button>
        ))}
      </div>
    </section>
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

function SettingsStep({ form, onChange }) {
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
          <div className="create-field">
            <span>{TEXT.answerFormat}</span>
            <div className="answer-type-grid">
              {answerTypes.map((type) => (
                <button
                  className={form.answerType === type ? 'answer-type selected' : 'answer-type'}
                  key={type}
                  type="button"
                  onClick={() => onChange('answerType', type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

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
        </div>
      </div>

      <button className="panel-save-button" type="button">
        {TEXT.save}
      </button>
    </section>
  );
}

function CreateQuizPage({ onCancel }) {
  const [step, setStep] = useState('type');
  const [selectedType, setSelectedType] = useState('text');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: categories[0],
    answerType: answerTypes[0],
    visibility: 'public',
  });

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    if (step === 'type') {
      setStep('settings');
    }
  };

  return (
    <div className="create-page">
      <CreateHeader onCancel={onCancel} onSave={handleSave} />

      <main className={`create-main create-main-${step}`}>
        {step === 'type' ? (
          <TypeStep
            selectedType={selectedType}
            onSelect={(type) => {
              setSelectedType(type);
              setStep('settings');
            }}
          />
        ) : (
          <SettingsStep form={form} onChange={updateForm} />
        )}
      </main>
    </div>
  );
}

export default CreateQuizPage;
