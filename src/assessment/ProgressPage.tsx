import { useEffect, useRef, useState } from 'react'
import { lessons } from '../lessons/lessonData'
import { quizzes } from './quizData'
import { useProgress } from './useProgress'

export default function ProgressPage() {
  const { progress, notice, setLessonCompleted, reset } = useProgress()
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [resetClosed, setResetClosed] = useState(false)
  const resetButton = useRef<HTMLButtonElement>(null)
  const completed = new Set(progress.completedLessonIds)
  const completedCount = lessons.filter(lesson => completed.has(lesson.id)).length
  const takenCount = quizzes.filter(quiz => progress.latestQuizResults[quiz.id]).length

  // After Cancel or Yes, return keyboard focus to the Reset button.
  useEffect(() => { if (resetClosed && !confirmingReset) resetButton.current?.focus() }, [resetClosed, confirmingReset])

  function closeReset(confirmed: boolean) {
    if (confirmed) reset()
    setConfirmingReset(false)
    setResetClosed(true)
  }

  return <section>
    <h1>Progress</h1>
    <p>Completed lessons and your latest quiz scores are saved in this browser.</p>
    <p className="notice" role="status">
      {notice ? <>{notice.kind === 'problem' && <strong>Warning: </strong>}{notice.text}</> : null}
    </p>

    <fieldset className="progress-lessons">
      <legend>Lessons completed ({completedCount} of {lessons.length})</legend>
      {lessons.map(lesson => <div key={lesson.id}>
        <label>
          <input
            type="checkbox"
            checked={completed.has(lesson.id)}
            onChange={event => setLessonCompleted(lesson.id, event.target.checked)}
          />
          {lesson.title}
        </label>
      </div>)}
    </fieldset>

    <h2>Latest quiz scores ({takenCount} of {quizzes.length} taken)</h2>
    <div className="table-scroll" tabIndex={0} role="region" aria-label="Latest quiz scores">
      <table>
        <thead><tr><th scope="col">Quiz</th><th scope="col">Latest score</th><th scope="col">Completed</th></tr></thead>
        <tbody>{quizzes.map(quiz => {
          const result = progress.latestQuizResults[quiz.id]
          return <tr key={quiz.id}>
            <td>{quiz.title}</td>
            <td>{result ? `${result.score} / ${result.totalQuestions}` : 'Not taken yet'}</td>
            <td>{result ? new Date(result.completedAt).toLocaleString() : '—'}</td>
          </tr>
        })}</tbody>
      </table>
    </div>
    <p><a href="#quizzes">Take or retake a quiz</a></p>

    <h2>Reset progress</h2>
    {confirmingReset
      ? <div role="group" aria-labelledby="reset-question">
        <p id="reset-question">
          Remove all completed lessons and quiz scores saved in this browser? This cannot be undone.
          The SQL practice database is not affected.
        </p>
        <div className="query-actions">
          <button type="button" autoFocus onClick={() => closeReset(false)}>Cancel</button>
          <button type="button" onClick={() => closeReset(true)}>Yes, reset progress</button>
        </div>
      </div>
      : <button type="button" ref={resetButton} onClick={() => setConfirmingReset(true)}>Reset progress</button>}
  </section>
}
