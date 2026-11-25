import { useState } from 'react'

/** Student-controlled hint. Opening or closing it changes nothing else on the page. */
export default function ExerciseHint({ hint }: { hint?: string }) {
  const [open, setOpen] = useState(false)
  if (!hint) return null
  return <details open={open} onToggle={event => setOpen(event.currentTarget.open)}>
    <summary>{open ? 'Hide hint' : 'Show hint'}</summary><p>{hint}</p>
  </details>
}
