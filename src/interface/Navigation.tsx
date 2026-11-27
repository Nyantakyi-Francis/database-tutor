import Icon from './Icon'

const links = [
  ['home', 'Home', 'home', 'Home'], ['lessons', 'Lessons', 'book', 'Lessons'],
  ['practice', 'SQL Practice', 'code', 'Practice'], ['quizzes', 'Quizzes', 'check', 'Quizzes'],
  ['progress', 'Progress', 'chart', 'Progress'],
] as const

export default function Navigation({ activePage }: { activePage: string }) {
  return <nav aria-label="Main navigation">
    {links.map(([id, label, icon, mobileLabel]) => <a key={id} href={`#${id}`} aria-label={label}
      aria-current={activePage === id ? 'page' : undefined}>
      <Icon name={icon} className="nav-icon" />
      <span className="nav-label">{label}</span>
      <span className="mobile-nav-label" aria-hidden="true">{mobileLabel}</span>
    </a>)}
  </nav>
}
