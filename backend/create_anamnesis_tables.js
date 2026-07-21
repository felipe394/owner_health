const knex = require('knex');
const db = knex({
  client: 'mysql2',
  connection: {
    host: 'br1104.hostgator.com.br',
    port: 3306,
    user: 'conn0686_ownerhealth',
    password: 'ConnectorTech@2280@',
    database: 'conn0686_ownerhealth'
  }
});

(async () => {
  try {
    // 1. patient_anamnesis_requests
    const hasRequests = await db.schema.hasTable('patient_anamnesis_requests');
    if (!hasRequests) {
      await db.schema.createTable('patient_anamnesis_requests', (t) => {
        t.increments('id');
        t.integer('cliente_id').notNullable();
        t.integer('medico_id').nullable();
        t.integer('empresa_id').nullable();
        t.string('status', 20).defaultTo('aguardando');
        t.timestamp('respondido_em').nullable();
        t.timestamp('criado_em').defaultTo(db.fn.now());
      });
      console.log('Criada tabela: patient_anamnesis_requests');
    } else {
      console.log('Tabela patient_anamnesis_requests já existe.');
    }

    // 2. patient_anamnesis_sections
    const hasSections = await db.schema.hasTable('patient_anamnesis_sections');
    if (!hasSections) {
      await db.schema.createTable('patient_anamnesis_sections', (t) => {
        t.increments('id');
        t.integer('request_id').notNullable();
        t.string('titulo', 255).notNullable();
        t.text('descricao').nullable();
        t.integer('ordem').defaultTo(0);
        t.tinyint('ativo').defaultTo(1);
      });
      console.log('Criada tabela: patient_anamnesis_sections');
    } else {
      console.log('Tabela patient_anamnesis_sections já existe.');
    }

    // 3. patient_anamnesis_questions
    const hasQuestions = await db.schema.hasTable('patient_anamnesis_questions');
    if (!hasQuestions) {
      await db.schema.createTable('patient_anamnesis_questions', (t) => {
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
      console.log('Criada tabela: patient_anamnesis_questions');
    } else {
      console.log('Tabela patient_anamnesis_questions já existe.');
    }

    // 4. patient_anamnesis_options
    const hasOptions = await db.schema.hasTable('patient_anamnesis_options');
    if (!hasOptions) {
      await db.schema.createTable('patient_anamnesis_options', (t) => {
        t.increments('id');
        t.integer('question_id').notNullable();
        t.string('texto', 255).notNullable();
        t.integer('ordem').defaultTo(0);
        t.integer('next_section_id').nullable();
      });
      console.log('Criada tabela: patient_anamnesis_options');
    } else {
      console.log('Tabela patient_anamnesis_options já existe.');
    }

    // 5. patient_anamnesis_answers
    const hasAnswers = await db.schema.hasTable('patient_anamnesis_answers');
    if (!hasAnswers) {
      await db.schema.createTable('patient_anamnesis_answers', (t) => {
        t.increments('id');
        t.integer('request_id').notNullable();
        t.integer('question_id').notNullable();
        t.text('resposta').nullable();
        t.timestamp('criado_em').defaultTo(db.fn.now());
      });
      console.log('Criada tabela: patient_anamnesis_answers');
    } else {
      console.log('Tabela patient_anamnesis_answers já existe.');
    }

    // 6. anamnesis_templates
    const hasTemplates = await db.schema.hasTable('anamnesis_templates');
    if (!hasTemplates) {
      await db.schema.createTable('anamnesis_templates', (t) => {
        t.increments('id');
        t.integer('empresa_id').notNullable();
        t.string('nome', 255).notNullable();
        t.text('descricao').nullable();
        t.json('sections_data').notNullable();
        t.timestamp('criado_em').defaultTo(db.fn.now());
        t.timestamp('atualizado_em').defaultTo(db.fn.now());
      });
      console.log('Criada tabela: anamnesis_templates');
    } else {
      console.log('Tabela anamnesis_templates já existe.');
    }

    console.log('\nMigração concluída com sucesso!');
  } catch(e) {
    console.error('ERRO:', e.message);
  } finally {
    process.exit();
  }
})();
