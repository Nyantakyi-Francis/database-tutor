import type { SQLQueryResult } from '../shared/types'

export default function QueryResults({ result }: { result: SQLQueryResult | null }) {
  if (!result) return <p>Query results will appear here.</p>
  if (result.error) return <p role="alert">{result.error}</p>
  if (result.rows.length === 0) return <p>The query returned no rows.</p>
  return <div className="table-scroll"><table>
    <caption>Query results</caption>
    <thead><tr>{result.columns.map((column, index) => <th scope="col" key={index}>{column}</th>)}</tr></thead>
    <tbody>{result.rows.map((row, index) => <tr key={index}>
      {row.map((value, cell) => <td key={cell}>{value === null ? 'NULL' : String(value)}</td>)}
    </tr>)}</tbody>
  </table></div>
}
