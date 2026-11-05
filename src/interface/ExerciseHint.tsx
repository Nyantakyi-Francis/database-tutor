export default function ExerciseHint({ hint }: { hint?: string }) {
  if (!hint) return null
  return <details><summary>Show hint</summary><p>{hint}</p></details>
}
