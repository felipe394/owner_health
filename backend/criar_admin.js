require('dotenv').config();
const bcrypt = require('bcryptjs');
const knex = require('knex');

// Usar a mesma configuração do knexfile.js
const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  }
});

async function criarAdmin() {
  console.log('🔄 Iniciando criação do usuário administrador master no banco de dados remoto...');
  console.log(`📍 Conectando a ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

  try {
    // 1. Gerar hash da senha '123456'
    const salt = await bcrypt.genSalt(10);
    const hashSenha = await bcrypt.hash('123456', salt);

    // 2. Verificar se o usuário admin@teste.com já existe
    const usuarioExistente = await db('usuarios').where({ email: 'admin@teste.com' }).first();

    if (usuarioExistente) {
      console.log('⚠️ O usuário admin@teste.com já existe. Atualizando privilégios e senha...');
      await db('usuarios')
        .where({ email: 'admin@teste.com' })
        .update({
          senha: hashSenha,
          eh_admin: true,
          eh_cliente: true,
          eh_empresa: true,
          eh_profissional: true,
          eh_dependente: false
        });
      console.log('✅ Usuário admin@teste.com atualizado com sucesso no banco de dados!');
    } else {
      // 3. Inserir novo usuário master
      await db('usuarios').insert({
        email: 'admin@teste.com',
        senha: hashSenha,
        eh_admin: true,
        eh_cliente: true,
        eh_empresa: true,
        eh_profissional: true,
        eh_dependente: false
      });
      console.log('✅ Usuário admin@teste.com inserido com sucesso no banco de dados!');
    }
  } catch (error) {
    console.error('❌ Erro ao interagir com o banco de dados:', error.message);
  } finally {
    await db.destroy();
    console.log('🔌 Conexão com o banco de dados encerrada.');
  }
}

criarAdmin();
