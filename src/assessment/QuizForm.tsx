import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { Quiz, QuizQuestion } from '../shared/types'
import { findUnanswered, scoreQuiz, type QuestionFeedback, type ScoredQuiz } from './quizScoring'

/** One quiz attempt: choose an answer per question, submit, review feedback, then retake. */
export default function QuizForm({ quiz }: { quiz: Quiz }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [scored, setScored] = useState<ScoredQuiz | null>(null)
  const [warnUnanswered, setWarnUnanswered] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const warning = useRef<HTMLDivElement>(null)
  const summary = useRef<HTMLHeadingElement>(null)

  const unanswered = findUnanswered(quiz, answers)
  const unansweredNumbers = quiz.questions
    .flatMap((question, index) => unanswered.includes(question.id) ? [index + 1] : [])
  const showWarning = warnUnanswered && !scored && unanswered.length > 0
  const skipped = scored?.feedback.filter(item => item.selectedOptionId === undefined).length ?? 0

  useEffect(() => { if (showWarning) warning.current?.focus() }, [showWarning])
  useEffect(() => { if (scored) summary.current?.focus() }, [scored])

  function finish() {
    setScored(scoreQuiz(quiz, answers))
    setWarnUnanswered(false)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (unanswered.length > 0) setWarnUnanswered(true)
    else finish()
  }

  function retake() {
    setAnswers({})
    setScored(null)
    setWarnUnanswered(false)
    heading.current?.focus()
  }

  return <form onSubmit={submit} aria-labelledby={`quiz-${quiz.id}`} noValidate>
    <h2 id={`quiz-${quiz.id}`} ref={heading} tabIndex={-1}>{quiz.title}</h2>
    <p className="notice">Choose one answer for each of the {quiz.questions.length} questions, then submit.</p>

    {quiz.questions.map((question, index) => <fieldset key={question.id} className="quiz-question">
      <legend>Question {index + 1} of {quiz.questions.length}: {question.prompt}</legend>
      {question.options.map(option => <label key={option.id} className="quiz-option">
        <input type="radio" name={`${quiz.id}-${question.id}`} value={option.id}
          checked={answers[question.id] === option.id} disabled={scored !== null}
          onChange={() => setAnswers(previous => ({ ...previous, [question.id]: option.id }))} />{' '}
        {option.text}
      </label>)}
      {scored && <Feedback question={question} feedback={scored.feedback[index]} />}
    </fieldset>)}

    {showWarning && <div ref={warning} tabIndex={-1} role="alert" className="quiz-warning">
      <p>
        {unanswered.length === 1 ? 'Question' : 'Questions'} {unansweredNumbers.join(', ')}{' '}
        {unanswered.length === 1 ? 'has' : 'have'} no answer. Answer {unanswered.length === 1 ? 'it' : 'them'},
        or submit now and {unanswered.length === 1 ? 'it' : 'they'} will count as incorrect.
      </p>
      <button type="button" onClick={finish}>Submit anyway</button>
    </div>}

    <div role="status" aria-atomic="true">
      {scored && <div className="quiz-summary">
        <h3 ref={summary} tabIndex={-1}>
          You scored {scored.result.score} out of {scored.result.totalQuestions}.
        </h3>
        <p>
          {skipped > 0 && `${skipped} unanswered ${skipped === 1 ? 'question was' : 'questions were'} counted as incorrect. `}
          Review the correct answers and explanations under each question.
        </p>
      </div>}
    </div>

    <div className="query-actions">
      {scored
        ? <button type="button" onClick={retake}>Retake quiz</button>
        : <button type="submit">Submit answers</button>}
    </div>
  </form>
}

function Feedback({ question, feedback }: { question: QuizQuestion; feedback: QuestionFeedback }) {
  const optionText = (id?: string) => question.options.find(option => option.id === id)?.text
  const verdict = feedback.correct ? 'Correct.' : feedback.selectedOptionId ? 'Incorrect.' : 'Not answered.'
  return <div className={`quiz-feedback ${feedback.correct ? 'is-correct' : 'is-incorrect'}`}>
    <p><strong>{verdict}</strong>{!feedback.correct && feedback.selectedOptionId &&
      <> You chose: {optionText(feedback.selectedOptionId)}</>}</p>
    {!feedback.correct && <p>Correct answer: {optionText(question.correctOptionId)}</p>}
    <p>{question.explanation}</p>
  </div>
}
