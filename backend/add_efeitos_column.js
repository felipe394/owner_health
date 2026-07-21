const knex = require('knex');
const db = knex({
  client: 'mysql2',
  connection: { host: 'br1104.hostgator.com.br', port: 3306, user: 'conn0686_ownerhealth', password: 'ConnectorTech@2280@', database: 'conn0686_ownerhealth' }
});

(async () => {
  try {
    const hasColumn = await db.schema.hasColumn('medicamentos', 'efeitos');
    if (!hasColumn) {
      await db.schema.table('medicamentos', table => {
        table.text('efeitos').nullable();
      });
      console.log("✔ Coluna 'efeitos' adicionada na tabela 'medicamentos' com sucesso!");
    } else {
      console.log("✔ Coluna 'efeitos' já existe na tabela 'medicamentos'.");
    }
  } catch (err) {
    console.error("ERRO:", err.message);
  } finally {
    process.exit();
  }
})();
