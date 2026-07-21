const knex = require('knex');
const db = knex({
  client: 'mysql2',
  connection: { host: 'br1104.hostgator.com.br', port: 3306, user: 'conn0686_ownerhealth', password: 'ConnectorTech@2280@', database: 'conn0686_ownerhealth' }
});

const tables = [
  'aceites_lgpd',
  'agenda_bloqueios',
  'agenda_solicitacoes_desbloqueio',
  'agendas',
  'anamnese',
  'anamnesis_options',
  'anamnesis_questions',
  'anamnesis_response_items',
  'anamnesis_responses',
  'anamnesis_sections',
  'anamnesis_templates',
  'audit_logs',
  'bioimpedancia',
  'cliente_empresas',
  'clientes',
  'dependentes',
  'efeitos_medicamentos',
  'empresa_agendas',
  'empresa_anamnese_config',
  'empresa_documentos_emitidos',
  'empresa_planos_saude',
  'empresas',
  'exames',
  'medicamentos',
  'notificacoes_profissionais',
  'notificacoes_usuarios',
  'patient_anamnesis_answers',
  'patient_anamnesis_options',
  'patient_anamnesis_questions',
  'patient_anamnesis_requests',
  'patient_anamnesis_sections',
  'planos_saude',
  'profissionais',
  'profissional_empresas',
  'profissional_planos_saude',
  'receitas',
  'registro_medicamentos',
  'satisfacao',
  'usuarios',
  'usuarios_sistema'
];

(async () => {
  let okCount = 0;
  for (const t of tables) {
    try {
      await db(t).select().limit(1);
      console.log(`[OK] Tabela '${t}' pronta no MySQL.`);
      okCount++;
    } catch(e) {
      console.error(`[ERRO] Tabela '${t}':`, e.message);
    }
  }
  console.log(`\n🎉 TOTAL: ${okCount} de ${tables.length} tabelas prontas e operacionais no MySQL!`);
  process.exit();
})();
