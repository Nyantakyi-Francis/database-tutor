import { describe, expect, it } from 'vitest'
import { parseProgress } from './progressStorage'
import { quizzes } from './quizData'
import { findUnanswered, scoreQuiz } from './quizScoring'

const quiz = quizzes[0]
const completedAt = new Date('2026-11-25T10:00:00.000Z')
const correctAnswers = Object.fromEntries(quiz.questions.map(q => [q.id, q.correctOptionId]))
const wrongOption = (index: number) =>
  quiz.questions[index].options.find(option => option.id !== quiz.questions[index].correctOptionId)!.id

describe('scoreQuiz', () => {
  it('scores all correct answers as 4 out of 4', () => {
    const { result, feedback } = scoreQuiz(quiz, correctAnswers, completedAt)
    expect(result).toEqual({ quizId: quiz.id, score: 4, totalQuestions: 4, completedAt: '2026-11-25T10:00:00.000Z' })
    expect(feedback.every(item => item.correct)).toBe(true)
  })

  it('counts only the correct answers', () => {
    const answers = { ...correctAnswers, [quiz.questions[1].id]: wrongOption(1), [quiz.questions[3].id]: wrongOption(3) }
    const { result, feedback } = scoreQuiz(quiz, answers, completedAt)
    expect(result.score).toBe(2)
    expect(feedback.map(item => item.correct)).toEqual([true, false, true, false])
    expect(feedback[1].selectedOptionId).toBe(wrongOption(1))
  })

  it('scores an empty attempt as 0 and marks every question unanswered', () => {
    const { result, feedback } = scoreQuiz(quiz, {}, completedAt)
    expect(result.score).toBe(0)
    expect(feedback.every(item => item.selectedOptionId === undefined && !item.correct)).toBe(true)
  })

  it('treats an option from another question or an unknown ID as unanswered', () => {
    const answers = { ...correctAnswers, [quiz.questions[0].id]: 'z', unknown: 'a' }
    const { result, feedback } = scoreQuiz(quiz, answers, completedAt)
    expect(result.score).toBe(3)
    expect(feedback[0]).toEqual({ questionId: quiz.questions[0].id, selectedOptionId: undefined, correct: false })
  })

  it.each(quizzes)('$id: produces a result that passes saved-progress validation', item => {
    const { result } = scoreQuiz(item, {}, completedAt)
    const raw = JSON.stringify({ version: 1, completedLessonIds: [], latestQuizResults: { [item.id]: result } })
    expect(parseProgress(raw).ok).toBe(true)
  })
})

describe('findUnanswered', () => {
  it('lists unanswered questions in order', () => {
    const answers = { [quiz.questions[0].id]: correctAnswers[quiz.questions[0].id], [quiz.questions[2].id]: 'a' }
    expect(findUnanswered(quiz, answers)).toEqual([quiz.questions[1].id, quiz.questions[3].id])
  })

  it('returns an empty list when every question is answered', () => {
    expect(findUnanswered(quiz, correctAnswers)).toEqual([])
  })
})
