import { lessons } from '../lessons/lessonData'
import { exercises } from '../database/exercises'
import { useProgress } from '../assessment/useProgress'

export default function HomePage() {
  const { progress } = useProgress()
  const completed = new Set(progress.completedLessonIds)
  const completedCount = lessons.filter(lesson => completed.has(lesson.id)).length
  const nextLesson = lessons.find(lesson => !completed.has(lesson.id))

  return <section>
    <p className="eyebrow">Learn at your own pace</p>
    <h1>Start with the basics of databases.</h1>
    <p>Read {lessons.length} short lessons, then practise SQL with {exercises.length} guided exercises on a fictional school database.</p>

    <h2>Your progress</h2>
    <p>{completedCount} of {lessons.length} lessons completed.</p>
    {nextLesson
      ? <>
        <p>Next lesson: {nextLesson.title}</p>
        <a className="button" href="#lessons">{completedCount === 0 ? 'Start lessons' : 'Continue lessons'}</a>
      </>
      : <>
        <p>You have completed every lesson.</p>
        <a className="button" href="#practice">Practise SQL</a>
      </>}
    <p className="notice">Progress is saved in this browser. Quizzes are still being prepared.</p>
  </section>
}
