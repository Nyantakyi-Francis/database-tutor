import { lessons } from '../lessons/lessonData'
import { exercises } from '../database/exercises'
import { quizzes } from '../assessment/quizData'
import { useProgress } from '../assessment/useProgress'
import ProgressSummary from './ProgressSummary'
import DatabaseExplorer from './DatabaseExplorer'
import Icon from './Icon'

const activities = [
  { id: 'lessons', title: 'Lessons', icon: 'book', count: lessons.length, description: 'Learn core database concepts with short, focused lessons.' },
  { id: 'practice', title: 'SQL Practice', icon: 'code', count: exercises.length, description: 'Write and run SQL on a fictional school database.' },
  { id: 'quizzes', title: 'Quizzes', icon: 'check', count: quizzes.length, description: 'Check your understanding, then review each answer.' },
] as const

export default function HomePage() {
  const { progress, notice } = useProgress()
  const completed = new Set(progress.completedLessonIds)
  const completedCount = lessons.filter(lesson => completed.has(lesson.id)).length
  const nextLesson = lessons.find(lesson => !completed.has(lesson.id))
  const takenCount = quizzes.filter(quiz => progress.latestQuizResults[quiz.id]).length

  return <section className="home-page">
    <div className="home-hero">
      <div className="home-intro">
        <h1>Start with the basics of <span>databases.</span></h1>
        <p>Read {lessons.length} short lessons, practise SQL with {exercises.length} guided exercises on a fictional
          school database, then check your understanding with {quizzes.length} quizzes.</p>

        <div className="hero-actions">
          {nextLesson
            ? <a className="button" href="#lessons">{completedCount === 0 ? 'Start lessons' : 'Continue lessons'}<Icon name="arrow" /></a>
            : <>
              <p>You have completed every lesson.</p>
              <a className="button" href={takenCount < quizzes.length ? '#quizzes' : '#practice'}>
                {takenCount < quizzes.length ? 'Take a quiz' : 'Practise SQL'}
              </a>
            </>}
          <a className="hero-secondary" href="#practice">Try SQL Practice</a>
        </div>
        {nextLesson && completedCount > 0 && <p className="next-lesson"><span>Next lesson</span>{nextLesson.title}</p>}
      </div>
      <DatabaseExplorer />
    </div>
    <div className="activity-grid" aria-label="Learning activities">
      {activities.map(activity => <a className="activity-link" key={activity.id} href={`#${activity.id}`}>
        <Icon name={activity.icon} />
        <div><h2>{activity.title}</h2><p>{activity.description}</p></div>
        <span className="activity-count" aria-label={`${activity.count} ${activity.id === 'practice' ? 'exercises' : activity.id}`}>
          {String(activity.count).padStart(2, '0')}
        </span>
        <Icon name="arrow" className="activity-arrow" />
      </a>)}
    </div>
    <div className="home-progress">
      <div className="section-heading"><h2>Your progress</h2><a href="#progress">View progress<Icon name="arrow" /></a></div>
      <ProgressSummary completedLessons={completedCount} totalLessons={lessons.length}
        takenQuizzes={takenCount} totalQuizzes={quizzes.length} />
      {notice?.kind === 'problem'
        ? <p className="notice" role="status"><strong>Warning: </strong>{notice.text}</p>
        : <p className="notice">Progress is saved in this browser. <a href="#progress">View your progress</a>.</p>}
    </div>
  </section>
}
