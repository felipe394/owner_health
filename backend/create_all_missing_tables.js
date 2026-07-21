const knex = require('knex');
const db = knex({
  client: 'mysql2',
  connection: { host: 'br1104.hostgator.com.br', port: 3306, user: 'conn0686_ownerhealth', password: 'ConnectorTech@2280@', database: 'conn0686_ownerhealth' }
});

(async () => {
  try {
    // 1. empresa_documentos_emitidos
    if (!await db.schema.hasTable('empresa_documentos_emitidos')) {
      await db.schema.createTable('empresa_documentos_emitidos', t => {
        t.increments('id');
        t.integer('empresa_id').notNullable();
        t.integer('profissional_id').nullable();
        t.string('paciente_cpf', 255).notNullable();
        t.string('tipo', 50).notNullable();
        t.text('conteudo').notNullable();
        t.tinyint('assinado_digitalmente').defaultTo(1);
        t.timestamp('criado_em').defaultTo(db.fn.now());
      });
      console.log('✔ Tabela empresa_documentos_emitidos criada com sucesso');
    }

    // 2. anamnesis_sections
    if (!await db.schema.hasTable('anamnesis_sections')) {
      await db.schema.createTable('anamnesis_sections', t => {
        t.increments('id');
        t.integer('empresa_id').notNullable();
        t.string('titulo', 255).notNullable();
        t.text('descricao').nullable();
        t.integer('ordem').defaultTo(0);
        t.tinyint('ativo').defaultTo(1);
      });
      console.log('✔ Tabela anamnesis_sections criada com sucesso');
    }

    // 3. anamnesis_questions
    if (!await db.schema.hasTable('anamnesis_questions')) {
      await db.schema.createTable('anamnesis_questions', t => {
        t.increments('id');
        t.integer('section_id').notNullable();
        t.text('texto').notNullable();
        t.string('tipo', 50).notNullable();
        t.tinyint('obrigatoria').defaultTo(0);
        t.integer('ordem').defaultTo(0);
        t.string('placeholder', 255).nullable();
        t.text('descricao').nullable();
        t.integer('escala_min').nullable();
        t.integer('escala_max').nullable();
        t.string('escala_label_min', 100).nullable();
        t.string('escala_label_max', 100).nullable();
        t.integer('parent_option_id').nullable();
        t.tinyint('ativo').defaultTo(1);
      });
      console.log('✔ Tabela anamnesis_questions criada com sucesso');
    }

    // 4. anamnesis_options
    if (!await db.schema.hasTable('anamnesis_options')) {
      await db.schema.createTable('anamnesis_options', t => {
        t.increments('id');
        t.integer('question_id').notNullable();
        t.string('texto', 255).notNullable();
        t.integer('ordem').defaultTo(0);
        t.integer('next_section_id').nullable();
      });
      console.log('✔ Tabela anamnesis_options criada com sucesso');
    }

    // 5. anamnesis_responses
    if (!await db.schema.hasTable('anamnesis_responses')) {
      await db.schema.createTable('anamnesis_responses', t => {
        t.increments('id');
        t.integer('empresa_id').notNullable();
        t.integer('cliente_id').notNullable();
        t.string('status', 20).defaultTo('concluido');
        t.timestamp('criado_em').defaultTo(db.fn.now());
        t.timestamp('respondido_em').nullable();
      });
      console.log('✔ Tabela anamnesis_responses criada com sucesso');
    }

    // 6. anamnesis_response_items
    if (!await db.schema.hasTable('anamnesis_response_items')) {
      await db.schema.createTable('anamnesis_response_items', t => {
        t.increments('id');
        t.integer('response_id').notNullable();
        t.integer('question_id').notNullable();
        t.text('resposta').nullable();
        t.timestamp('criado_em').defaultTo(db.fn.now());
      });
      console.log('✔ Tabela anamnesis_response_items criada com sucesso');
    }

    // 7. empresa_agendas
    if (!await db.schema.hasTable('empresa_agendas')) {
      await db.schema.createTable('empresa_agendas', t => {
        t.increments('id');
        t.integer('empresa_id').notNullable();
        t.integer('profissional_id').notNullable();
        t.string('data', 20).notNullable();
        t.string('horario_inicio', 20).notNullable();
        t.string('horario_fim', 20).notNullable();
        t.string('status', 20).defaultTo('disponivel');
        t.timestamp('criado_em').defaultTo(db.fn.now());
      });
      console.log('✔ Tabela empresa_agendas criada com sucesso');
    }

    // 8. empresa_anamnese_config
    if (!await db.schema.hasTable('empresa_anamnese_config')) {
      await db.schema.createTable('empresa_anamnese_config', t => {
        t.increments('id');
        t.integer('empresa_id').notNullable();
        t.text('campos_ativos').notNullable();
        t.timestamp('criado_em').defaultTo(db.fn.now());
      });
      console.log('✔ Tabela empresa_anamnese_config criada com sucesso');
    }

    // 9. efeitos_medicamentos
    if (!await db.schema.hasTable('efeitos_medicamentos')) {
      await db.schema.createTable('efeitos_medicamentos', t => {
        t.increments('id');
        t.integer('registro_id').nullable();
        t.integer('cliente_id').notNullable();
        t.text('efeito').notNullable();
        t.string('intensidade', 50).nullable();
        t.timestamp('criado_em').defaultTo(db.fn.now());
      });
      console.log('✔ Tabela efeitos_medicamentos criada com sucesso');
    }

    console.log("\n🎉 TODAS AS TABELAS CRIADAS NO MYSQL COM SUCESSO!");
  } catch(e) {
    console.error("ERRO ao criar tabelas:", e.message);
  } finally {
    process.exit();
  }
})();
