// Owner: Victor Talabi. React access to the shared progress store.
import { useState, useSyncExternalStore } from 'react'
import { lessons } from '../lessons/lessonData'
import type { QuizResult } from '../shared/types'
import { PROGRESS_STORAGE_KEY, getBrowserStorage } from './progressStorage'
import { createProgressStore, type ActionResult } from './progressStore'
import { quizzes } from './quizData'

export interface ProgressNotice {
  kind: 'saved' | 'problem'
  text: string
}

const store = createProgressStore(
  getBrowserStorage,
  lessons.map(lesson => lesson.id),
  quizzes.map(quiz => quiz.id),
)

// Another tab saved or reset progress: show its latest copy here too.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', event => {
    if (event.key === PROGRESS_STORAGE_KEY || event.key === null) store.reload()
  })
}

/**
 * Every page shares one copy of progress, so changes made on one page show on
 * the others, and progress kept in memory (when storage fails) is not lost
 * when the student switches pages.
 */
export function useProgress() {
  const { progress, problem } = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const [lastAction, setLastAction] = useState<ProgressNotice | null>(null)

  function report(result: ActionResult, savedText: string) {
    setLastAction(result.ok ? { kind: 'saved', text: savedText } : { kind: 'problem', text: result.message })
  }

  function setLessonCompleted(lessonId: string, completed: boolean) {
    const title = lessons.find(lesson => lesson.id === lessonId)?.title ?? 'Lesson'
    report(store.setLessonCompleted(lessonId, completed), completed
      ? `"${title}" marked complete. Progress saved in this browser.`
      : `"${title}" marked as not complete. Progress saved in this browser.`)
  }

  function recordQuizResult(result: QuizResult) {
    report(store.recordQuizResult(result),
      'Quiz score saved in this browser. It replaces your previous score for this quiz.')
  }

  function reset() {
    report(store.reset(), 'Progress reset. Completed lessons and quiz scores were removed.')
  }

  // This page's latest action wins; otherwise show any ongoing storage problem.
  const notice: ProgressNotice | null = lastAction ?? (problem ? { kind: 'problem', text: problem } : null)

  return { progress, notice, setLessonCompleted, recordQuizResult, reset }
}
