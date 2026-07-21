const fs = require('fs');
const zlib = require('zlib');
const pdfParse = require('pdf-parse');

async function extractPdfText(dataBuffer) {
  let text = '';
  if (pdfParse) {
    try {
      const res = await pdfParse(dataBuffer);
      if (res && res.text && res.text.trim().length > 0) {
        text = res.text.replace(/\s+/g, ' ').trim();
      }
    } catch (e) {
      console.log('pdf-parse notice:', e.message);
    }
  }

  if (!text || text.length < 3) {
    try {
      const bufferStr = dataBuffer.toString('binary');
      const streamRegex = /stream[\r\n]+([\s\S]*?)endstream/g;
      let match;
      const foundTexts = [];

      while ((match = streamRegex.exec(bufferStr)) !== null) {
        const streamData = Buffer.from(match[1], 'binary');
        let uncompressed = '';
        try {
          uncompressed = zlib.inflateSync(streamData).toString('utf-8');
        } catch {
          uncompressed = streamData.toString('utf-8');
        }

        const literalRegex = /\(([a-zA-Z0-9\sÁÉÍÓÚáéíóúÀàÃãÕõÇç\-:,.]{2,})\)/g;
        let tm;
        while ((tm = literalRegex.exec(uncompressed)) !== null) {
          const str = tm[1].trim();
          if (str && !str.includes('Identity') && !str.includes('Font') && !str.includes('Adobe')) {
            foundTexts.push(str);
          }
        }
      }

      if (foundTexts.length > 0) {
        text = Array.from(new Set(foundTexts)).join(' ');
      }
    } catch (e) {
      console.log('Stream decompression notice:', e.message);
    }
  }

  return text;
}

// Test on any uploaded PDF in /uploads if present
const uploads = fs.readdirSync('./uploads');
console.log("Arquivos na pasta uploads:", uploads);
(async () => {
  for (const f of uploads) {
    if (f.endsWith('.pdf')) {
      const buf = fs.readFileSync(`./uploads/${f}`);
      const txt = await extractPdfText(buf);
      console.log(`\n📄 PDF '${f}':\nText: "${txt}"`);
    }
  }
})();
