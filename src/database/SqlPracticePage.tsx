import { useEffect, useState, type FormEvent } from 'react'
import type { Database } from 'sql.js'
import type { SQLQueryResult } from '../shared/types'
import { createSchoolDatabase, executeQuery, loadSqlRuntime } from './databaseService'
import { sampleQuery, sampleQueryResult } from './schoolData'
import QueryResults from './QueryResults'

export default function SqlPracticePage() {
  const [database, setDatabase] = useState<Database | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [query, setQuery] = useState(sampleQuery)
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

  function runQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (database) setResult(executeQuery(database, query))
  }

  function resetDatabase() {
    setDatabase(null)
    setLoadError(false)
    setResult(null)
    setQuery(sampleQuery)
    setAttempt(previous => previous + 1)
  }

  return <section>
    <h1>SQL Practice</h1>
    <p>Run the starter query to see the fictional school records, or edit it to try your own query.</p>
    <p className="notice">This is a starter demonstration. The six guided exercises are still being prepared.</p>

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
