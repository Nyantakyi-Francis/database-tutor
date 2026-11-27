import { useState } from 'react'
import QuizForm from './QuizForm'
import { quizzes } from './quizData'
import { useProgress } from './useProgress'
import PageHeading from '../interface/PageHeading'

export default function QuizzesPage() {
  const [selectedId, setSelectedId] = useState(quizzes[0].id)
  const { progress, notice, recordQuizResult } = useProgress()
  const quiz = quizzes.find(item => item.id === selectedId) ?? quizzes[0]

  return <section>
    <PageHeading title="Quizzes">Check your understanding of database concepts, relationships, and basic SQL with {quizzes.length} short quizzes.</PageHeading>
    <p className="notice">Your latest score for each quiz is saved in this browser. A retake replaces that quiz's score only.</p>

    <h2 className="desktop-quiz-heading">Choose a quiz</h2>
    <div className="mobile-quiz-picker">
      <label htmlFor="current-quiz">Choose a quiz</label>
      <select id="current-quiz" value={selectedId} onChange={event => setSelectedId(event.target.value)}>
        {quizzes.map(item => <option key={item.id} value={item.id}>
          {item.title} ({item.questions.length} questions)
        </option>)}
      </select>
    </div>
    <ol className="lesson-list" aria-label="Quiz list">
      {quizzes.map(item => {
        const latest = progress.latestQuizResults[item.id]
        return <li key={item.id}>
          <button type="button" className="lesson-choice"
            aria-current={item.id === quiz.id ? 'step' : undefined}
            onClick={() => setSelectedId(item.id)}>
            {item.title} ({item.questions.length} questions)
            <span className="lesson-done">
              {latest ? ` Latest score: ${latest.score} / ${latest.totalQuestions}` : ' Not taken yet'}
            </span>
          </button>
        </li>
      })}
    </ol>

    <QuizForm key={quiz.id} quiz={quiz} onSubmitted={recordQuizResult} />
    <p className="notice" role="status">
      {notice ? <>{notice.kind === 'problem' && <strong>Warning: </strong>}{notice.text}</> : null}
    </p>
    <p><a href="#progress">View saved progress</a></p>
  </section>
}
