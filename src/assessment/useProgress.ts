// Owner: Victor Talabi. Holds progress in memory and saves each change.
import { useState } from 'react'
import { lessons } from '../lessons/lessonData'
import type { QuizResult, StudentProgress } from '../shared/types'
import { loadProgress, saveProgress } from './progressStorage'

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

  function update(next: StudentProgress) {
    setProgress(next)
    const result = saveProgress(next)
    setNotice(result.ok
      ? { kind: 'saved', text: 'Progress saved in this browser.' }
      : { kind: 'problem', text: result.message })
  }

  function setLessonCompleted(lessonId: string, completed: boolean) {
    const others = progress.completedLessonIds.filter(id => id !== lessonId)
    update({ ...progress, completedLessonIds: completed ? [...others, lessonId] : others })
  }

  function recordQuizResult(result: QuizResult) {
    update({ ...progress, latestQuizResults: { ...progress.latestQuizResults, [result.quizId]: result } })
  }

  return { progress, notice, setLessonCompleted, recordQuizResult }
}
