const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const pdfParse = require('pdf-parse');

const uploadsDir = path.join(__dirname, 'uploads');
const files = fs.readdirSync(uploadsDir);

console.log("Arquivos em /uploads:", files);

(async () => {
  for (const f of files) {
    if (f.endsWith('.pdf')) {
      const filePath = path.join(uploadsDir, f);
      const dataBuffer = fs.readFileSync(filePath);
      console.log(`\n=================== ARQUIVO: ${f} ===================`);
      try {
        const parsed = await pdfParse(dataBuffer);
        console.log("PDF-PARSE TEXT:", JSON.stringify(parsed.text));
      } catch (e) { me
        console.log("PDF-PARSE ERROR:", e.message);
      }

      // Raw stream inspection
      const bufferStr = dataBuffer.toString('binary');
      const streamRegex = /stream[\r\n]+([\s\S]*?)endstream/g;
      let match;
      let i = 0;
      while ((match = streamRegex.exec(bufferStr)) !== null) {
        i++;
        const streamData = Buffer.from(match[1], 'binary');
        let uncompressed = '';
        try {
          uncompressed = zlib.inflateSync(streamData).toString('utf-8');
        } catch {
          uncompressed = streamData.toString('binary');
        }
        console.log(`--- STREAM #${i} (Length ${streamData.length}) ---`);
        console.log(uncompressed.slice(0, 500));
      }
    }
  }
})();
