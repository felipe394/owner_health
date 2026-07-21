const knex = require('knex');
const db = knex({
  client: 'mysql2',
  connection: { host: 'br1104.hostgator.com.br', port: 3306, user: 'conn0686_ownerhealth', password: 'ConnectorTech@2280@', database: 'conn0686_ownerhealth' }
});

(async () => {
  try {
    console.log("=== INSPECIONANDO COLUNAS DA TABELA 'medicamentos' ===");
    const columns = await db.raw("SHOW COLUMNS FROM medicamentos");
    console.log(columns[0]);

    console.log("\n=== TENTANDO INSERIR DIPIRONA 500MG ===");
    const mysqlDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const novo = {
      cliente_id: 1,
      nome: 'Dipirona 500mg',
      posologia: 'Nada',
      horarios: JSON.stringify(['08:00']),
      data_inicio: '2026-07-21',
      data_fim: '2026-07-23',
      observacoes: 'Nada',
      email_lembrete: null,
      efeitos: 'Nada',
      ativo: 1,
      criado_em: mysqlDate
    };

    const [id] = await db('medicamentos').insert(novo);
    console.log("✔ INSERIDO COM SUCESSO! ID:", id);

    console.log("\n=== VERIFICANDO SE FOI GRAVADO DE FATO NO MYSQL ===");
    const row = await db('medicamentos').where({ id }).first();
    console.log("REGISTRO GRAVADO:", row);
  } catch(e) {
    console.error("❌ ERRO AO INSERIR:", e.message);
  } finally {
    process.exit();
  }
})();
