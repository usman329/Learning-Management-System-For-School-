import mysql from 'mysql2/promise';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
const url = dbUrlMatch[1].trim();

const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
const [, user, password, host, port, database] = match;

const conn = await mysql.createConnection({
  host, port: parseInt(port), user, password, database,
  ssl: { rejectUnauthorized: false }
});

const [rows] = await conn.execute('SHOW TABLES');
const tables = rows.map(r => Object.values(r)[0]);
console.log('Existing tables:', tables);

if (tables.length === 0) {
  console.log('No tables to drop.');
  await conn.end();
  process.exit(0);
}

// Drop in reverse dependency order
const toDrop = [
  'book_issues', 'library_books', 'messages', 'announcements', 'fees',
  'timetable', 'results', 'exams', 'assignment_submissions', 'assignments',
  'attendance', 'class_subjects', 'parents', 'students', 'teachers',
  'subjects', 'classes', 'admissions', 'users', '__drizzle_migrations'
];

for (const table of toDrop) {
  if (tables.includes(table)) {
    try {
      await conn.execute(`DROP TABLE IF EXISTS \`${table}\``);
      console.log(`Dropped: ${table}`);
    } catch (e) {
      console.log(`Error dropping ${table}: ${e.message}`);
    }
  }
}

await conn.end();
console.log('Done!');
