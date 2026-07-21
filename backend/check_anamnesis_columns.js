const knex = require('knex');
const db = knex({
  client: 'mysql2',
  connection: { host: 'br1104.hostgator.com.br', port: 3306, user: 'conn0686_ownerhealth', password: 'ConnectorTech@2280@', database: 'conn0686_ownerhealth' }
});
(async () => {
  try {
    const cols = await db.raw("SHOW COLUMNS FROM anamnesis_templates");
    console.log("anamnesis_templates columns:", cols[0].map(c => c.Field));
    const req_cols = await db.raw("SHOW COLUMNS FROM patient_anamnesis_requests");
    console.log("patient_anamnesis_requests columns:", req_cols[0].map(c => c.Field));
  } catch(e) { console.error(e.message); } finally { process.exit(); }
})();
