import { useEffect, useState } from 'react'
import Icon from './Icon'
import { applyTheme, nextThemeChange, readThemePreference, THEME_STORAGE_KEY, type ThemePreference } from './theme'

export default function ThemeControl() {
  const [preference, setPreference] = useState<ThemePreference>(readThemePreference)

  useEffect(() => {
    let timer: number | undefined
    function sync() {
      window.clearTimeout(timer)
      applyTheme(preference)
      if (preference === 'auto') {
        const now = new Date()
        timer = window.setTimeout(sync, nextThemeChange(now).getTime() - now.getTime() + 25)
      }
    }
    function syncStorage(event: StorageEvent) {
      if (event.key === THEME_STORAGE_KEY || event.key === null) setPreference(readThemePreference())
    }
    sync()
    window.addEventListener('focus', sync)
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('storage', syncStorage)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('focus', sync)
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('storage', syncStorage)
    }
  }, [preference])

  function changeTheme(value: ThemePreference) {
    setPreference(value)
    try { window.localStorage.setItem(THEME_STORAGE_KEY, value) }
    catch { /* Keep the current choice for this visit even if it cannot be saved. */ }
  }

  return <div className="theme-control">
    <label className="sr-only" htmlFor="colour-theme">Colour theme</label>
    <Icon name="moon" />
    <select id="colour-theme" value={preference} aria-describedby="theme-schedule"
      title="Auto: dark from 6 p.m. to 6 a.m. in your local time"
      onChange={event => changeTheme(event.target.value as ThemePreference)}>
      <option value="auto">Auto</option>
      <option value="light">Soft light</option>
      <option value="dark">Dark</option>
    </select>
    <span id="theme-schedule" className="sr-only">Auto uses dark mode from 6 p.m. to 6 a.m. in your device's local time. Soft light and Dark override this schedule.</span>
  </div>
}
