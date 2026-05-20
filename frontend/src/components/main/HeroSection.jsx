/*import logoUrl from "../../assets/quizzly-logo-cropped.png";

const TEXT = {
  makeQuiz: '\uD034\uC988 \uB9CC\uB4E4\uAE30',
  solveQuiz: '\uD034\uC988 \uD480\uAE30',
  goToList: '\uD034\uC988 \uBAA9\uB85D\uC73C\uB85C \uC774\uB3D9',
};

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

export default HeroSection;
