import { describe, expect, it } from 'vitest'
import { quizzes } from './quizData'

describe('quiz content', () => {
  it('has three quizzes with unique IDs', () => {
    expect(quizzes).toHaveLength(3)
    expect(new Set(quizzes.map(quiz => quiz.id)).size).toBe(3)
  })

  it.each(quizzes)('$id has four complete questions', quiz => {
    expect(quiz.questions).toHaveLength(4)
    expect(new Set(quiz.questions.map(question => question.id)).size).toBe(4)
    for (const question of quiz.questions) {
      const optionIds = question.options.map(option => option.id)
      expect(question.options).toHaveLength(4)
      expect(new Set(optionIds).size).toBe(4)
      expect(optionIds).toContain(question.correctOptionId)
      expect(question.prompt.trim()).not.toBe('')
      expect(question.explanation.trim()).not.toBe('')
    }
  })
})
