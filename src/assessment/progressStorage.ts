// Owner: Victor Talabi. Validated, versioned saved progress.
// Do not store or reset the SQL database under this key.
import type { QuizResult, StudentProgress } from '../shared/types'

export const PROGRESS_STORAGE_KEY = 'database-tutor:progress:v1'

/** The part of the Web Storage API this module uses. Tests pass a fake. */
export type ProgressStorage = Pick<Storage, 'getItem' | 'setItem'>

export type LoadStatus = 'restored' | 'empty' | 'invalid' | 'unavailable'

export interface LoadResult {
  progress: StudentProgress
  status: LoadStatus
  /** A message for the student when saved progress could not be used. */
  message?: string
}

export type SaveResult = { ok: true } | { ok: false; message: string }

type ParseResult = { ok: true; progress: StudentProgress } | { ok: false; reason: string }

const LOG_PREFIX = '[progress]'
const unavailableMessage =
  'Progress cannot be saved in this browser. It will be kept until you close or refresh the page.'
const ISO_8601 =/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/

export function createEmptyProgress(): StudentProgress {
  return { version: 1, completedLessonIds: [], latestQuizResults: {} }
}

/**
 * Returns browser localStorage, or null when it cannot be reached.
 * Reading window.localStorage itself throws in some blocked or private modes.
 */
export function getBrowserStorage(): ProgressStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseQuizResult(key: string, value: unknown): QuizResult | string {
  if (!isRecord(value)) return `quiz result "${key}" is not an object`
  const { quizId, score, totalQuestions, completedAt } = value
  if (quizId !== key) return `quiz result "${key}" has a mismatched quizId`
  if (!Number.isInteger(totalQuestions) || (totalQuestions as number) < 1) {
    return `quiz result "${key}" has an invalid totalQuestions`
  }
  if (!Number.isInteger(score) || (score as number) < 0 || (score as number) > (totalQuestions as number)) {
    return `quiz result "${key}" has a score outside 0-${String(totalQuestions)}`
  }
  if (typeof completedAt !== 'string' || !ISO_8601.test(completedAt) || Number.isNaN(Date.parse(completedAt))) {
    return `quiz result "${key}" has an invalid completedAt date`
  }
  return { quizId, score: score as number, totalQuestions: totalQuestions as number, completedAt }
}

/** Checks saved JSON against StudentProgress version 1. Never throws. */
export function parseProgress(raw: string): ParseResult {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return { ok: false, reason: 'saved value is not valid JSON' }
  }
  if (!isRecord(data)) return { ok: false, reason: 'saved value is not an object' }
  if (data.version !== 1) return { ok: false, reason: `unsupported version ${JSON.stringify(data.version)}` }

  const { completedLessonIds, latestQuizResults } = data
  if (!Array.isArray(completedLessonIds) || !completedLessonIds.every(id => typeof id === 'string')) {
    return { ok: false, reason: 'completedLessonIds is not a list of strings' }
  }
  if (!isRecord(latestQuizResults)) return { ok: false, reason: 'latestQuizResults is not an object' }

  const results: Record<string, QuizResult> = {}
  for (const [key, value] of Object.entries(latestQuizResults)) {
    const result = parseQuizResult(key, value)
    if (typeof result === 'string') return { ok: false, reason: result }
    results[key] = result
  }

  return {
    ok: true,
    progress: { version: 1, completedLessonIds: [...new Set(completedLessonIds)], latestQuizResults: results },
  }
}

/**
 * Reads saved progress. Invalid data or a storage failure returns empty
 * progress with a message and logs a warning; it never throws.
 * Lesson IDs not in knownLessonIds are dropped, keeping the rest.
 */
export function loadProgress(
  storage: ProgressStorage | null = getBrowserStorage(),
  knownLessonIds?: readonly string[],
): LoadResult {
  if (!storage) {
    console.warn(`${LOG_PREFIX} Browser storage is not available. Progress will be kept until the page is closed.`)
    return { progress: createEmptyProgress(), status: 'unavailable', message: unavailableMessage }
  }

  let raw: string | null
  try {
    raw = storage.getItem(PROGRESS_STORAGE_KEY)
  } catch (error) {
    console.warn(`${LOG_PREFIX} Could not read saved progress.`, error)
    return { progress: createEmptyProgress(), status: 'unavailable', message: unavailableMessage }
  }
  if (raw === null) return { progress: createEmptyProgress(), status: 'empty' }

  const parsed = parseProgress(raw)
  if (!parsed.ok) {
    console.warn(`${LOG_PREFIX} Ignored saved progress and started fresh: ${parsed.reason}.`)
    return {
      progress: createEmptyProgress(),
      status: 'invalid',
      message: 'Saved progress could not be read, so it was reset. New progress will replace it.',
    }
  }

  const progress = parsed.progress
  if (knownLessonIds) {
    const unknown = progress.completedLessonIds.filter(id => !knownLessonIds.includes(id))
    if (unknown.length > 0) {
      console.warn(`${LOG_PREFIX} Dropped unknown lesson IDs: ${unknown.join(', ')}.`)
      progress.completedLessonIds = progress.completedLessonIds.filter(id => knownLessonIds.includes(id))
    }
  }
  return { progress, status: 'restored' }
}

/** Writes progress. A storage failure returns a message and logs a warning; it never throws. */
export function saveProgress(
  progress: StudentProgress,
  storage: ProgressStorage | null = getBrowserStorage(),
): SaveResult {
  if (!storage) {
    console.warn(`${LOG_PREFIX} Browser storage is not available. Progress was not saved.`)
    return { ok: false, message: unavailableMessage }
  }
  try {
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))
    return { ok: true }
  } catch (error) {
    console.warn(`${LOG_PREFIX} Could not save progress.`, error)
    const full = error instanceof DOMException && error.name === 'QuotaExceededError'
    return {
      ok: false,
      message: full
        ? 'Browser storage is full, so progress was not saved. It will be kept until you close or refresh the page.'
        : unavailableMessage,
    }
  }
}
