import { useEffect, useRef, type ReactNode } from 'react'
import Navigation from './Navigation'
import ThemeControl from './ThemeControl'

export default function Layout({ activePage, children }: {
  activePage: string
  children: ReactNode
}) {
  const previousPage = useRef(activePage)
  useEffect(() => {
    if (previousPage.current !== activePage) {
      window.scrollTo(0, 0)
      document.getElementById('main-content')?.focus({ preventScroll: true })
      previousPage.current = activePage
    }
  }, [activePage])

  return <>
    <a className="skip-link" href="#main-content" onClick={event => {
      event.preventDefault()
      document.getElementById('main-content')?.focus()
    }}>Skip to content</a>
    <header>
      <a className="brand" href="#home"><span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>Database Tutor</a>
      <Navigation activePage={activePage} />
      <ThemeControl />
    </header>
    <main id="main-content" className={`view-${activePage}`} tabIndex={-1}>
      <div key={activePage} className="page-enter">{children}</div>
    </main>
    <footer>CSE 499 | Database Tutor</footer>
  </>
}
