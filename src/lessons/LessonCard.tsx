import { useEffect, useRef } from 'react'
import type { Lesson } from '../shared/types'
import { parseLessonExample } from './lessonContent'

interface LessonCardProps {
  lesson: Lesson
  completed: boolean
  onCompletionChange: (completed: boolean) => void
  focusOnOpen: boolean
}

export default function LessonCard({ lesson, completed, onCompletionChange, focusOnOpen }: LessonCardProps) {
  const heading = useRef<HTMLHeadingElement>(null)
  const { blocks, question, answer } = parseLessonExample(lesson.example)

  useEffect(() => {
    if (focusOnOpen) heading.current?.focus()
  }, [focusOnOpen])

  return <article aria-labelledby={`lesson-${lesson.id}`}>
    <h2 id={`lesson-${lesson.id}`} ref={heading} tabIndex={-1}>{lesson.title}</h2>
    <p>{lesson.description}</p>
    {lesson.content.split('\n\n').map(paragraph => <p key={paragraph}>{paragraph}</p>)}

    <h3>Fictional school example</h3>
    <p className="notice">On a small screen, scroll a table sideways to see every column.</p>
    {blocks.map((block, index) => block.kind === 'text'
      ? <p key={index}>{block.text}</p>
      : <div className="table-scroll" key={index} tabIndex={0}
          role="region" aria-label={`${block.caption} example table`}>
        <table>
          <caption>{block.caption}</caption>
          <thead><tr>{block.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
          <tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex}>
            {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
          </tr>)}</tbody>
        </table>
      </div>)}

    <h3>Check your understanding</h3>
    <p>{question}</p>
    <details>
      <summary>Show answer</summary>
      <p>{answer}</p>
    </details>
    <p>
      <label>
        <input type="checkbox" checked={completed}
          onChange={event => onCompletionChange(event.target.checked)} />{' '}
        Mark this lesson complete
      </label>
    </p>
  </article>
}
