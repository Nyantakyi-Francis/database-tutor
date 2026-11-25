// Owner: Victor Talabi. One in-memory copy of progress shared by every page.
// Each change is saved; if saving fails, progress stays in memory and a
// problem message is kept until a later save succeeds.
import type { QuizResult, StudentProgress } from '../shared/types'
import {
  createEmptyProgress,
  loadProgress,
  resetProgress,
  saveProgress,
  setLessonCompletion,
  setQuizResult,
  type ProgressStorage,
} from './progressStorage'

export interface ProgressSnapshot {
  progress: StudentProgress
  /** Set when saved progress could not be read or the last save failed. */
  problem: string | null
}

export type ActionResult = { ok: true } | { ok: false; message: string }

export function createProgressStore(
  getStorage: () => ProgressStorage | null,
  knownLessonIds: readonly string[],
  knownQuizIds: readonly string[],
) {
  const listeners = new Set<() => void>()
  let snapshot: ProgressSnapshot = readSaved()

  function readSaved(): ProgressSnapshot {
    const loaded = loadProgress(getStorage(), knownLessonIds, knownQuizIds)
    return { progress: loaded.progress, problem: loaded.message ?? null }
  }

  function publish(next: ProgressSnapshot) {
    snapshot = next
    listeners.forEach(listener => listener())
  }

  function save(progress: StudentProgress): ActionResult {
    const result = saveProgress(progress, getStorage())
    publish({ progress, problem: result.ok ? null : result.message })
    return result
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    /** Re-reads storage, for example after another tab changed it. */
    reload() { publish(readSaved()) },
    setLessonCompleted(lessonId: string, completed: boolean): ActionResult {
      const result = setLessonCompletion(snapshot.progress, lessonId, completed, knownLessonIds)
      return result.ok ? save(result.progress) : result
    },
    recordQuizResult(result: QuizResult): ActionResult {
      if (!knownQuizIds.includes(result.quizId)) {
        return { ok: false, message: 'This quiz could not be found, so its score was not saved.' }
      }
      return save(setQuizResult(snapshot.progress, result))
    },
    /** Clears lessons and quiz scores only. The page asks the student to confirm first. */
    reset(): ActionResult {
      const result = resetProgress(getStorage())
      publish({ progress: createEmptyProgress(), problem: result.ok ? null : result.message })
      return result
    },
  }
}

export type ProgressStore = ReturnType<typeof createProgressStore>
