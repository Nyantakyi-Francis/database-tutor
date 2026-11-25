import { useState } from 'react'
import QuizForm from './QuizForm'
import { quizzes } from './quizData'

export default function QuizzesPage() {
  const [selectedId, setSelectedId] = useState(quizzes[0].id)
  const quiz = quizzes.find(item => item.id === selectedId) ?? quizzes[0]

  return <section>
    <h1>Quizzes</h1>
    <p>Check your understanding of database concepts, relationships, and basic SQL with {quizzes.length} short quizzes.</p>

    <h2>Choose a quiz</h2>
    <ol className="lesson-list" aria-label="Quiz list">
      {quizzes.map(item => <li key={item.id}>
        <button type="button" className="lesson-choice"
          aria-current={item.id === quiz.id ? 'step' : undefined}
          onClick={() => setSelectedId(item.id)}>
          {item.title} ({item.questions.length} questions)
        </button>
      </li>)}
    </ol>

    <QuizForm key={quiz.id} quiz={quiz} />
  </section>
}
