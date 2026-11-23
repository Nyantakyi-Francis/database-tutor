import LessonCard from './LessonCard'
import { lessons } from './lessonData'

export default function LessonsPage() {
  return <section>
    <h1>Lessons</h1>
    <p>Study six short introductions to tables, records, fields, keys, and relationships.</p>
    <div className="lesson-grid" aria-label="Database lessons">
      {lessons.map(lesson => <LessonCard key={lesson.id} lesson={lesson} />)}
    </div>
  </section>
}
