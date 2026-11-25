import initSqlJs from 'sql.js'
import type { Database, SqlJsStatic } from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
import type { SQLQueryResult } from '../shared/types'
import { schoolSchema } from './schoolData'

// Owner: Efehi Nehikhare. Vite emits the real installed WASM asset.
let runtime: Promise<SqlJsStatic> | undefined

/**
 * Loads sql.js once per page. sql.js caches its first initSqlJs() promise,
 * including a rejected one, so a failed load cannot be retried in place;
 * reloading the page is the retry (see the Reload button on SQL Practice).
 */
export function loadSqlRuntime(): Promise<SqlJsStatic> {
  runtime ??= initSqlJs({ locateFile: () => wasmUrl })
  return runtime
}

/** Each visit or reset gets a fresh database, separate from saved progress. */
export function createSchoolDatabase(SQL: SqlJsStatic): Database {
  const database = new SQL.Database()
  try {
    database.run(schoolSchema)
    return database
  } catch (error) {
    database.close()
    throw error
  }
}

/** Show the last statement's result, including headings when it has no rows. */
export function executeQuery(database: Database, query: string): SQLQueryResult {
  if (!query.trim()) {
    return { columns: [], rows: [], error: 'Enter an SQL query before running it.' }
  }

  try {
    let result: SQLQueryResult = { columns: [], rows: [] }
    for (const statement of database.iterateStatements(query)) {
      result = { columns: statement.getColumnNames(), rows: [] }
      while (statement.step()) result.rows.push(statement.get())
    }
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { columns: [], rows: [], error: `SQL could not run: ${message}` }
  }
}
