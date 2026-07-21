const fs = require('fs');
const path = require('path');
const knex = require('knex');

const db = knex({
  client: 'mysql2',
  connection: { host: 'br1104.hostgator.com.br', port: 3306, user: 'conn0686_ownerhealth', password: 'ConnectorTech@2280@', database: 'conn0686_ownerhealth' }
});

(async () => {
  try {
    const resTables = await db.raw("SHOW TABLES");
    const existingTables = new Set(resTables[0].map(t => Object.values(t)[0]));
    console.log("Existing MySQL tables count:", existingTables.size);

    const controllersDir = path.join(__dirname, 'src', 'controllers');
    const files = fs.readdirSync(controllersDir);

    const queriedTables = new Set();
    const tableRegex = /dbHelper\.query\s*\(\s*['"`]([^'"`]+)['"`]/g;
    const knexRegex = /db\s*\(\s*['"`]([^'"`]+)['"`]/g;

    for (const file of files) {
      if (!file.endsWith('.js')) continue;
      const content = fs.readFileSync(path.join(controllersDir, file), 'utf-8');

      let m;
      while ((m = tableRegex.exec(content)) !== null) {
        queriedTables.add(m[1]);
      }
      while ((m = knexRegex.exec(content)) !== null) {
        queriedTables.add(m[1]);
      }
    }

    console.log("\nAll tables referenced in controllers:", Array.from(queriedTables));

    const missingTables = Array.from(queriedTables).filter(t => !existingTables.has(t));
    console.log("\nMISSING TABLES IN MYSQL:", missingTables);
  } catch(e) {
    console.error(e.message);
  } finally {
    process.exit();
  }
})();
