const knex = require('knex');
const db = knex({
  client: 'mysql2',
  connection: { host: 'br1104.hostgator.com.br', port: 3306, user: 'conn0686_ownerhealth', password: 'ConnectorTech@2280@', database: 'conn0686_ownerhealth' }
});
(async () => {
  try {
    const tables = await db.raw("SHOW TABLES");
    console.log("EXISTING MYSQL TABLES:", tables[0].map(t => Object.values(t)[0]));
  } catch(e) { console.error(e.message); } finally { process.exit(); }
})();
