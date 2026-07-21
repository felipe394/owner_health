const knex = require('knex');
const db = knex({
  client: 'mysql2',
  connection: { host: 'br1104.hostgator.com.br', port: 3306, user: 'conn0686_ownerhealth', password: 'ConnectorTech@2280@', database: 'conn0686_ownerhealth' }
});

(async () => {
  try {
    const novo = {
      cliente_id: 1,
      nome: 'Teste Medicamento',
      posologia: '1 comp ao dia',
      horarios: JSON.stringify(['08:00']),
      data_inicio: '2026-07-21',
      data_fim: null,
      observacoes: 'Teste obs',
      email_lembrete: null,
      efeitos: 'Sonolência',
      ativo: 1,
      criado_em: new Date().toISOString()
    };
    const [id] = await db('medicamentos').insert(novo);
    console.log("✔ SUCESSO! Medicamento inserido com ID:", id);
  } catch(e) {
    console.error("ERRO:", e.message);
  } finally {
    process.exit();
  }
})();
