const knex = require('knex');
const db = knex({
  client: 'mysql2',
  connection: { host: 'br1104.hostgator.com.br', port: 3306, user: 'conn0686_ownerhealth', password: 'ConnectorTech@2280@', database: 'conn0686_ownerhealth' }
});
(async () => {
  try {
    const clients = await db('clientes').select('id', 'nome', 'cpf');
    console.log("CLIENTES:", clients);
    const rels = await db('cliente_empresas').select('*');
    console.log("CLIENTE_EMPRESAS:", rels);
  } catch(e) { console.error(e.message); } finally { process.exit(); }
})();
