import initSqlJs from 'sql.js'
import type { SqlJsStatic } from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

// Owner: Efehi Nehikhare. Vite emits the real installed WASM asset.
let runtime: Promise<SqlJsStatic> | undefined

export function loadSqlRuntime(): Promise<SqlJsStatic> {
  runtime ??= initSqlJs({ locateFile: () => wasmUrl }).catch((error: unknown) => {
    runtime = undefined
    throw error
  })
  return runtime
}
// Database population, query execution, and reset belong to the next sprint.
