const zlib = require('zlib');

function decodePdfHex(hexStr) {
  let result = '';
  // Match 4-character UTF-16BE hex codes like 0054 0045 0053...
  const pairs = hexStr.match(/.{1,4}/g) || [];
  for (const pair of pairs) {
    const code = parseInt(pair, 16);
    if (code >= 32 && code <= 126) {
      result += String.fromCharCode(code);
    } else if (code === 10 || code === 13) {
      result += ' ';
    }
  }
  return result;
}

const sampleHex = "005400450053005400450020004400450020004500580041004D0045";
console.log("TESTE DE DECODIFICAÇÃO HEX:", decodePdfHex(sampleHex));
