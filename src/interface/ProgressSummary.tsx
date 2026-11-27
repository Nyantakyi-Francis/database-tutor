import Icon from './Icon'

interface ProgressSummaryProps {
  completedLessons: number
  totalLessons: number
  takenQuizzes: number
  totalQuizzes: number
}

export default function ProgressSummary({ completedLessons, totalLessons, takenQuizzes, totalQuizzes }: ProgressSummaryProps) {
  return <div className="progress-summary" aria-label="Learning progress">
    <div className="progress-stat">
      <div className="stat-heading"><span><Icon name="book" />Lessons completed</span><strong>{completedLessons}<span> / {totalLessons}</span></strong></div>
      <progress aria-label="Lessons completed" value={completedLessons} max={totalLessons} />
    </div>
    <div className="progress-stat">
      <div className="stat-heading"><span><Icon name="check" />Quizzes taken</span><strong>{takenQuizzes}<span> / {totalQuizzes}</span></strong></div>
      <progress aria-label="Quizzes taken" value={takenQuizzes} max={totalQuizzes} />
    </div>
  </div>
}
