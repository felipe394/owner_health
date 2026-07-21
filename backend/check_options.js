const knex = require('knex');
const db = knex({
  client: 'mysql2',
  connection: { host: 'br1104.hostgator.com.br', port: 3306, user: 'conn0686_ownerhealth', password: 'ConnectorTech@2280@', database: 'conn0686_ownerhealth' }
});
(async () => {
  try {
    // Pergunta A tem parent_option_id=2, o option id=2 pertence a qual pergunta?
    const q2 = await db('patient_anamnesis_questions').where({ id: 2 }).first();
    console.log("Pergunta A:", q2);
    const parentOpt = await db('patient_anamnesis_options').where({ id: q2.parent_option_id }).first();
    console.log("Parent option:", parentOpt);
    if (parentOpt) {
      const parentQ = await db('patient_anamnesis_questions').where({ id: parentOpt.question_id }).first();
      console.log("Parent question:", parentQ);
    }
    // All options for question 3 (Há quanto tempo...)
    const q3 = await db('patient_anamnesis_questions').where({ id: 3 }).first();
    console.log("Há quanto tempo q:", q3);
    const opts3 = await db('patient_anamnesis_options').where({ question_id: 3 }).select();
    console.log("Options of q3:", opts3);
  } catch(e) { console.error(e.message); } finally { process.exit(); }
})();
