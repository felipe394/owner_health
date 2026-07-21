const fs = require('fs');
const path = require('path');
require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  console.log('Lendo schemas...');
  const sqlAgendas = fs.readFileSync(path.join(__dirname, 'schema_agendas.sql'), 'utf8');
  const sqlBloqueios = fs.readFileSync(path.join(__dirname, 'schema_bloqueios.sql'), 'utf8');
  const sqlClienteEmpresas = fs.readFileSync(path.join(__dirname, 'schema_cliente_empresas.sql'), 'utf8');
  const sql = sqlAgendas + '\n' + sqlBloqueios + '\n' + sqlClienteEmpresas;
  
  console.log(`Conectando ao banco de dados ${process.env.DB_HOST}...`);
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true // Permite executar multiplos statements
  });

  try {
    console.log(`Executando schemas...`);
    await connection.query(sql);
    console.log('✅ Tabelas criadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
  } finally {
    await connection.end();
  }
}

run();
