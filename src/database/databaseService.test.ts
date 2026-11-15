import initSqlJs from 'sql.js'
import type { Database, SqlJsStatic } from 'sql.js'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createSchoolDatabase, executeQuery } from './databaseService'
import { sampleQuery, sampleQueryResult } from './schoolData'

let SQL: SqlJsStatic
let database: Database

beforeAll(async () => {
  SQL = await initSqlJs({
    locateFile: () => new URL('../../node_modules/sql.js/dist/sql-wasm.wasm', import.meta.url).href,
  })
})
beforeEach(() => { database = createSchoolDatabase(SQL) })
afterEach(() => { database.close() })

describe('fictional school database', () => {
  it('returns the expected starter rows using the real SQLite runtime', () => {
    expect(executeQuery(database, sampleQuery)).toEqual(sampleQueryResult)
  })

  it('connects the sample scores to the correct students and subjects', () => {
    expect(executeQuery(database, `
      SELECT Students.student_name, Subjects.subject_name, Scores.score
      FROM Scores
      JOIN Students ON Students.student_id = Scores.student_id
      JOIN Subjects ON Subjects.subject_id = Scores.subject_id
      ORDER BY Scores.score_id;
    `).rows).toEqual([
      ['Ama Mensah', 'Mathematics', 78],
      ['Ama Mensah', 'ICT', 84],
      ['Kojo Owusu', 'Mathematics', 65],
    ])
  })

  it.each([
    ['a repeated primary key', "INSERT INTO Students VALUES (101, 'Other student', 'JHS 1A');"],
    ['a missing name', "INSERT INTO Students VALUES (103, NULL, 'JHS 1A');"],
    ['a missing student', 'INSERT INTO Scores VALUES (1004, 999, 1, 50);'],
    ['a missing subject', 'INSERT INTO Scores VALUES (1004, 101, 999, 50);'],
    ['a score above 100', 'INSERT INTO Scores VALUES (1004, 101, 1, 101);'],
    ['a negative score', 'INSERT INTO Scores VALUES (1004, 101, 1, -1);'],
  ])('rejects %s', (_description, query) => {
    expect(executeQuery(database, query)).toEqual({
      columns: [], rows: [], error: expect.stringContaining('SQL could not run:'),
    })
  })

  it('recreates original data after edits without affecting another database', () => {
    const fresh = createSchoolDatabase(SQL)
    try {
      executeQuery(database, 'DELETE FROM Scores; DELETE FROM Students;')
      expect(executeQuery(database, sampleQuery).rows).toEqual([])
      expect(executeQuery(fresh, sampleQuery)).toEqual(sampleQueryResult)
    } finally {
      fresh.close()
    }
  })
})

describe('query results', () => {
  it('keeps the column headings when a SELECT matches no rows', () => {
    expect(executeQuery(database, 'SELECT student_name FROM Students WHERE student_id = 999;'))
      .toEqual({ columns: ['student_name'], rows: [] })
  })

  it('reports invalid SQL and can run another query afterwards', () => {
    expect(executeQuery(database, 'SELECT missing_column FROM Students;')).toEqual({
      columns: [], rows: [], error: expect.stringContaining('missing_column'),
    })
    expect(executeQuery(database, sampleQuery)).toEqual(sampleQueryResult)
  })

  it('rejects blank input', () => {
    expect(executeQuery(database, ' \n ')).toEqual({
      columns: [], rows: [], error: 'Enter an SQL query before running it.',
    })
  })

  it('returns the last result when several statements are entered', () => {
    expect(executeQuery(database, 'SELECT 1; SELECT NULL AS missing, 2 AS value;'))
      .toEqual({ columns: ['missing', 'value'], rows: [[null, 2]] })
  })

  it('executes an update without presenting it as a SELECT result', () => {
    expect(executeQuery(database, 'UPDATE Scores SET score = 80 WHERE score_id = 1001;'))
      .toEqual({ columns: [], rows: [] })
    expect(executeQuery(database, 'SELECT score FROM Scores WHERE score_id = 1001;').rows)
      .toEqual([[80]])
  })
})
