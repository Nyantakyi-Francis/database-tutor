import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './interface/styles.css'
import { applyTheme, readThemePreference } from './interface/theme'

applyTheme(readThemePreference())

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
)
