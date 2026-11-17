import initSqlJs from 'sql.js'
import type { Database, SqlJsStatic } from 'sql.js'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createSchoolDatabase, executeQuery } from './databaseService'
import { exercises } from './exercises'

let SQL: SqlJsStatic
let database: Database

beforeAll(async () => {
  SQL = await initSqlJs({
    locateFile: () => new URL('../../node_modules/sql.js/dist/sql-wasm.wasm', import.meta.url).href,
  })
})
beforeEach(() => { database = createSchoolDatabase(SQL) })
afterEach(() => { database.close() })

describe('guided SQL exercises (C2)', () => {
  it('has two SELECT, two WHERE, and two ORDER BY exercises', () => {
    const topics = exercises.map(exercise => exercise.topic)
    expect(topics.filter(topic => topic === 'SELECT')).toHaveLength(2)
    expect(topics.filter(topic => topic === 'WHERE')).toHaveLength(2)
    expect(topics.filter(topic => topic === 'ORDER BY')).toHaveLength(2)
    expect(exercises).toHaveLength(6)
  })

  it('uses unique IDs and fills every text field', () => {
    expect(new Set(exercises.map(exercise => exercise.id)).size).toBe(exercises.length)
    for (const exercise of exercises) {
      for (const field of [exercise.title, exercise.instructions, exercise.starterQuery, exercise.referenceQuery, exercise.hint]) {
        expect(field?.trim()).toBeTruthy()
      }
    }
  })

  it.each(exercises.map(exercise => [exercise.id, exercise] as const))(
    '%s: reference query returns the expected result',
    (_id, exercise) => {
      expect(executeQuery(database, exercise.referenceQuery)).toEqual(exercise.expectedResult)
    },
  )

  it.each(exercises.map(exercise => [exercise.id, exercise] as const))(
    '%s: starter query runs but does not already match',
    (_id, exercise) => {
      const result = executeQuery(database, exercise.starterQuery)
      expect(result.error).toBeUndefined()
      expect(result).not.toEqual(exercise.expectedResult)
    },
  )
})
