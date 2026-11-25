// Owner: Victor Talabi. Scores a quiz attempt against QuizQuestion.correctOptionId.
import type { Quiz, QuizResult } from '../shared/types'

/** Selected option ID for each answered question, keyed by question ID. */
export type QuizAnswers = Readonly<Record<string, string>>

export interface QuestionFeedback {
  questionId: string
  /** Undefined when the question was not answered. */
  selectedOptionId?: string
  correct: boolean
}

export interface ScoredQuiz {
  result: QuizResult
  feedback: QuestionFeedback[]
}

/** Returns the selected option only when it belongs to that question. */
function selectedOption(quiz: Quiz, questionId: string, answers: QuizAnswers) {
  const question = quiz.questions.find(item => item.id === questionId)
  const selected = answers[questionId]
  return question?.options.some(option => option.id === selected) ? selected : undefined
}

/** IDs of questions with no valid answer, in question order. */
export function findUnanswered(quiz: Quiz, answers: QuizAnswers): string[] {
  return quiz.questions
    .filter(question => selectedOption(quiz, question.id, answers) === undefined)
    .map(question => question.id)
}

/**
 * Scores one attempt. Unanswered questions and unknown option IDs count as
 * incorrect. score is the number correct out of totalQuestions.
 */
export function scoreQuiz(quiz: Quiz, answers: QuizAnswers, completedAt: Date = new Date()): ScoredQuiz {
  const feedback = quiz.questions.map(question => {
    const selectedOptionId = selectedOption(quiz, question.id, answers)
    return { questionId: question.id, selectedOptionId, correct: selectedOptionId === question.correctOptionId }
  })
  return {
    result: {
      quizId: quiz.id,
      score: feedback.filter(item => item.correct).length,
      totalQuestions: quiz.questions.length,
      completedAt: completedAt.toISOString(),
    },
    feedback,
  }
}
