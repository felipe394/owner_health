require('dotenv').config();
const db = require('./knexfile');

async function run() {
  const tables = await db.raw("SHOW TABLES;");
  console.log(tables[0]);
  process.exit(0);
}
run();
