import type { ReactNode } from 'react'
import Navigation from './Navigation'

export default function Layout({ activePage, children }: {
  activePage: string
  children: ReactNode
}) {
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header>
      <a className="brand" href="#home">Database Tutor</a>
      <Navigation activePage={activePage} />
    </header>
    <main id="main-content" tabIndex={-1}>{children}</main>
    <footer>CSE 499 | Database Tutor</footer>
  </>
}
