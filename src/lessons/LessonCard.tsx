import type { Lesson } from '../shared/types'

export default function LessonCard({ lesson }: { lesson: Lesson }) {
  return <article><h2>{lesson.title}</h2><p>{lesson.description}</p></article>
}
