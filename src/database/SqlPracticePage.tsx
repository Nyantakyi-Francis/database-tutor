import { useEffect, useState } from 'react'
import { loadSqlRuntime } from './databaseService'

export default function SqlPracticePage() {
  const [error, setError] = useState(false)
  useEffect(() => {
    let active = true
    void loadSqlRuntime().catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [])
  return <section><h1>SQL Practice</h1><p>Guided SELECT, WHERE, and ORDER BY exercises will use a fictional school database.</p>
    <p className="notice">This section is being prepared.</p>
    {error ? <p role="alert">SQL practice could not load. Check your connection and reload to try again.</p> : null}
  </section>
}
