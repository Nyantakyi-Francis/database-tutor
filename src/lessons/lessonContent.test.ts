import { describe, expect, it } from 'vitest'
import { lessons } from './lessonData'
import { parseLessonExample } from './lessonContent'

describe('accepted lesson examples', () => {
  it.each(lessons)('preserves every table row and separates the answer in $id', lesson => {
    const { blocks, question, answer } = parseLessonExample(lesson.example)
    const tables = blocks.filter(block => block.kind === 'table')
    const originalLines = lesson.example.split('\n')
    const tableLines = tables.flatMap(table => [table.columns, ...table.rows])

    expect(tables.length).toBeGreaterThan(0)
    expect(tableLines.map(cells => cells.join(' | '))).toEqual(
      originalLines.filter(line => line.includes(' | ') && !line.startsWith('The row ')),
    )
    expect(question).toBe(originalLines.find(line => line.startsWith('Check: '))?.slice(7))
    expect(answer).toBe(originalLines.find(line => line.startsWith('Answer: '))?.slice(8))
    expect(blocks.some(block => block.kind === 'text' && /Check:|Answer:/.test(block.text))).toBe(false)
    for (const table of tables) {
      expect(table.rows.every(row => row.length === table.columns.length)).toBe(true)
    }
  })

  it('keeps prose containing pipe characters as text', () => {
    const records = lessons.find(lesson => lesson.id === 'records')!
    const { blocks } = parseLessonExample(records.example)
    expect(blocks).toContainEqual({
      kind: 'text',
      text: 'The row 102 | Kojo Owusu | JHS 1B is one record. It tells you that student 102 is Kojo Owusu, in JHS 1B. This table contains two student records.',
    })
  })
})
