import { describe, expect, it } from 'vitest'
import { nextThemeChange, resolveTheme, scheduledTheme } from './theme'

// Use local dates because the schedule belongs to the learner's device timezone.
const at = (hour: number, minute = 0, second = 0) => new Date(2026, 10, 27, hour, minute, second)

describe('automatic evening theme', () => {
  it.each([
    [0, 0, 'dark'], [5, 59, 'dark'], [6, 0, 'light'],
    [12, 0, 'light'], [17, 59, 'light'], [18, 0, 'dark'], [23, 59, 'dark'],
  ] as const)('uses the correct theme at %i:%i', (hour, minute, expected) => {
    expect(scheduledTheme(at(hour, minute))).toBe(expected)
  })

  it('schedules exact future boundaries, including the next morning', () => {
    expect(nextThemeChange(at(5, 59, 59))).toEqual(at(6))
    expect(nextThemeChange(at(6))).toEqual(at(18))
    expect(nextThemeChange(at(17, 59, 59))).toEqual(at(18))
    expect(nextThemeChange(at(18))).toEqual(new Date(2026, 10, 28, 6))
    expect(nextThemeChange(at(23, 59))).toEqual(new Date(2026, 10, 28, 6))
  })

  it('keeps manual choices independent of the schedule', () => {
    expect(resolveTheme('light', at(23))).toBe('light')
    expect(resolveTheme('dark', at(12))).toBe('dark')
    expect(resolveTheme('auto', at(23))).toBe('dark')
    expect(resolveTheme('auto', at(12))).toBe('light')
  })
})
