import { useEffect, useState } from 'react'
import LessonsPage from './lessons/LessonsPage'
import SqlPracticePage from './database/SqlPracticePage'
import QuizzesPage from './assessment/QuizzesPage'
import ProgressPage from './assessment/ProgressPage'
import HomePage from './interface/HomePage'
import Layout from './interface/Layout'

const pages = {
  home: HomePage,
  lessons: LessonsPage,
  practice: SqlPracticePage,
  quizzes: QuizzesPage,
  progress: ProgressPage,
}

function currentPage(): keyof typeof pages {
  const key = window.location.hash.slice(1)
  return Object.hasOwn(pages, key) ? key as keyof typeof pages : 'home'
}

export default function App() {
  const [page, setPage] = useState(currentPage)
  useEffect(() => {
    const navigate = () => setPage(currentPage())
    window.addEventListener('hashchange', navigate)
    return () => window.removeEventListener('hashchange', navigate)
  }, [])
  const Page = pages[page]
  return <Layout activePage={page}><Page /></Layout>
}
