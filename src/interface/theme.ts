export type ThemePreference = 'auto' | 'light' | 'dark'
export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'database-tutor:appearance:v1'

export function scheduledTheme(date = new Date()): Theme {
  const hour = date.getHours()
  return hour >= 18 || hour < 6 ? 'dark' : 'light'
}

export function resolveTheme(preference: ThemePreference, date = new Date()): Theme {
  return preference === 'auto' ? scheduledTheme(date) : preference
}

/** Local calendar hours preserve the 6 a.m./6 p.m. schedule across clock changes. */
export function nextThemeChange(date = new Date()): Date {
  const next = new Date(date)
  const hour = date.getHours()
  next.setHours(hour < 6 ? 6 : hour < 18 ? 18 : 30, 0, 0, 0)
  return next
}

export function readThemePreference(): ThemePreference {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (value === 'light' || value === 'dark') return value
  } catch { /* Automatic mode also works when browser storage is unavailable. */ }
  return 'auto'
}

export function applyTheme(preference: ThemePreference) {
  document.documentElement.dataset.theme = resolveTheme(preference)
}
