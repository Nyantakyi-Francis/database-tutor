import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { StudentProgress } from '../shared/types'
import {
  PROGRESS_STORAGE_KEY,
  createEmptyProgress,
  loadProgress,
  resetProgress,
  saveProgress,
  setLessonCompletion,
  setQuizResult,
  type ProgressStorage,
} from './progressStorage'

/** In-memory stand-in for localStorage. */
class MemoryStorage implements ProgressStorage {
  values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
  removeItem(key: string) { this.values.delete(key) }
}

/** Storage that fails like a blocked or full localStorage. */
class FailingStorage implements ProgressStorage {
  constructor(private readonly error: Error) {}
  getItem(): string | null { throw this.error }
  setItem(): void { throw this.error }
  removeItem(): void { throw this.error }
}

const lessonIds = ['tables', 'records', 'fields', 'primary-keys', 'foreign-keys', 'relationships']

const sample: StudentProgress = {
  version: 1,
  completedLessonIds: ['tables', 'records'],
  latestQuizResults: {
    'demo-quiz': { quizId: 'demo-quiz', score: 3, totalQuestions: 4, completedAt: '2026-11-13T18:00:00.000Z' },
  },
}

function storageWith(raw: string) {
  const storage = new MemoryStorage()
  storage.setItem(PROGRESS_STORAGE_KEY, raw)
  return storage
}

function withQuiz(result: Record<string, unknown>) {
  return JSON.stringify({ ...sample, latestQuizResults: { 'demo-quiz': { ...sample.latestQuizResults['demo-quiz'], ...result } } })
}

let warn: ReturnType<typeof vi.spyOn>
beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
afterEach(() => { warn.mockRestore() })

describe('save and restore', () => {
  it('restores completed lessons and the quiz score after saving', () => {
    const storage = new MemoryStorage()
    expect(saveProgress(sample, storage)).toEqual({ ok: true })

    const loaded = loadProgress(storage, lessonIds)
    expect(loaded.status).toBe('restored')
    expect(loaded.progress).toEqual(sample)
    expect(loaded.message).toBeUndefined()
    expect(warn).not.toHaveBeenCalled()
  })

  it('stores JSON under the single versioned key', () => {
    const storage = new MemoryStorage()
    saveProgress(sample, storage)
    expect([...storage.values.keys()]).toEqual([PROGRESS_STORAGE_KEY])
    expect(JSON.parse(storage.values.get(PROGRESS_STORAGE_KEY)!)).toEqual(sample)
  })

  it('starts with defaults and no warning when nothing is saved', () => {
    expect(loadProgress(new MemoryStorage(), lessonIds)).toEqual({ progress: createEmptyProgress(), status: 'empty' })
    expect(warn).not.toHaveBeenCalled()
  })

  it('drops unknown or repeated lesson IDs and keeps the rest', () => {
    const raw = JSON.stringify({ ...sample, completedLessonIds: ['tables', 'old-lesson', 'tables'] })
    const loaded = loadProgress(storageWith(raw), lessonIds)
    expect(loaded.status).toBe('restored')
    expect(loaded.progress.completedLessonIds).toEqual(['tables'])
    expect(loaded.progress.latestQuizResults).toEqual(sample.latestQuizResults)
    expect(warn).toHaveBeenCalledOnce()
  })
})

describe('marking a lesson complete', () => {
  it('adds a known lesson once, even when marked twice', () => {
    const first = setLessonCompletion(sample, 'fields', true, lessonIds)
    if (!first.ok) throw new Error('expected ok')
    const second = setLessonCompletion(first.progress, 'fields', true, lessonIds)
    if (!second.ok) throw new Error('expected ok')
    expect(second.progress.completedLessonIds).toEqual(['tables', 'records', 'fields'])
    expect(sample.completedLessonIds).toEqual(['tables', 'records'])
  })

  it('removes a lesson marked incomplete', () => {
    const result = setLessonCompletion(sample, 'tables', false, lessonIds)
    expect(result).toEqual({ ok: true, progress: { ...sample, completedLessonIds: ['records'] } })
  })

  it('rejects an unknown lesson ID and leaves progress unchanged', () => {
    const result = setLessonCompletion(sample, 'old-lesson', true, lessonIds)
    expect(result.ok).toBe(false)
    expect(sample.completedLessonIds).toEqual(['tables', 'records'])
    expect(warn).toHaveBeenCalledOnce()
  })
})

