const knex = require('knex');
const db = knex({
  client: 'mysql2',
  connection: { host: 'br1104.hostgator.com.br', port: 3306, user: 'conn0686_ownerhealth', password: 'ConnectorTech@2280@', database: 'conn0686_ownerhealth' }
});

(async () => {
  try {
    const [id] = await db('empresa_documentos_emitidos').insert({
      empresa_id: 1,
      profissional_id: 1,
      paciente_cpf: '65677898727',
      tipo: 'receita',
      conteudo: 'Teste de receita gravada no MySQL',
      assinado_digitalmente: 1,
      criado_em: new Date().toISOString()
    });
    console.log("✔ SUCESSO! Documento gravado no MySQL com ID:", id);

    const docs = await db('empresa_documentos_emitidos').where({ id }).select('*');
    console.log("DOCUMENTO LIDO DO MYSQL:", docs);
  } catch(e) {
    console.error("ERRO:", e.message);
  } finally {
    process.exit();
  }
})();
