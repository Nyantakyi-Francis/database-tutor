import { useEffect, useState, type FormEvent } from 'react'
import type { Database } from 'sql.js'
import type { SQLQueryResult } from '../shared/types'
import { createSchoolDatabase, executeQuery, loadSqlRuntime } from './databaseService'
import { exercises } from './exercises'
import QueryResults from './QueryResults'

export default function SqlPracticePage() {
  const [database, setDatabase] = useState<Database | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [exerciseId, setExerciseId] = useState(exercises[0].id)
  const exercise = exercises.find(item => item.id === exerciseId) ?? exercises[0]
  const [query, setQuery] = useState(exercise.starterQuery)
  const [result, setResult] = useState<SQLQueryResult | null>(null)

  useEffect(() => {
    let active = true
    let connection: Database | undefined
    void loadSqlRuntime().then(SQL => {
      if (!active) return
      connection = createSchoolDatabase(SQL)
      setDatabase(connection)
    }).catch(() => { if (active) setLoadError(true) })
    return () => {
      active = false
      connection?.close()
    }
  }, [attempt])

  function chooseExercise(id: string) {
    const next = exercises.find(item => item.id === id) ?? exercises[0]
    setExerciseId(next.id)
    setQuery(next.starterQuery)
    setResult(null)
  }

  function runQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (database) setResult(executeQuery(database, query))
  }

  function resetDatabase() {
    setDatabase(null)
    setLoadError(false)
    setResult(null)
    setQuery(exercise.starterQuery)
    setAttempt(previous => previous + 1)
  }

  return <section>
    <h1>SQL Practice</h1>
    <p>Choose an exercise, edit the starter query, and run it. Compare your results with the expected results below.</p>

    <details>
      <summary>Tables available</summary>
      <dl>
        <dt>Students</dt><dd>student_id, student_name, class_name</dd>
        <dt>Subjects</dt><dd>subject_id, subject_name</dd>
        <dt>Scores</dt><dd>score_id, student_id, subject_id, score</dd>
      </dl>
    </details>

    <p>
      <label htmlFor="exercise-choice">Exercise</label>{' '}
      <select id="exercise-choice" value={exercise.id} onChange={event => chooseExercise(event.target.value)}>
        {exercises.map((item, index) =>
          <option key={item.id} value={item.id}>{index + 1}. {item.topic}: {item.title}</option>)}
      </select>
    </p>

    <h2>{exercise.title}</h2>
    <p>{exercise.instructions}</p>
    {/* E1 (S2-42, Figuelia): show exercise.hint here with interface/ExerciseHint. */}

    {loadError
      ? <div role="alert">
        <p>The school database could not load. Check your connection and reload to try again.</p>
        <button type="button" onClick={() => window.location.reload()}>Reload SQL Practice</button>
      </div>
      : <p role="status">{database ? 'School database ready.' : 'Loading school database…'}</p>}

    <form onSubmit={runQuery}>
      <label htmlFor="sql-query">SQL query</label>
      <textarea id="sql-query" className="sql-editor" rows={5} value={query}
        onChange={event => setQuery(event.target.value)} spellCheck={false} autoCapitalize="off"
        aria-describedby="query-help" />
      <p id="query-help" className="notice">If you run several statements, the results below show the last one.</p>
      <div className="query-actions">
        <button type="submit" disabled={!database}>Run query</button>
        <button type="button" disabled={!database} onClick={resetDatabase}>Reset school database</button>
      </div>
    </form>
    <p className="notice">Reset restores the original school records and this exercise's starter query. Saved lesson progress and quiz scores stay as they are.</p>

    <div aria-live="polite" aria-atomic="true">
      <QueryResults result={result} caption="Your results" />
    </div>
    <details>
      <summary>Expected results</summary>
      <QueryResults result={exercise.expectedResult} caption={`Expected results: ${exercise.title}`} />
    </details>
  </section>
}
