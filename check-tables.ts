import { getDb } from './api/queries/connection';
async function main() {
  const db = getDb();
  const result = await db.execute('SHOW TABLES');
  console.log(JSON.stringify(result, null, 2));
}
main().catch(console.error);
