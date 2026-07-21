require('dotenv').config();
const knex = require('knex');
const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'br1104.hostgator.com.br',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'conn0686_ownerhealth',
    password: process.env.DB_PASS || 'ConnectorTech@2280@',
    database: process.env.DB_NAME || 'conn0686_ownerhealth',
  }
});

async function run() {
  try {
    const q = await db('patient_anamnesis_questions').select('id', 'texto', 'parent_option_id').limit(10);
    console.log("QUESTIONS: ", JSON.stringify(q, null, 2));
    const opts = await db('patient_anamnesis_options').select('id', 'texto', 'question_id').limit(10);
    console.log("OPTIONS: ", JSON.stringify(opts, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
