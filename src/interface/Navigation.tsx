const links = [
  ['home', 'Home'], ['lessons', 'Lessons'], ['practice', 'SQL Practice'],
  ['quizzes', 'Quizzes'], ['progress', 'Progress'],
] as const

export default function Navigation({ activePage }: { activePage: string }) {
  return <nav aria-label="Main navigation">
    {links.map(([id, label]) => <a key={id} href={`#${id}`}
      aria-current={activePage === id ? 'page' : undefined}>{label}</a>)}
  </nav>
}
