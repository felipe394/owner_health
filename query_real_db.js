const knex = require('knex');
const db = knex({
  client: 'mysql2',
  connection: {
    host: 'br1104.hostgator.com.br',
    port: 3306,
    user: 'conn0686_ownerhealth',
    password: 'ConnectorTech@2280@',
    database: 'conn0686_ownerhealth'
  }
});

(async () => {
  try {
    const reqs = await db('patient_anamnesis_requests').select('*');
    console.log("REQUESTS: ", reqs);
    const secs = await db('patient_anamnesis_sections').select('*');
    console.log("SECTIONS: ", secs);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
})();
