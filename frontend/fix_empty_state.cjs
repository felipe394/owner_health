const fs = require('fs');

let content = fs.readFileSync('src/pages/Client/ClientAnamnesis.tsx', 'utf8');
const regexEmptyState = /\/\/ ─── Empty State ─────────────────────────────────────────────────────────────[\s\S]*?\/\/ ─── Componente Principal ─────────────────────────────────────────────────────/;
content = content.replace(regexEmptyState, '// ─── Componente Principal ─────────────────────────────────────────────────────');
fs.writeFileSync('src/pages/Client/ClientAnamnesis.tsx', content);
