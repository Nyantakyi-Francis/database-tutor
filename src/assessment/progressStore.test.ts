import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { QuizResult } from '../shared/types'
import { PROGRESS_STORAGE_KEY, createEmptyProgress, type ProgressStorage } from './progressStorage'
import { createProgressStore } from './progressStore'

class MemoryStorage implements ProgressStorage {
  values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
  removeItem(key: string) { this.values.delete(key) }
}

/** Reads normally; writes fail with the given error until `failing` is cleared. */
class FlakyStorage extends MemoryStorage {
  failing: Error | null
  constructor(error: Error) { super(); this.failing = error }
  override setItem(key: string, value: string) {
    if (this.failing) throw this.failing
    super.setItem(key, value)
  }
  override removeItem(key: string) {
    if (this.failing) throw this.failing
    super.removeItem(key)
  }
}

const lessonIds = ['tables', 'records', 'fields', 'primary-keys', 'foreign-keys', 'relationships']
const quizIds = ['database-basics', 'keys-and-relationships', 'basic-sql']
const full = new DOMException('The quota has been exceeded.', 'QuotaExceededError')
const quizResult = (quizId: string, score: number, completedAt = '2026-11-25T10:00:00.000Z'): QuizResult =>
  ({ quizId, score, totalQuestions: 4, completedAt })

function storeOn(storage: ProgressStorage | null) {
  return createProgressStore(() => storage, lessonIds, quizIds)
}

let warn: ReturnType<typeof vi.spyOn>
beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
afterEach(() => { warn.mockRestore() })

describe('persistence across refresh and browser restart', () => {
  it('a new store on the same storage restores lessons and quiz results', () => {
    const storage = new MemoryStorage()
    const first = storeOn(storage)
    first.setLessonCompleted('tables', true)
    first.setLessonCompleted('keys-missing', true)
    first.recordQuizResult(quizResult('basic-sql', 3))

    const afterRefresh = storeOn(storage).getSnapshot()
    expect(afterRefresh.problem).toBeNull()
    expect(afterRefresh.progress.completedLessonIds).toEqual(['tables'])
    expect(afterRefresh.progress.latestQuizResults).toEqual({ 'basic-sql': quizResult('basic-sql', 3) })
  })

  it('undoing a lesson is saved too', () => {
    const storage = new MemoryStorage()
    const store = storeOn(storage)
    store.setLessonCompleted('tables', true)
    store.setLessonCompleted('records', true)
    store.setLessonCompleted('tables', false)
    expect(storeOn(storage).getSnapshot().progress.completedLessonIds).toEqual(['records'])
  })

  it('a retake replaces only that quiz after a refresh', () => {
    const storage = new MemoryStorage()
    const store = storeOn(storage)
    store.recordQuizResult(quizResult('database-basics', 2))
    store.recordQuizResult(quizResult('basic-sql', 1))
    storeOn(storage).recordQuizResult(quizResult('basic-sql', 4, '2026-11-26T08:00:00.000Z'))

    expect(storeOn(storage).getSnapshot().progress.latestQuizResults).toEqual({
      'database-basics': quizResult('database-basics', 2),
      'basic-sql': quizResult('basic-sql', 4, '2026-11-26T08:00:00.000Z'),
    })
  })

  it('drops saved results for quizzes that no longer exist, keeping the rest', () => {
    const storage = new MemoryStorage()
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({
      version: 1,
      completedLessonIds: ['tables'],
      latestQuizResults: { 'demo-quiz': quizResult('demo-quiz', 3), 'basic-sql': quizResult('basic-sql', 2) },
    }))
    const snapshot = storeOn(storage).getSnapshot()
    expect(snapshot.problem).toBeNull()
    expect(snapshot.progress.latestQuizResults).toEqual({ 'basic-sql': quizResult('basic-sql', 2) })
    expect(snapshot.progress.completedLessonIds).toEqual(['tables'])
  })

  it('refuses a result for an unknown quiz without saving', () => {
    const storage = new MemoryStorage()
    const result = storeOn(storage).recordQuizResult(quizResult('demo-quiz', 3))
    expect(result.ok).toBe(false)
    expect(storage.values.size).toBe(0)
  })
})

