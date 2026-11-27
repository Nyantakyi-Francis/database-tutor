import { useEffect, useRef, useState } from 'react'
import type { DatabaseSceneController } from './databaseScene'
import Icon from './Icon'

const tables = [
  { name: 'Students', description: 'Each row stores one student. A student_id identifies that record.' },
  { name: 'Subjects', description: 'Each subject has its own record, identified by a subject_id.' },
  { name: 'Scores', description: 'Scores connect students to subjects using their IDs as foreign keys.' },
]

function StaticDatabase() {
  return <div className="static-database" aria-hidden="true">
    <div className="static-orbit" />
    <div className="static-disc" /><div className="static-disc" /><div className="static-disc" />
    <span className="static-table static-table-one">Students</span>
    <span className="static-table static-table-two">Subjects</span>
    <span className="static-table static-table-three">Scores</span>
  </div>
}

export default function DatabaseExplorer() {
  const [expanded, setExpanded] = useState(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    return !window.matchMedia('(max-width: 780px), (max-width: 950px) and (max-height: 500px), (pointer: coarse)').matches && !connection?.saveData
  })

  return <div className="model-shell" data-open={expanded}>
    <button className="model-toggle" type="button" aria-expanded={expanded} aria-controls="database-explorer-panel"
      onClick={() => setExpanded(open => !open)}>
      <Icon name="cube" />
      <span>{expanded ? 'Close 3D view' : 'Explore the 3D database'}</span>
      <Icon name="arrow" />
    </button>
    <div id="database-explorer-panel">{expanded ? <DatabaseExplorerScene /> : null}</div>
  </div>
}

function DatabaseExplorerScene() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const controller = useRef<DatabaseSceneController | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading')
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [selected, setSelected] = useState(0)
  const pausedRef = useRef(paused)
  const selectedRef = useRef(selected)

  useEffect(() => {
    let cancelled = false
    let instance: DatabaseSceneController | null = null
    const element = canvas.current!
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotion = () => setPaused(motionPreference.matches)
    const contextLost = (event: Event) => {
      event.preventDefault()
      instance?.dispose()
      controller.current = null
      setStatus('fallback')
    }
    element.addEventListener('webglcontextlost', contextLost)
    motionPreference.addEventListener('change', updateMotion)
    void import('./databaseScene').then(({ createDatabaseScene }) => {
      if (cancelled) return
      instance = createDatabaseScene(element, setSelected)
      instance.setPaused(pausedRef.current)
      instance.setSelected(selectedRef.current)
      controller.current = instance
      setStatus('ready')
    }).catch(() => { if (!cancelled) setStatus('fallback') })
    return () => {
      cancelled = true
      instance?.dispose()
      controller.current = null
      element.removeEventListener('webglcontextlost', contextLost)
      motionPreference.removeEventListener('change', updateMotion)
    }
  }, [])

  useEffect(() => { pausedRef.current = paused; controller.current?.setPaused(paused) }, [paused])
  useEffect(() => { selectedRef.current = selected; controller.current?.setSelected(selected) }, [selected])

  return <div className="database-explorer" data-scene-status={status}>
    <div className="scene-viewport">
      <StaticDatabase />
      <canvas ref={canvas} className={status === 'ready' ? 'is-ready' : ''} aria-hidden="true" />
    </div>
    <div className="scene-toolbar">
      <div className="scene-playback">
        <button type="button" onClick={() => setPaused(value => !value)} disabled={status !== 'ready'}
          aria-pressed={paused} aria-label={paused ? 'Resume rotation' : 'Pause rotation'}>
          <Icon name={paused ? 'play' : 'pause'} /><span>{paused ? 'Resume' : 'Pause'} rotation</span>
        </button>
        <button type="button" disabled={status !== 'ready'} onClick={() => controller.current?.reset()}>
          <Icon name="reset" /><span>Reset view</span>
        </button>
      </div>
      <div className="scene-tables" role="group" aria-label="Explore database tables">
        {tables.map((table, index) => <button key={table.name} type="button" aria-pressed={selected === index}
          onClick={() => setSelected(index)}>{table.name}</button>)}
      </div>
    </div>
    <p className="scene-hint"><Icon name="drag" />{status === 'ready' ? 'Drag to rotate · select a table to explore' : status === 'fallback' ? 'Explore the database tables below' : 'Preparing your database model…'}</p>
    <p className="scene-description" aria-live="polite" aria-atomic="true"><strong>{tables[selected].name}.</strong> {tables[selected].description}</p>
  </div>
}
