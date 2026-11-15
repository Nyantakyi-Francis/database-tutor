import type { Quiz } from '../shared/types'

// Owner: Victor Talabi. Add three quizzes with four questions each.
export const quizzes: Quiz[] = []

// Sprint 1 draft coverage for review. These IDs are proposed, not team-approved.
// Full questions, answer options, explanations, and scoring come in Sprint 3.
export const quizCoverage = [
  {
    id: 'database-basics',
    title: 'Tables, records, and fields',
    questions: [
      { id: 'table-purpose', objective: 'Choose the correct table for student or subject information.' },
      { id: 'record-count', objective: 'Count records without counting the heading row.' },
      { id: 'read-record', objective: 'Read a student name and class from the same record.' },
      { id: 'field-value', objective: 'Distinguish a field name from its value in a record.' },
    ],
  },
  {
    id: 'keys-and-relationships',
    title: 'Keys and relationships',
    questions: [
      { id: 'primary-key', objective: 'Identify student_id as the unique key when students share a name.' },
      { id: 'foreign-key', objective: 'Follow Scores.student_id to a Students record.' },
      { id: 'missing-reference', objective: 'Recognise why a score cannot reference a missing student.' },
      { id: 'one-to-many', objective: 'Explain why one student record can connect to several scores.' },
    ],
  },
  {
    id: 'basic-sql',
    title: 'SELECT, WHERE, and ORDER BY',
    questions: [
      { id: 'select-columns', objective: 'Choose SELECT columns to retrieve student names and classes.' },
      { id: 'where-class', objective: 'Use WHERE to select students in a named class.' },
      { id: 'where-score', objective: 'Predict which score records match a numeric WHERE condition.' },
      { id: 'order-by', objective: 'Predict row order with ORDER BY in ascending or descending order.' },
    ],
  },
]