describe('invalid saved data resets to defaults with a warning', () => {
  it.each([
    ['corrupted JSON', '{"version":1,"completedLessonIds":['],
    ['plain text', 'hello'],
  ])('%s', (_name, raw) => {
    const loaded = loadProgress(storageWith(raw), lessonIds)
    expect(loaded.status).toBe('invalid')
    expect(loaded.progress).toEqual(createEmptyProgress())
    expect(loaded.message).toMatch(/reset/)
    expect(warn).toHaveBeenCalledOnce()
    expect(String(warn.mock.calls[0][0])).toMatch(/not valid JSON/)
  })

  it.each([
    ['null', 'null'],
    ['an array', '[]'],
    ['a number', '42'],
    ['an empty object', '{}'],
    ['a different version', JSON.stringify({ ...sample, version: 2 })],
    ['missing completedLessonIds', JSON.stringify({ version: 1, latestQuizResults: {} })],
    ['missing latestQuizResults', JSON.stringify({ version: 1, completedLessonIds: [] })],
    ['latestQuizResults as an array', JSON.stringify({ ...sample, latestQuizResults: [] })],
  ])('wrong shape: %s', (_name, raw) => {
    const loaded = loadProgress(storageWith(raw), lessonIds)
    expect(loaded.status).toBe('invalid')
    expect(loaded.progress).toEqual(createEmptyProgress())
    expect(warn).toHaveBeenCalledOnce()
  })

  it.each([
    ['completedLessonIds as a string', JSON.stringify({ ...sample, completedLessonIds: 'tables' })],
    ['completedLessonIds with numbers', JSON.stringify({ ...sample, completedLessonIds: ['tables', 2] })],
    ['score as a string', withQuiz({ score: '3' })],
    ['score as a decimal', withQuiz({ score: 2.5 })],
    ['totalQuestions of zero', withQuiz({ score: 0, totalQuestions: 0 })],
    ['a missing date', withQuiz({ completedAt: undefined })],
    ['a date that is not ISO 8601', withQuiz({ completedAt: 'yesterday' })],
    ['a quizId that does not match its key', withQuiz({ quizId: 'other-quiz' })],
    ['a quiz result that is not an object', JSON.stringify({ ...sample, latestQuizResults: { 'demo-quiz': 3 } })],
  ])('wrong types: %s', (_name, raw) => {
    const loaded = loadProgress(storageWith(raw), lessonIds)
    expect(loaded.status).toBe('invalid')
    expect(loaded.progress).toEqual(createEmptyProgress())
    expect(warn).toHaveBeenCalledOnce()
  })

  it.each([
    ['above totalQuestions', 5],
    ['below zero', -1],
  ])('out-of-range score: %s', (_name, score) => {
    const loaded = loadProgress(storageWith(withQuiz({ score })), lessonIds)
    expect(loaded.status).toBe('invalid')
    expect(loaded.progress).toEqual(createEmptyProgress())
    expect(String(warn.mock.calls[0][0])).toMatch(/score outside 0-4/)
  })

  it('accepts the edge scores 0 and totalQuestions', () => {
    expect(loadProgress(storageWith(withQuiz({ score: 0 }))).status).toBe('restored')
    expect(loadProgress(storageWith(withQuiz({ score: 4 }))).status).toBe('restored')
  })
})

