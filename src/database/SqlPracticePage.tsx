import { useEffect, useState, type FormEvent } from 'react'
import type { Database } from 'sql.js'
import type { SQLQueryResult } from '../shared/types'
import { createSchoolDatabase, executeQuery, loadSqlRuntime } from './databaseService'
import { sampleQueryResult } from './schoolData'
import { exercises } from './exercises'
import ExerciseHint from '../interface/ExerciseHint'
import QueryResults from './QueryResults'

export default function SqlPracticePage() {
  const [database, setDatabase] = useState<Database | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [query, setQuery] = useState(exercises[0].starterQuery)
  const [result, setResult] = useState<SQLQueryResult | null>(null)
  const [selectedExerciseId, setSelectedExerciseId] = useState(exercises[0].id)
  const selectedExercise = exercises.find(exercise => exercise.id === selectedExerciseId) ?? exercises[0]

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

  function runQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (database) setResult(executeQuery(database, query))
  }

  function resetDatabase() {
    setDatabase(null)
    setLoadError(false)
    setResult(null)
    setQuery(selectedExercise.starterQuery)
    setAttempt(previous => previous + 1)
  }

  function selectExercise(exerciseId: string) {
    const exercise = exercises.find(item => item.id === exerciseId)
    if (!exercise) return
    setSelectedExerciseId(exercise.id)
    setQuery(exercise.starterQuery)
    setResult(null)
  }

  return <section>
    <h1>SQL Practice</h1>
    <p>Choose one of the six guided exercises, edit the starter query, and run it against the fictional school database.</p>

    <div className="exercise-controls">
      <label htmlFor="exercise-select">Guided exercise</label>
      <select
        id="exercise-select"
        value={selectedExercise.id}
        onChange={event => selectExercise(event.target.value)}
      >
        {exercises.map(exercise => <option key={exercise.id} value={exercise.id}>
          {exercise.topic}: {exercise.title}
        </option>)}
      </select>
    </div>

    <article className="exercise-card" aria-labelledby="exercise-title">
      <p className="eyebrow">{selectedExercise.topic}</p>
      <h2 id="exercise-title">{selectedExercise.title}</h2>
      <p>{selectedExercise.instructions}</p>
      <ExerciseHint key={selectedExercise.id} hint={selectedExercise.hint} />
    </article>

    <details>
      <summary>Tables available</summary>
      <dl>
        <dt>Students</dt><dd>student_id, student_name, class_name</dd>
        <dt>Subjects</dt><dd>subject_id, subject_name</dd>
        <dt>Scores</dt><dd>score_id, student_id, subject_id, score</dd>
      </dl>
    </details>

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
    <p className="notice">Reset restores the original school records and starter query. Saved lesson progress and quiz scores stay as they are.</p>

    <div aria-live="polite" aria-atomic="true">
      <QueryResults result={result} />
    </div>
    <details>
      <summary>Expected rows for the starter query</summary>
      <QueryResults result={sampleQueryResult} caption="Expected starter query results" />
    </details>
  </section>
}
