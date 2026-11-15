import crypto from 'crypto';
import fs from 'fs';
import zlib from 'zlib';

export const ECI_AES_KEY = Buffer.from('e855n97lc4tcPkj7WWsi38yNWpalLBLZzQdkqHWYbZ0=', 'base64');

export const ECI_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json',
  Origin: 'https://voters.eci.gov.in',
  Referer: 'https://voters.eci.gov.in/',
  appName: 'VSP',
  applicationName: 'VSP',
  'PLATFORM-TYPE': 'ECIWEB',
  channelidobo: 'VSP',
};

export function decryptEciCaptchaPayload(b64Cipher: string): { id: string; captcha: string; status: string } {
  const buf = Buffer.from(b64Cipher, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(buf.length - 16);
  const enc = buf.subarray(12, buf.length - 16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', ECI_AES_KEY, iv);
  decipher.setAuthTag(tag);
  return JSON.parse(Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8'));
}

export async function scrapeAllMpBoothsLive(outGzPath: string) {
  const dRes = await fetch('https://gateway-voters.eci.gov.in/api/v1/common/districts/S12', { headers: ECI_HEADERS });
  const districts: any[] = await dRes.json();
  const fullDirectory: any = {
    source: 'https://gateway-voters.eci.gov.in/api/v1/printing-publish/get-part-list',
    stateCd: 'S12',
    stateName: 'Madhya Pradesh',
    scrapedAt: new Date().toISOString(),
    totalDistricts: districts.length,
    totalAcs: 0,
    totalPollingParts: 0,
    districts: [],
  };

  for (const dist of districts) {
    const acRes = await fetch(`https://gateway-voters.eci.gov.in/api/v1/common/acs/${dist.districtCd}`, { headers: ECI_HEADERS });
    const acs: any[] = await acRes.json();
    const acEntries = [];
    for (const ac of acs) {
      const pRes = await fetch('https://gateway-voters.eci.gov.in/api/v1/printing-publish/get-part-list', {
        method: 'POST',
        headers: ECI_HEADERS,
        body: JSON.stringify({ stateCd: 'S12', districtCd: dist.districtCd, acNumber: ac.asmblyNo }),
      });
      const pJson: any = await pRes.json();
      const parts = Array.isArray(pJson.payload) ? pJson.payload : [];
      fullDirectory.totalPollingParts += parts.length;
      acEntries.push({
        acNumber: ac.asmblyNo,
        acName: (ac.asmblyName || '').trim(),
        acNameHi: (ac.asmblyNameL1 || ac.asmblyName || '').trim(),
        totalParts: parts.length,
        parts: parts.map((p: any) => ({ id: p.partId, no: p.partNumber, name: (p.partName || '').trim() })),
      });
    }
    fullDirectory.totalAcs += acs.length;
    fullDirectory.districts.push({
      districtCd: dist.districtCd,
      districtNo: dist.districtNo,
      districtName: (dist.districtValue || '').trim(),
      districtNameHi: (dist.districtValueHindi || '').trim(),
      totalAcsInDistrict: acs.length,
      acs: acEntries,
    });
  }

  fs.writeFileSync(outGzPath, zlib.gzipSync(Buffer.from(JSON.stringify(fullDirectory), 'utf8'), { level: 9 }));
  return fullDirectory;
}
