import { lessons } from '../lessons/lessonData'
import { exercises } from '../database/exercises'
import { quizzes } from '../assessment/quizData'
import { useProgress } from '../assessment/useProgress'

export default function HomePage() {
  const { progress, notice } = useProgress()
  const completed = new Set(progress.completedLessonIds)
  const completedCount = lessons.filter(lesson => completed.has(lesson.id)).length
  const nextLesson = lessons.find(lesson => !completed.has(lesson.id))
  const takenCount = quizzes.filter(quiz => progress.latestQuizResults[quiz.id]).length

  return <section>
    <p className="eyebrow">Learn at your own pace</p>
    <h1>Start with the basics of databases.</h1>
    <p>Read {lessons.length} short lessons, practise SQL with {exercises.length} guided exercises on a fictional
      school database, then check your understanding with {quizzes.length} quizzes.</p>

    <h2>Your progress</h2>
    <ul>
      <li>{completedCount} of {lessons.length} lessons completed.</li>
      <li>{takenCount} of {quizzes.length} quizzes taken.</li>
    </ul>
    {nextLesson
      ? <>
        <p>Next lesson: {nextLesson.title}</p>
        <a className="button" href="#lessons">{completedCount === 0 ? 'Start lessons' : 'Continue lessons'}</a>
      </>
      : <>
        <p>You have completed every lesson.</p>
        <a className="button" href={takenCount < quizzes.length ? '#quizzes' : '#practice'}>
          {takenCount < quizzes.length ? 'Take a quiz' : 'Practise SQL'}
        </a>
      </>}
    {notice?.kind === 'problem'
      ? <p className="notice" role="status"><strong>Warning: </strong>{notice.text}</p>
      : <p className="notice">Progress is saved in this browser. <a href="#progress">View your progress</a>.</p>}
  </section>
}
