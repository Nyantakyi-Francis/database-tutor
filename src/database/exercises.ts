import type { SQLExercise } from '../shared/types'

// Owner: Efehi Nehikhare. IDs are stable keys; change titles freely, not IDs.
// Each starter query runs but needs one change to produce the expected result.
// Expected results come from schoolSchema in schoolData.ts and are checked in exercises.test.ts.
export const exercises: SQLExercise[] = [
  {
    id: 'select-all-students',
    title: 'Show every student record',
    topic: 'SELECT',
    instructions: 'The starter query shows only student names. Change it to show every field in the Students table: student_id, student_name, and class_name.',
    starterQuery: `SELECT student_name
FROM Students;`,
    referenceQuery: `SELECT *
FROM Students;`,
    expectedResult: {
      columns: ['student_id', 'student_name', 'class_name'],
      rows: [
        [101, 'Ama Mensah', 'JHS 1A'],
        [102, 'Kojo Owusu', 'JHS 1B'],
      ],
    },
    hint: 'An asterisk (*) after SELECT means "every field". You can also list the field names, separated by commas.',
  },
  {
    id: 'select-subject-names',
    title: 'List the subject names',
    topic: 'SELECT',
    instructions: 'The starter query shows every field in the Subjects table. Change it so the result shows only the subject_name field.',
    starterQuery: `SELECT *
FROM Subjects;`,
    referenceQuery: `SELECT subject_name
FROM Subjects;`,
    expectedResult: {
      columns: ['subject_name'],
      rows: [['Mathematics'], ['ICT']],
    },
    hint: 'Replace the asterisk with the name of the one field you want to see.',
  },
  {
    id: 'where-class-jhs-1b',
    title: 'Find the students in JHS 1B',
    topic: 'WHERE',
    instructions: 'The starter query lists every student. Add a WHERE clause so only students whose class_name is JHS 1B appear.',
    starterQuery: `SELECT student_name, class_name
FROM Students;`,
    referenceQuery: `SELECT student_name, class_name
FROM Students
WHERE class_name = 'JHS 1B';`,
    expectedResult: {
      columns: ['student_name', 'class_name'],
      rows: [['Kojo Owusu', 'JHS 1B']],
    },
    hint: "Text values go inside single quotes: WHERE class_name = 'JHS 1B'.",
  },
  {
    id: 'where-score-above-70',
    title: 'Find scores above 70',
    topic: 'WHERE',
    instructions: 'The starter query lists every score. Add a WHERE clause so only scores greater than 70 appear.',
    starterQuery: `SELECT student_id, subject_id, score
FROM Scores;`,
    referenceQuery: `SELECT student_id, subject_id, score
FROM Scores
WHERE score > 70;`,
    expectedResult: {
      columns: ['student_id', 'subject_id', 'score'],
      rows: [
        [101, 1, 78],
        [101, 2, 84],
      ],
    },
    hint: 'Numbers do not need quotes. Use the > symbol to mean "greater than".',
  },
  {
    id: 'order-subjects-by-name',
    title: 'Sort subjects alphabetically',
    topic: 'ORDER BY',
    instructions: 'The starter query lists subjects in the order they were added. Add ORDER BY so the subject names appear in alphabetical order.',
    starterQuery: `SELECT subject_id, subject_name
FROM Subjects;`,
    referenceQuery: `SELECT subject_id, subject_name
FROM Subjects
ORDER BY subject_name;`,
    expectedResult: {
      columns: ['subject_id', 'subject_name'],
      rows: [
        [2, 'ICT'],
        [1, 'Mathematics'],
      ],
    },
    hint: 'ORDER BY goes after FROM. It sorts from A to Z unless you say otherwise.',
  },
  {
    id: 'order-scores-highest-first',
    title: 'Sort scores from highest to lowest',
    topic: 'ORDER BY',
    instructions: 'The starter query lists every score. Add ORDER BY so the highest score appears first.',
    starterQuery: `SELECT score_id, student_id, score
FROM Scores;`,
    referenceQuery: `SELECT score_id, student_id, score
FROM Scores
ORDER BY score DESC;`,
    expectedResult: {
      columns: ['score_id', 'student_id', 'score'],
      rows: [
        [1002, 101, 84],
        [1001, 101, 78],
        [1003, 102, 65],
      ],
    },
    hint: 'Add DESC after the field name to sort from largest to smallest.',
  },
]
