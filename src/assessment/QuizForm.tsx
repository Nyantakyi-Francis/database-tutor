import { useRef, useState, type FormEvent } from 'react'
import type { Quiz } from '../shared/types'

/** One quiz attempt: choose an answer per question, submit, then retake. */
export default function QuizForm({ quiz }: { quiz: Quiz }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  function retake() {
    setAnswers({})
    setSubmitted(false)
    heading.current?.focus()
  }

  return <form onSubmit={submit} aria-labelledby={`quiz-${quiz.id}`}>
    <h2 id={`quiz-${quiz.id}`} ref={heading} tabIndex={-1}>{quiz.title}</h2>
    <p className="notice">Choose one answer for each of the {quiz.questions.length} questions, then submit.</p>

    {quiz.questions.map((question, index) => <fieldset key={question.id} className="quiz-question">
      <legend>Question {index + 1} of {quiz.questions.length}: {question.prompt}</legend>
      {question.options.map(option => <label key={option.id} className="quiz-option">
        <input type="radio" name={`${quiz.id}-${question.id}`} value={option.id}
          checked={answers[question.id] === option.id} disabled={submitted}
          onChange={() => setAnswers(previous => ({ ...previous, [question.id]: option.id }))} />{' '}
        {option.text}
      </label>)}
    </fieldset>)}

    <div className="query-actions">
      {submitted
        ? <button type="button" onClick={retake}>Retake quiz</button>
        : <button type="submit">Submit answers</button>}
    </div>
  </form>
}
