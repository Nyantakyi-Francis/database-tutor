/** IDs are stable content keys; coordinate contract changes with all owners. */
export interface Lesson {
  id: string
  title: string
  description: string
  content: string
  example: string
}

export type SQLValue = string | number | null | Uint8Array

/** An error has a readable message and empty columns/rows. Empty results are valid. */
export interface SQLQueryResult {
  columns: string[]
  rows: SQLValue[][]
  error?: string
}

export interface SQLExercise {
  id: string
  title: string
  topic: 'SELECT' | 'WHERE' | 'ORDER BY' | 'INNER JOIN'
  instructions: string
  starterQuery: string
  referenceQuery: string
  expectedResult: SQLQueryResult
  hint?: string
}

export interface QuizQuestion {
  id: string
  prompt: string
  options: { id: string; text: string }[]
  correctOptionId: string
  explanation: string
}

export interface Quiz {
  id: string
  title: string
  questions: QuizQuestion[]
}

/** Score is the number correct, out of totalQuestions; completedAt is ISO 8601. */
export interface QuizResult {
  quizId: string
  score: number
  totalQuestions: number
  completedAt: string
}

/** Store JSON separately from the disposable SQL practice database. */
export interface StudentProgress {
  version: 1
  completedLessonIds: string[]
  latestQuizResults: Record<string, QuizResult>
}
