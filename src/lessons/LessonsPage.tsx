import { useState } from 'react'
import { useProgress } from '../assessment/useProgress'
import LessonCard from './LessonCard'
import { lessons } from './lessonData'
import Icon, { type IconName } from '../interface/Icon'
import PageHeading from '../interface/PageHeading'

const lessonIcons: IconName[] = ['table', 'rows', 'tag', 'key', 'link', 'nodes']

export default function LessonsPage() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [focusOnOpen, setFocusOnOpen] = useState(false)
  const { progress, notice, setLessonCompleted } = useProgress()
  const lesson = lessons[selectedIndex]
  const completedIds = new Set(progress.completedLessonIds)
  const completedCount = lessons.filter(item => completedIds.has(item.id)).length

  function openLesson(index: number) {
    setSelectedIndex(index)
    setFocusOnOpen(true)
  }

  return <section className="lessons-page">
    <PageHeading title="Lessons">Learn about tables, records, fields, keys, and relationships using fictional school data.</PageHeading>
    <div className="lesson-workspace">
      <aside className="lesson-sidebar" aria-label="Lesson selection">
        <h2>Choose a lesson</h2>
        <p className="lesson-count">{completedCount} of {lessons.length} complete</p>
        <progress aria-label="Lessons completed" value={completedCount} max={lessons.length} />
        <div className="mobile-lesson-picker">
          <label htmlFor="current-lesson">Current lesson</label>
          <select id="current-lesson" value={selectedIndex} onChange={event => openLesson(Number(event.target.value))}>
            {lessons.map((item, index) => <option key={item.id} value={index}>
              {index + 1}. {item.title}{completedIds.has(item.id) ? ' (completed)' : ''}
            </option>)}
          </select>
        </div>
        <ol className="lesson-list" aria-label="Lesson list">
          {lessons.map((item, index) => <li key={item.id}>
            <button type="button" className="lesson-choice"
              aria-current={index === selectedIndex ? 'step' : undefined}
              onClick={() => openLesson(index)}>
              <span className="lesson-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <Icon name={lessonIcons[index]} />
              <span>{item.title}
                {completedIds.has(item.id) && <span className="lesson-done"> (completed)</span>}
              </span>
            </button>
          </li>)}
        </ol>
        <p className="notice">Saved in this browser. You can undo a completion at any time.</p>
      </aside>
      <div className="lesson-reading">
        <p className="eyebrow">Lesson {selectedIndex + 1} of {lessons.length}</p>
        <LessonCard key={lesson.id} lesson={lesson} completed={completedIds.has(lesson.id)}
          focusOnOpen={focusOnOpen} onCompletionChange={completed => setLessonCompleted(lesson.id, completed)} />
        <p className="notice" role="status">
          {notice ? <>{notice.kind === 'problem' && <strong>Warning: </strong>}{notice.text}</> : null}
        </p>

        <div className="query-actions" role="group" aria-label="Lesson navigation">
          <button type="button" disabled={selectedIndex === 0}
            onClick={() => openLesson(selectedIndex - 1)}>Previous lesson</button>
          <button type="button" disabled={selectedIndex === lessons.length - 1}
            onClick={() => openLesson(selectedIndex + 1)}>Next lesson</button>
        </div>
        <p><a href="#progress">View saved progress</a>{' · '}<a href="#practice">Practise SQL</a></p>
      </div>
    </div>
  </section>
}
