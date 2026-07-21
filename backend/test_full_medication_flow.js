const knex = require('knex');
const db = knex({
  client: 'mysql2',
  connection: { host: 'br1104.hostgator.com.br', port: 3306, user: 'conn0686_ownerhealth', password: 'ConnectorTech@2280@', database: 'conn0686_ownerhealth' }
});

(async () => {
  try {
    console.log("--- TESTANDO INSERÇÃO COMPLETA DE MEDICAMENTO ---");
    const payload = {
      cliente_id: 1,
      nome: 'Azitromicina',
      posologia: '1 Comprimido por dia',
      horarios: JSON.stringify(['08:00']),
      data_inicio: '2026-07-21',
      data_fim: '2026-07-30',
      observacoes: 'Cansaço',
      email_lembrete: 'seu@email.com',
      efeitos: 'Dor na barriga caso eu não me alimente',
      ativo: 1,
      criado_em: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    const [id] = await db('medicamentos').insert(payload);
    console.log("✔ SUCESSO! Azitromicina inserida com ID:", id);

    console.log("\n--- BUSCANDO MEDICAMENTOS DO CLIENTE 1 ---");
    const list = await db('medicamentos').where({ cliente_id: 1 }).select();
    console.log(`✔ TOTAL DE MEDICAMENTOS ENCONTRADOS: ${list.length}`);
    console.log("LISTA:", list);
  } catch(e) {
    console.error("ERRO:", e.message);
  } finally {
    process.exit();
  }
})();
