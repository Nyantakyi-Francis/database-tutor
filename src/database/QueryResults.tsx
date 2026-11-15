import type { SQLQueryResult } from '../shared/types'

export default function QueryResults({ result, caption = 'Query results' }: {
  result: SQLQueryResult | null
  caption?: string
}) {
  if (!result) return <p>Query results will appear here.</p>
  if (result.error) return <p role="alert">{result.error}</p>
  if (result.columns.length === 0) return <p>The statement completed without returning rows.</p>
  return <div className="table-scroll"><table>
    <caption>{caption}</caption>
    <thead><tr>{result.columns.map((column, index) => <th scope="col" key={index}>{column}</th>)}</tr></thead>
    <tbody>{result.rows.length === 0
      ? <tr><td colSpan={result.columns.length}>The query returned no rows.</td></tr>
      : result.rows.map((row, index) => <tr key={index}>
      {row.map((value, cell) => <td key={cell}>{value === null ? 'NULL' : String(value)}</td>)}
    </tr>)}</tbody>
  </table></div>
}
