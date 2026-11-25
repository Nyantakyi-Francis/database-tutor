export type ExampleBlock =
  | { kind: 'text'; text: string }
  | { kind: 'table'; caption: string; columns: string[]; rows: string[][] }

/** Presents the accepted draft format without changing its wording or shared Lesson type. */
export function parseLessonExample(example: string) {
  const lines = example.split('\n')
  const checkIndex = lines.findIndex(line => line.startsWith('Check: '))
  const answerIndex = lines.findIndex(line => line.startsWith('Answer: '))
  const exampleText = lines.slice(0, checkIndex).join('\n')
    .replace(/^Fictional school example:\s*/, '').trim()

  const blocks: ExampleBlock[] = exampleText.split(/\n\s*\n/).map(paragraph => {
    const blockLines = paragraph.split('\n')
    const headerIndex = blockLines.findIndex((line, index) =>
      line.includes(' | ') && blockLines[index + 1]?.includes(' | '))

    if (headerIndex < 0) return { kind: 'text', text: paragraph }

    const cells = (line: string) => line.split('|').map(cell => cell.trim())
    return {
      kind: 'table',
      caption: blockLines.slice(0, headerIndex).join(' ') || 'School records',
      columns: cells(blockLines[headerIndex]),
      rows: blockLines.slice(headerIndex + 1).map(cells),
    }
  })

  return {
    blocks,
    question: lines.slice(checkIndex, answerIndex).join(' ').replace(/^Check: /, '').trim(),
    answer: lines.slice(answerIndex).join(' ').replace(/^Answer: /, '').trim(),
  }
}
