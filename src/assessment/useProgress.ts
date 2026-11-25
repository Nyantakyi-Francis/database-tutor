// Owner: Victor Talabi. Holds progress in memory and saves each change.
import { useState } from 'react'
import { lessons } from '../lessons/lessonData'
import type { QuizResult, StudentProgress } from '../shared/types'
import {
  createEmptyProgress,
  loadProgress,
  resetProgress,
  saveProgress,
  setLessonCompletion,
  setQuizResult,
} from './progressStorage'

export interface ProgressNotice {
  kind: 'saved' | 'problem'
  text: string
}

const lessonIds = lessons.map(lesson => lesson.id)

/** Restores saved progress once, then keeps working in memory even if saving fails. */
export function useProgress() {
  const [initial] = useState(() => loadProgress(undefined, lessonIds))
  const [progress, setProgress] = useState<StudentProgress>(initial.progress)
  const [notice, setNotice] = useState<ProgressNotice | null>(
    initial.message ? { kind: 'problem', text: initial.message } : null,
  )

  function update(next: StudentProgress, savedText = 'Progress saved in this browser.') {
    setProgress(next)
    const result = saveProgress(next)
    setNotice(result.ok
      ? { kind: 'saved', text: savedText }
      : { kind: 'problem', text: result.message })
  }

  function setLessonCompleted(lessonId: string, completed: boolean) {
    const result = setLessonCompletion(progress, lessonId, completed, lessonIds)
    const title = lessons.find(lesson => lesson.id === lessonId)?.title ?? 'Lesson'
    if (result.ok) update(result.progress, completed
      ? `"${title}" marked complete. Progress saved in this browser.`
      : `"${title}" marked as not complete. Progress saved in this browser.`)
    else setNotice({ kind: 'problem', text: result.message })
  }

  function recordQuizResult(result: QuizResult) {
    update(setQuizResult(progress, result), 'Quiz score saved in this browser. It replaces your previous score for this quiz.')
  }

  /** Clears lessons and quiz scores. The page asks the student to confirm first. */
  function reset() {
    setProgress(createEmptyProgress())
    const result = resetProgress()
    setNotice(result.ok
      ? { kind: 'saved', text: 'Progress reset. Completed lessons and quiz scores were removed.' }
      : { kind: 'problem', text: result.message })
  }

  return { progress, notice, setLessonCompleted, recordQuizResult, reset }
}