describe('storage failures keep the app working', () => {
  const blocked = new DOMException('The operation is insecure.', 'SecurityError')
  const full = new DOMException('The quota has been exceeded.', 'QuotaExceededError')

  it('returns defaults and a message when reading throws', () => {
    const loaded = loadProgress(new FailingStorage(blocked), lessonIds)
    expect(loaded.status).toBe('unavailable')
    expect(loaded.progress).toEqual(createEmptyProgress())
    expect(loaded.message).toMatch(/cannot be saved/)
    expect(warn).toHaveBeenCalledOnce()
  })

  it('returns defaults and a message when storage does not exist', () => {
    const loaded = loadProgress(null, lessonIds)
    expect(loaded.status).toBe('unavailable')
    expect(loaded.progress).toEqual(createEmptyProgress())
    expect(warn).toHaveBeenCalledOnce()
  })

  it('reports a full storage when saving hits the quota', () => {
    const progress = structuredClone(sample)
    const result = saveProgress(progress, new FailingStorage(full))
    expect(result.ok).toBe(false)
    expect(!result.ok && result.message).toMatch(/storage is full/)
    expect(progress).toEqual(sample)
    expect(warn).toHaveBeenCalledOnce()
  })

  it('reports a message when saving is blocked', () => {
    const result = saveProgress(sample, new FailingStorage(blocked))
    expect(result.ok).toBe(false)
    expect(!result.ok && result.message).toMatch(/cannot be saved/)
  })

  it('reports a message when storage does not exist on save', () => {
    expect(saveProgress(sample, null).ok).toBe(false)
  })
})

describe('reset', () => {
  it('removes only the progress key, so the next load starts empty', () => {
    const storage = new MemoryStorage()
    storage.setItem('database-tutor:sql-practice', 'kept')
    saveProgress(sample, storage)

    expect(resetProgress(storage)).toEqual({ ok: true })
    expect(storage.values.has(PROGRESS_STORAGE_KEY)).toBe(false)
    expect(storage.values.get('database-tutor:sql-practice')).toBe('kept')
    expect(loadProgress(storage, lessonIds)).toEqual({ progress: createEmptyProgress(), status: 'empty' })
  })

  it('reports a message when removing throws', () => {
    const result = resetProgress(new FailingStorage(new DOMException('Blocked', 'SecurityError')))
    expect(result.ok).toBe(false)
    expect(!result.ok && result.message).toMatch(/could not be removed/)
    expect(warn).toHaveBeenCalledOnce()
  })

  it('reports a message when storage does not exist', () => {
    expect(resetProgress(null).ok).toBe(false)
  })
})

describe('recording a quiz result', () => {
  const other = { quizId: 'basic-sql', score: 2, totalQuestions: 4, completedAt: '2026-11-20T09:00:00.000Z' }
  const base: StudentProgress = { ...sample, latestQuizResults: { ...sample.latestQuizResults, 'basic-sql': other } }

  it('adds a result for a quiz with no saved result', () => {
    const result = { quizId: 'database-basics', score: 4, totalQuestions: 4, completedAt: '2026-11-25T10:00:00.000Z' }
    const next = setQuizResult(base, result)
    expect(next.latestQuizResults['database-basics']).toEqual(result)
    expect(Object.keys(next.latestQuizResults)).toHaveLength(3)
  })

  it('a retake replaces only that quiz and keeps lessons and other quizzes', () => {
    const retake = { ...sample.latestQuizResults['demo-quiz'], score: 1, completedAt: '2026-11-25T11:00:00.000Z' }
    const next = setQuizResult(base, retake)
    expect(next.latestQuizResults['demo-quiz']).toEqual(retake)
    expect(next.latestQuizResults['basic-sql']).toEqual(other)
    expect(next.completedLessonIds).toEqual(base.completedLessonIds)
    expect(base.latestQuizResults['demo-quiz'].score).toBe(3)
  })

  it('a retake survives save and load', () => {
    const storage = new MemoryStorage()
    saveProgress(base, storage)
    const retake = { ...other, score: 4, completedAt: '2026-11-25T12:00:00.000Z' }
    saveProgress(setQuizResult(loadProgress(storage, lessonIds).progress, retake), storage)
    const loaded = loadProgress(storage, lessonIds).progress
    expect(loaded.latestQuizResults['basic-sql']).toEqual(retake)
    expect(loaded.latestQuizResults['demo-quiz']).toEqual(sample.latestQuizResults['demo-quiz'])
  })
})
