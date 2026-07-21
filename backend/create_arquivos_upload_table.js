const knex = require('knex');
const db = knex({
  client: 'mysql2',
  connection: { host: 'br1104.hostgator.com.br', port: 3306, user: 'conn0686_ownerhealth', password: 'ConnectorTech@2280@', database: 'conn0686_ownerhealth' }
});

(async () => {
  try {
    const exists = await db.schema.hasTable('arquivos_upload');
    if (!exists) {
      await db.schema.createTable('arquivos_upload', table => {
        table.increments('id').primary();
        table.string('filename', 255);
        table.string('original_name', 255);
        table.string('mimetype', 100);
        table.integer('size');
        table.string('url', 500);
        table.text('texto_extraido').nullable();
        table.datetime('criado_em');
      });
      console.log("✔ Tabela 'arquivos_upload' criada com sucesso no MySQL!");
    } else {
      console.log("✔ Tabela 'arquivos_upload' já existe no MySQL.");
    }
  } catch (err) {
    console.error("ERRO:", err.message);
  } finally {
    process.exit();
  }
})();
