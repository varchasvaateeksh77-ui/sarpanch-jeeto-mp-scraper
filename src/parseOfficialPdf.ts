import fs from 'fs';
import path from 'path';
import { parseVoterRollPdfWithGemini } from './eciClient';

async function run() {
  const pdfPath = process.argv[2];
  const wardNum = Number(process.argv[3] || 1);
  if (!pdfPath || !fs.existsSync(pdfPath)) {
    console.log(
      'Usage: npx tsx src/parseOfficialPdf.ts <path-to-mpsec-or-eci-roll.pdf> [wardNumber]'
    );
    process.exit(0);
  }
  const pdfBase64 = fs.readFileSync(path.resolve(pdfPath)).toString('base64');
  console.log(`Extracting voters from ${pdfPath} (Ward ${wardNum})...`);
  const voters = await parseVoterRollPdfWithGemini(pdfBase64, wardNum);
  console.log(`Extracted ${voters.length} voters:`);
  console.log(JSON.stringify(voters.slice(0, 5), null, 2));
}

run();
