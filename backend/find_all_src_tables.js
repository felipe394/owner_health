const fs = require('fs');
const path = require('path');
const knex = require('knex');

const db = knex({
  client: 'mysql2',
  connection: { host: 'br1104.hostgator.com.br', port: 3306, user: 'conn0686_ownerhealth', password: 'ConnectorTech@2280@', database: 'conn0686_ownerhealth' }
});

function getAllFiles(dir, allFiles = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, allFiles);
    } else if (file.endsWith('.js')) {
      allFiles.push(filePath);
    }
  }
  return allFiles;
}

(async () => {
  try {
    const resTables = await db.raw("SHOW TABLES");
    const existingTables = new Set(resTables[0].map(t => Object.values(t)[0]));

    const srcDir = path.join(__dirname, 'src');
    const files = getAllFiles(srcDir);

    const queriedTables = new Set();
    const tableRegex = /dbHelper\.query\s*\(\s*['"`]([^'"`\s]+)['"`]/g;
    const knexRegex = /db\s*\(\s*['"`]([^'"`\s]+)['"`]/g;

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      let m;
      while ((m = tableRegex.exec(content)) !== null) {
        queriedTables.add(m[1].split(' ')[0]);
      }
      while ((m = knexRegex.exec(content)) !== null) {
        queriedTables.add(m[1].split(' ')[0]);
      }
    }

    console.log("All tables in entire src/:", Array.from(queriedTables));

    const missingTables = Array.from(queriedTables).filter(t => !existingTables.has(t));
    console.log("\nALL MISSING TABLES IN MYSQL:", missingTables);
  } catch(e) {
    console.error(e.message);
  } finally {
    process.exit();
  }
})();