describe('every page shares one copy', () => {
  it('notifies subscribers, so another page sees the change', () => {
    const store = storeOn(new MemoryStorage())
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)
    store.setLessonCompleted('fields', true)
    expect(listener).toHaveBeenCalledOnce()
    expect(store.getSnapshot().progress.completedLessonIds).toEqual(['fields'])
    unsubscribe()
    store.setLessonCompleted('records', true)
    expect(listener).toHaveBeenCalledOnce()
  })

  it('reload picks up a change saved by another tab', () => {
    const storage = new MemoryStorage()
    const thisTab = storeOn(storage)
    storeOn(storage).setLessonCompleted('records', true)
    expect(thisTab.getSnapshot().progress.completedLessonIds).toEqual([])
    thisTab.reload()
    expect(thisTab.getSnapshot().progress.completedLessonIds).toEqual(['records'])
  })
})

describe('invalid saved data', () => {
  it('starts empty with a message, then a new save replaces the bad copy', () => {
    const storage = new MemoryStorage()
    storage.setItem(PROGRESS_STORAGE_KEY, '{"version":1,')
    const store = storeOn(storage)
    expect(store.getSnapshot().progress).toEqual(createEmptyProgress())
    expect(store.getSnapshot().problem).toMatch(/could not be read/)

    expect(store.setLessonCompleted('tables', true)).toEqual({ ok: true })
    expect(store.getSnapshot().problem).toBeNull()
    expect(storeOn(storage).getSnapshot().progress.completedLessonIds).toEqual(['tables'])
  })
})

describe('unavailable or full storage', () => {
  it('keeps progress in memory when storage does not exist', () => {
    const store = storeOn(null)
    expect(store.getSnapshot().problem).toMatch(/cannot be saved/)
    const result = store.setLessonCompleted('tables', true)
    store.recordQuizResult(quizResult('basic-sql', 2))
    expect(result.ok).toBe(false)
    expect(store.getSnapshot().progress.completedLessonIds).toEqual(['tables'])
    expect(store.getSnapshot().progress.latestQuizResults['basic-sql'].score).toBe(2)
    expect(store.getSnapshot().problem).toMatch(/cannot be saved/)
  })

  it('reports full storage, keeps the change in memory, and clears the message once saving works', () => {
    const storage = new FlakyStorage(full)
    const store = storeOn(storage)
    const failed = store.recordQuizResult(quizResult('basic-sql', 3))
    expect(failed.ok).toBe(false)
    expect(!failed.ok && failed.message).toMatch(/storage is full/)
    expect(store.getSnapshot().problem).toMatch(/storage is full/)
    expect(store.getSnapshot().progress.latestQuizResults['basic-sql'].score).toBe(3)

    storage.failing = null
    expect(store.setLessonCompleted('tables', true)).toEqual({ ok: true })
    expect(store.getSnapshot().problem).toBeNull()
    expect(storeOn(storage).getSnapshot().progress).toEqual({
      version: 1, completedLessonIds: ['tables'], latestQuizResults: { 'basic-sql': quizResult('basic-sql', 3) },
    })
  })
})

describe('progress reset', () => {
  it('clears lessons and quiz scores and removes only the progress key', () => {
    const storage = new MemoryStorage()
    storage.setItem('database-tutor:other-setting', 'kept')
    const store = storeOn(storage)
    store.setLessonCompleted('tables', true)
    store.recordQuizResult(quizResult('basic-sql', 4))

    expect(store.reset()).toEqual({ ok: true })
    expect(store.getSnapshot()).toEqual({ progress: createEmptyProgress(), problem: null })
    expect(storage.values.has(PROGRESS_STORAGE_KEY)).toBe(false)
    expect(storage.values.get('database-tutor:other-setting')).toBe('kept')
    expect(storeOn(storage).getSnapshot().progress).toEqual(createEmptyProgress())
  })

  it('clears memory but reports when the saved copy cannot be removed', () => {
    const storage = new FlakyStorage(new DOMException('Blocked', 'SecurityError'))
    storage.values.set(PROGRESS_STORAGE_KEY, JSON.stringify({
      version: 1, completedLessonIds: ['tables'], latestQuizResults: {},
    }))
    const store = storeOn(storage)
    const result = store.reset()
    expect(result.ok).toBe(false)
    expect(store.getSnapshot().progress).toEqual(createEmptyProgress())
    expect(store.getSnapshot().problem).toMatch(/could not be removed/)
  })
})
