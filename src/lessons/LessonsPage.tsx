import { useState } from 'react'
import { useProgress } from '../assessment/useProgress'
import LessonCard from './LessonCard'
import { lessons } from './lessonData'

export default function LessonsPage() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [focusOnOpen, setFocusOnOpen] = useState(false)
  const { progress, notice, setLessonCompleted } = useProgress()
  const lesson = lessons[selectedIndex]
  const completedIds = new Set(progress.completedLessonIds)

  function openLesson(index: number) {
    setSelectedIndex(index)
    setFocusOnOpen(true)
  }

  return <section>
    <h1>Lessons</h1>
    <p>Learn about tables, records, fields, keys, and relationships using fictional school data.</p>
    <p>{completedIds.size} of {lessons.length} lessons complete.</p>
    <p className="notice">Completion is saved in this browser. You can uncheck a completed lesson to revisit it.</p>

    <h2>Choose a lesson</h2>
    <ol aria-label="Lesson list">
      {lessons.map((item, index) => <li key={item.id}>
        <div className="query-actions">
          <button type="button" className="button" style={{ marginTop: 0 }}
            aria-current={index === selectedIndex ? 'step' : undefined}
            onClick={() => openLesson(index)}>
            {item.title}{index === selectedIndex ? ' (current)' : ''}
            {completedIds.has(item.id) ? ' (completed)' : ''}
          </button>
        </div>
      </li>)}
    </ol>

    <p className="eyebrow">Lesson {selectedIndex + 1} of {lessons.length}</p>
    <LessonCard key={lesson.id} lesson={lesson} completed={completedIds.has(lesson.id)}
      focusOnOpen={focusOnOpen} onCompletionChange={completed => setLessonCompleted(lesson.id, completed)} />
    <p className="notice" role="status">
      {notice ? <>{notice.kind === 'problem' && <strong>Warning: </strong>}{notice.text}</> : null}
    </p>

    <div className="query-actions" role="group" aria-label="Lesson navigation">
      <button type="button" className="button" style={{ marginTop: 0, opacity: selectedIndex === 0 ? 0.5 : 1 }}
        disabled={selectedIndex === 0}
        onClick={() => openLesson(selectedIndex - 1)}>Previous lesson</button>
      <button type="button" className="button"
        style={{ marginTop: 0, opacity: selectedIndex === lessons.length - 1 ? 0.5 : 1 }}
        disabled={selectedIndex === lessons.length - 1}
        onClick={() => openLesson(selectedIndex + 1)}>Next lesson</button>
    </div>
    <p><a href="#progress">View saved progress</a>{' · '}<a href="#practice">Practise SQL</a></p>
  </section>
}
