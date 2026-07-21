const knex = require('knex');
const db = knex({
  client: 'mysql2',
  connection: { host: 'br1104.hostgator.com.br', port: 3306, user: 'conn0686_ownerhealth', password: 'ConnectorTech@2280@', database: 'conn0686_ownerhealth' }
});

function formatToMysqlDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return null;
  const str = dateStr.trim();
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  if (str.includes('T')) {
    return str.split('T')[0];
  }
  return str;
}

(async () => {
  try {
    console.log("=== TESTANDO INSERÇÃO COM DD/MM/YYYY '21/07/2026' ===");
    try {
      await db('medicamentos').insert({
        cliente_id: 1,
        nome: 'Teste Erro Data BR',
        data_inicio: '21/07/2026'
      });
      console.log("Data BR sem formatar passou");
    } catch(e) {
      console.error("❌ ERRO COM DATA BR '21/07/2026':", e.message);
    }

    console.log("\n=== TESTANDO COM SANITIZER ===");
    const dataFormatada = formatToMysqlDate('21/07/2026');
    console.log("Data formatada:", dataFormatada);
    const [id] = await db('medicamentos').insert({
      cliente_id: 1,
      nome: 'Teste Sanitizado',
      data_inicio: dataFormatada
    });
    console.log("✔ INSERIDO COM SUCESSO! ID:", id);
  } catch(e) {
    console.error("ERRO FINAL:", e.message);
  } finally {
    process.exit();
  }
})();
