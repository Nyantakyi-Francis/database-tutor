import type { SQLQueryResult } from '../shared/types'

// Fictional records match the examples in the six lesson drafts.
export const schoolSchema = `
PRAGMA foreign_keys = ON;

CREATE TABLE Students (
  student_id INTEGER PRIMARY KEY,
  student_name TEXT NOT NULL,
  class_name TEXT NOT NULL
);

CREATE TABLE Subjects (
  subject_id INTEGER PRIMARY KEY,
  subject_name TEXT NOT NULL
);

CREATE TABLE Scores (
  score_id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES Students(student_id),
  subject_id INTEGER NOT NULL REFERENCES Subjects(subject_id),
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100)
);

INSERT INTO Students (student_id, student_name, class_name) VALUES
  (101, 'Ama Mensah', 'JHS 1A'),
  (102, 'Kojo Owusu', 'JHS 1B');

INSERT INTO Subjects (subject_id, subject_name) VALUES
  (1, 'Mathematics'),
  (2, 'ICT');

INSERT INTO Scores (score_id, student_id, subject_id, score) VALUES
  (1001, 101, 1, 78),
  (1002, 101, 2, 84),
  (1003, 102, 1, 65);
`

export const sampleQuery = `SELECT student_id, student_name, class_name
FROM Students
ORDER BY student_id;`

export const sampleQueryResult: SQLQueryResult = {
  columns: ['student_id', 'student_name', 'class_name'],
  rows: [
    [101, 'Ama Mensah', 'JHS 1A'],
    [102, 'Kojo Owusu', 'JHS 1B'],
  ],
}
