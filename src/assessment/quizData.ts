import type { Quiz } from '../shared/types'

// Owner: Victor Talabi. Three quizzes with four questions each.
// Quiz and question IDs are stable keys: saved quiz results refer to quiz IDs.
// All names and scores are the fictional teaching data used in the lessons.
export const quizzes: Quiz[] = [
  {
    id: 'database-basics',
    title: 'Tables, records, and fields',
    questions: [
      {
        id: 'table-purpose',
        prompt: 'You want to store subject names such as Mathematics and ICT. Which table should hold them?',
        options: [
          { id: 'a', text: 'Students' },
          { id: 'b', text: 'Subjects' },
          { id: 'c', text: 'Scores' },
          { id: 'd', text: 'Any table, because all tables hold the same information' },
        ],
        correctOptionId: 'b',
        explanation: 'Each table holds one kind of thing. Subjects holds information about subjects, so subject names belong there.',
      },
      {
        id: 'record-count',
        prompt: 'A Students table has a heading row and four student rows below it. How many student records does it contain?',
        options: [
          { id: 'a', text: '5' },
          { id: 'b', text: '3' },
          { id: 'c', text: '4' },
          { id: 'd', text: '1' },
        ],
        correctOptionId: 'c',
        explanation: 'Each row below the headings is one record. The heading row only names the fields, so there are four records.',
      },
      {
        id: 'read-record',
        prompt: 'The Students table contains the record 102 | Kojo Owusu | JHS 1B. Which class is Kojo Owusu in?',
        options: [
          { id: 'a', text: 'JHS 1B' },
          { id: 'b', text: 'JHS 1A' },
          { id: 'c', text: '102' },
          { id: 'd', text: 'Mathematics' },
        ],
        correctOptionId: 'a',
        explanation: 'Read across one row to keep the details of one student together. Kojo\'s row gives his class as JHS 1B.',
      },
      {
        id: 'field-value',
        prompt: 'In Ama Mensah\'s record, the class is JHS 1A. Which of these is the field name, not the value?',
        options: [
          { id: 'a', text: 'JHS 1A' },
          { id: 'b', text: 'Ama Mensah' },
          { id: 'c', text: '101' },
          { id: 'd', text: 'class_name' },
        ],
        correctOptionId: 'd',
        explanation: 'class_name is the field name shown in the column heading. JHS 1A is the value of that field in Ama\'s record.',
      },
    ],
  },
  {
    id: 'keys-and-relationships',
    title: 'Keys and relationships',
    questions: [
      {
        id: 'primary-key',
        prompt: 'Two students are both named Ama Mensah. Which field tells their records apart?',
        options: [
          { id: 'a', text: 'student_name' },
          { id: 'b', text: 'student_id' },
          { id: 'c', text: 'class_name' },
          { id: 'd', text: 'score' },
        ],
        correctOptionId: 'b',
        explanation: 'student_id is the primary key. Each value is unique, so 101 and 103 identify different students even when their names match.',
      },
      {
        id: 'foreign-key',
        prompt: 'A Scores record has student_id 102. Where do you look to find whose score it is?',
        options: [
          { id: 'a', text: 'The Subjects record with subject_id 102' },
          { id: 'b', text: 'The Scores record with score_id 102' },
          { id: 'c', text: 'The Students record with student_id 102' },
          { id: 'd', text: 'The class_name field in Scores' },
        ],
        correctOptionId: 'c',
        explanation: 'student_id in Scores is a foreign key. It refers to the Students record with the same student_id, which is Kojo Owusu.',
      },
      {
        id: 'missing-reference',
        prompt: 'Students contains only student IDs 101 and 102. Why is a score with student_id 999 a problem?',
        options: [
          { id: 'a', text: 'It refers to a student who does not exist in Students' },
          { id: 'b', text: 'Student IDs must be smaller than 200' },
          { id: 'c', text: 'Scores records cannot contain IDs' },
          { id: 'd', text: 'It is not a problem; any number is allowed' },
        ],
        correctOptionId: 'a',
        explanation: 'A foreign key must match a record in the related table. No student has ID 999, so nobody owns that score.',
      },
      {
        id: 'one-to-many',
        prompt: 'Ama Mensah has a Mathematics score and an ICT score. How many Students records does she need?',
        options: [
          { id: 'a', text: 'Two, one for each score' },
          { id: 'b', text: 'None, because scores hold her name' },
          { id: 'c', text: 'Three' },
          { id: 'd', text: 'One, because both scores refer to student_id 101' },
        ],
        correctOptionId: 'd',
        explanation: 'This is a one-to-many relationship. One student record connects to many score records through the same student_id.',
      },
    ],
  },
  {
    id: 'basic-sql',
    title: 'SELECT, WHERE, and ORDER BY',
    questions: [
      {
        id: 'select-columns',
        prompt: 'Which query shows only the student names and classes?',
        options: [
          { id: 'a', text: 'SELECT * FROM Students;' },
          { id: 'b', text: 'SELECT student_name, class_name FROM Students;' },
          { id: 'c', text: 'SELECT Students FROM student_name, class_name;' },
          { id: 'd', text: 'SELECT student_name FROM Subjects;' },
        ],
        correctOptionId: 'b',
        explanation: 'List the fields you want after SELECT and the table after FROM. SELECT * would show every field, including student_id.',
      },
      {
        id: 'where-class',
        prompt: 'Which query finds the students in class JHS 1B?',
        options: [
          { id: 'a', text: 'SELECT student_name FROM Students WHERE class_name = JHS 1B;' },
          { id: 'b', text: 'SELECT student_name FROM Students ORDER BY class_name;' },
          { id: 'c', text: 'SELECT student_name FROM Students WHERE class_name = \'JHS 1B\';' },
          { id: 'd', text: 'SELECT student_name FROM Students WHERE student_name = \'JHS 1B\';' },
        ],
        correctOptionId: 'c',
        explanation: 'WHERE keeps only matching rows. Text values need single quotes, and the condition must use the class_name field.',
      },
      {
        id: 'where-score',
        prompt: 'The Scores table holds the scores 78, 84, and 65. Which scores does WHERE score > 70 return?',
        options: [
          { id: 'a', text: '78 and 84' },
          { id: 'b', text: '65 only' },
          { id: 'c', text: '78, 84, and 65' },
          { id: 'd', text: '84 only' },
        ],
        correctOptionId: 'a',
        explanation: 'The > symbol means "greater than". 78 and 84 are greater than 70; 65 is not.',
      },
      {
        id: 'order-by',
        prompt: 'In what order does SELECT score FROM Scores ORDER BY score DESC; return the scores 78, 84, and 65?',
        options: [
          { id: 'a', text: '65, 78, 84' },
          { id: 'b', text: '78, 84, 65' },
          { id: 'c', text: '84 only' },
          { id: 'd', text: '84, 78, 65' },
        ],
        correctOptionId: 'd',
        explanation: 'DESC sorts from largest to smallest. Without DESC, ORDER BY sorts from smallest to largest.',
      },
    ],
  },
]
