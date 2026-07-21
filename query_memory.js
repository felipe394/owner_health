const { getContext } = require('./backend/src/middleware/context');
const fs = require('fs');
const http = require('http');

async function run() {
  const req = http.request('http://localhost:3000/api/patient-anamnesis/requests', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log('Requests:', data));
  });
  req.end();
}
run();
