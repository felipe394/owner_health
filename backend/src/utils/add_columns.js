require('dotenv').config();
const knex = require('knex');
const knexConfig = require('../../knexfile');

async function main() {
  console.log('🔄 Verificando e adicionando colunas "status" e "pagamento_status" na tabela "clientes"...');
  
  try {
    const hasStatus = await knexConfig.schema.hasColumn('clientes', 'status');
    if (!hasStatus) {
      await knexConfig.schema.alterTable('clientes', (table) => {
        table.string('status', 20).defaultTo('ativo');
      });
      console.log('✅ Coluna "status" adicionada com sucesso!');
    } else {
      console.log('ℹ️ Coluna "status" já existe na tabela "clientes".');
    }

    const hasPayment = await knexConfig.schema.hasColumn('clientes', 'pagamento_status');
    if (!hasPayment) {
      await knexConfig.schema.alterTable('clientes', (table) => {
        table.string('pagamento_status', 20).defaultTo('pago');
      });
      console.log('✅ Coluna "pagamento_status" adicionada com sucesso!');
    } else {
      console.log('ℹ️ Coluna "pagamento_status" já existe na tabela "clientes".');
    }

  } catch (error) {
    console.error('❌ Erro durante alteração da tabela:', error.message);
  } finally {
    await knexConfig.destroy();
    console.log('🔌 Conexão encerrada.');
  }
}

main();
