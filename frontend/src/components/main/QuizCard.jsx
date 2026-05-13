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

export default QuizCard;
