import { useState, type FormEvent } from 'react'
import { lessons } from '../lessons/lessonData'
import { useProgress } from './useProgress'

// Quizzes are not built yet (quizData.ts is empty). This sample quiz lets the
// save/restore behaviour be demonstrated; replace it when real quizzes exist.
const DEMO_QUIZ = { id: 'demo-quiz', title: 'Demo quiz', totalQuestions: 4 }

export default function ProgressPage() {
  const { progress, notice, setLessonCompleted, recordQuizResult, reset } = useProgress()
  const [demoScore, setDemoScore] = useState(0)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const completed = new Set(progress.completedLessonIds)
  const results = Object.values(progress.latestQuizResults)

  function saveDemoScore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    recordQuizResult({
      quizId: DEMO_QUIZ.id,
      score: demoScore,
      totalQuestions: DEMO_QUIZ.totalQuestions,
      completedAt: new Date().toISOString(),
    })
  }

  return <section>
    <h1>Progress</h1>
    <p>Completed lessons and your latest quiz scores are saved in this browser.</p>
    <p className="notice" role="status">
      {notice ? <>{notice.kind === 'problem' && <strong>Warning: </strong>}{notice.text}</> : null}
    </p>

    <fieldset>
      <legend>Lessons completed ({completed.size} of {lessons.length})</legend>
      {lessons.map(lesson => <div key={lesson.id}>
        <label>
          <input
            type="checkbox"
            checked={completed.has(lesson.id)}
            onChange={event => setLessonCompleted(lesson.id, event.target.checked)}
          />{' '}
          {lesson.title}
        </label>
      </div>)}
    </fieldset>

    <h2>Latest quiz scores</h2>
    {results.length === 0
      ? <p>No quiz scores saved yet.</p>
      : <div className="table-scroll"><table>
        <thead><tr><th scope="col">Quiz</th><th scope="col">Score</th><th scope="col">Completed</th></tr></thead>
        <tbody>{results.map(result => <tr key={result.quizId}>
          <td>{result.quizId === DEMO_QUIZ.id ? DEMO_QUIZ.title : result.quizId}</td>
          <td>{result.score} / {result.totalQuestions}</td>
          <td>{new Date(result.completedAt).toLocaleString()}</td>
        </tr>)}</tbody>
      </table></div>}

    <form onSubmit={saveDemoScore}>
      <h3>Record a demo quiz score</h3>
      <p className="notice">Quizzes are still being prepared. Use this to check that a score is saved.</p>
      <label>
        Score out of {DEMO_QUIZ.totalQuestions}{' '}
        <select value={demoScore} onChange={event => setDemoScore(Number(event.target.value))}>
          {Array.from({ length: DEMO_QUIZ.totalQuestions + 1 }, (_, score) =>
            <option key={score} value={score}>{score}</option>)}
        </select>
      </label>{' '}
      <button type="submit">Save score</button>
    </form>

    <h2>Reset progress</h2>
    {confirmingReset
      ? <div role="group" aria-labelledby="reset-question">
        <p id="reset-question">
          Remove all completed lessons and quiz scores saved in this browser? This cannot be undone.
          The SQL practice database is not affected.
        </p>
        <button type="button" autoFocus onClick={() => setConfirmingReset(false)}>Cancel</button>{' '}
        <button type="button" onClick={() => { reset(); setConfirmingReset(false) }}>Yes, reset progress</button>
      </div>
      : <button type="button" onClick={() => setConfirmingReset(true)}>Reset progress</button>}
  </section>
}
