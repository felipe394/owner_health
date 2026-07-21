const knex = require('knex');
const db = knex({
  client: 'mysql2',
  connection: { host: 'br1104.hostgator.com.br', port: 3306, user: 'conn0686_ownerhealth', password: 'ConnectorTech@2280@', database: 'conn0686_ownerhealth' }
});

(async () => {
  try {
    const isoDate = new Date().toISOString();
    console.log("Tentando ISO date:", isoDate);
    try {
      await db('medicamentos').insert({
        cliente_id: 1,
        nome: 'Teste ISO',
        criado_em: isoDate
      });
      console.log("ISO Date funcionou!");
    } catch(e) {
      console.error("ERRO COM ISO DATE:", e.message);
    }

    const mysqlDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.log("\nTentando MySQL Datetime:", mysqlDate);
    const [id] = await db('medicamentos').insert({
      cliente_id: 1,
      nome: 'Teste MySQL Datetime',
      criado_em: mysqlDate
    });
    console.log("✔ SUCESSO com MySQL Datetime! ID:", id);
  } catch(e) {
    console.error("ERRO FINAL:", e.message);
  } finally {
    process.exit();
  }
})();
