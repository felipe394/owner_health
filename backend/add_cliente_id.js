require('dotenv').config();
const db = require('./knexfile');

async function run() {
  try {
    const hasColumn = await db.schema.hasColumn('agendas', 'cliente_id');
    if (!hasColumn) {
      await db.schema.alterTable('agendas', table => {
        table.integer('cliente_id').unsigned().nullable();
      });
      console.log('✅ Column cliente_id added to agendas table.');
    } else {
      console.log('Column cliente_id already exists.');
    }
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    process.exit(0);
  }
}
run();
