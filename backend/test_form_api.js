const knex = require('knex');
const db = knex({
  client: 'mysql2',
  connection: { host: 'br1104.hostgator.com.br', port: 3306, user: 'conn0686_ownerhealth', password: 'ConnectorTech@2280@', database: 'conn0686_ownerhealth' }
});
(async () => {
  try {
    const reqs = await db('patient_anamnesis_requests').select('*');
    console.log("REQUESTS:", JSON.stringify(reqs, null, 2));

    if (reqs.length > 0) {
      const req = reqs[0];
      const secs = await db('patient_anamnesis_sections').where({ request_id: req.id }).select('*');
      console.log("SECTIONS for request", req.id, ":", JSON.stringify(secs, null, 2));
      
      for (const s of secs) {
        const qs = await db('patient_anamnesis_questions').where({ section_id: s.id }).select('*');
        console.log("QUESTIONS for section", s.id, ":", JSON.stringify(qs, null, 2));
      }
    }
  } catch(e) { console.error(e.message); } finally { process.exit(); }
})();
