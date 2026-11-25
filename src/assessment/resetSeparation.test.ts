import initSqlJs from 'sql.js'
import type { SqlJsStatic } from 'sql.js'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSchoolDatabase, executeQuery } from '../database/databaseService'
import { sampleQuery, sampleQueryResult } from '../database/schoolData'
import { PROGRESS_STORAGE_KEY, type ProgressStorage } from './progressStorage'
import { createProgressStore } from './progressStore'

class MemoryStorage implements ProgressStorage {
  values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
  removeItem(key: string) { this.values.delete(key) }
}

let SQL: SqlJsStatic
beforeAll(async () => {
  SQL = await initSqlJs({
    locateFile: () => new URL('../../node_modules/sql.js/dist/sql-wasm.wasm', import.meta.url).href,
  })
})
let warn: ReturnType<typeof vi.spyOn>
beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
afterEach(() => { warn.mockRestore() })

function savedProgress() {
  const storage = new MemoryStorage()
  const store = createProgressStore(() => storage, ['tables'], ['basic-sql'])
  store.setLessonCompleted('tables', true)
  store.recordQuizResult({ quizId: 'basic-sql', score: 3, totalQuestions: 4, completedAt: '2026-11-25T10:00:00.000Z' })
  return { storage, store }
}

describe('each reset clears only its own data', () => {
  it('resetting the school database leaves saved progress unchanged', () => {
    const { storage } = savedProgress()
    const before = storage.getItem(PROGRESS_STORAGE_KEY)

    const edited = createSchoolDatabase(SQL)
    executeQuery(edited, 'DELETE FROM Students;')
    edited.close()
    const reset = createSchoolDatabase(SQL) // what Reset school database does
    try {
      expect(executeQuery(reset, sampleQuery)).toEqual(sampleQueryResult)
    } finally {
      reset.close()
    }
    expect(storage.getItem(PROGRESS_STORAGE_KEY)).toBe(before)
    expect(createProgressStore(() => storage, ['tables'], ['basic-sql']).getSnapshot().progress.completedLessonIds)
      .toEqual(['tables'])
  })

  it('resetting progress leaves the school database and its edits unchanged', () => {
    const { store } = savedProgress()
    const database = createSchoolDatabase(SQL)
    try {
      executeQuery(database, "UPDATE Students SET class_name = 'JHS 2A' WHERE student_id = 101;")
      store.reset()
      expect(executeQuery(database, 'SELECT class_name FROM Students WHERE student_id = 101;').rows)
        .toEqual([['JHS 2A']])
    } finally {
      database.close()
    }
  })
})
