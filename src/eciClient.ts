import { GoogleGenAI, Type } from '@google/genai';

export interface EciDistrictRecord {
  state: string;
  districtNo: string;
  districtValue: string;
  districtValueHindi: string;
  districtCd: string;
}

export interface EciAssemblyRecord {
  stateCd: string;
  districtCd: string;
  asmblyNo: number;
  asmblyName: string;
  asmblyNameL1: string;
}

export interface ExtractedPdfVoter {
  sr: number;
  house_no: string;
  name_hi: string;
  relative_name_hi: string;
  relation_type: 'f' | 'h';
  age: number;
  gender: 'm' | 'f';
  epic: string;
  ward: number;
}

const ECI_BASE = 'https://gateway-voters.eci.gov.in/api/v1';

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  Origin: 'https://voters.eci.gov.in',
  Referer: 'https://voters.eci.gov.in/',
};

/**
 * Fetches live Madhya Pradesh (S12) official district registry from the Election Commission of India gateway.
 */
export async function fetchEciMpDistricts(): Promise<EciDistrictRecord[]> {
  const res = await fetch(`${ECI_BASE}/common/districts/S12`, {
    headers: BROWSER_HEADERS,
  });
  if (!res.ok) {
    throw new Error(`ECI Gateway returned HTTP ${res.status}`);
  }
  const data = (await res.json()) as EciDistrictRecord[];
  return Array.isArray(data) ? data : [];
}

/**
 * Fetches live Assembly Constituencies (Vidhan Sabha) for a given MP District Code (e.g., S1233 for Sehore, S1232 for Bhopal).
 */
export async function fetchEciAssemblyConstituencies(
  districtCd: string
): Promise<EciAssemblyRecord[]> {
  const res = await fetch(`${ECI_BASE}/common/acs/${districtCd}`, {
    headers: BROWSER_HEADERS,
  });
  if (!res.ok) {
    return [];
  }
  const data = (await res.json()) as EciAssemblyRecord[];
  return Array.isArray(data) ? data : [];
}

/**
 * Uses Gemini 2.5 Flash Vision to solve the 6-character alphanumeric ECI/MPSEC CAPTCHA image automatically.
 */
export async function solveEciCaptchaWithGemini(
  base64CaptchaImage: string,
  apiKey?: string
): Promise<string> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY is required to auto-solve ECI CAPTCHAs');
  }
  const ai = new GoogleGenAI({ apiKey: key });
  const cleanBase64 = base64CaptchaImage.replace(/^data:image\/\w+;base64,/, '');
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        inlineData: {
          mimeType: 'image/png',
          data: cleanBase64,
        },
      },
      'Read the exact alphanumeric characters shown in this CAPTCHA image. Return ONLY the raw characters with no spaces or punctuation.',
    ],
  });
  return (response.text || '').trim().replace(/\s+/g, '');
}

/**
 * Parses an official MPSEC / ECI Hindi Electoral Roll PDF page into structured voter records using Gemini 2.5 Flash.
 */
export async function parseVoterRollPdfWithGemini(
  pdfBase64: string,
  defaultWard = 1,
  apiKey?: string
): Promise<ExtractedPdfVoter[]> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY is required for PDF OCR extraction');
  }
  const ai = new GoogleGenAI({ apiKey: key });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBase64,
        },
      },
      `Extract all voter boxes from this official Madhya Pradesh Hindi Electoral Roll (मतदाता सूची) PDF.
For every voter box, extract:
- sr: Serial number (क्रमांक)
- house_no: House number (मकान संख्या / गृह संख्या)
- name_hi: Voter full name in Unicode Devanagari Hindi (निर्वाचक का नाम)
- relative_name_hi: Father or Husband name in Unicode Devanagari Hindi (पिता/पति का नाम)
- relation_type: "f" if Father (पिता) or "h" if Husband (पति)
- age: Voter age (आयु) as integer
- gender: "m" if Male (पुरुष) or "f" if Female (महिला)
- epic: EPIC Voter ID number (पहचान पत्र क्रमांक)
- ward: Ward number (default ${defaultWard})`,
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sr: { type: Type.INTEGER },
            house_no: { type: Type.STRING },
            name_hi: { type: Type.STRING },
            relative_name_hi: { type: Type.STRING },
            relation_type: { type: Type.STRING },
            age: { type: Type.INTEGER },
            gender: { type: Type.STRING },
            epic: { type: Type.STRING },
            ward: { type: Type.INTEGER },
          },
          required: [
            'sr',
            'house_no',
            'name_hi',
            'relative_name_hi',
            'relation_type',
            'age',
            'gender',
            'epic',
            'ward',
          ],
        },
      },
    },
  });

  const parsed = JSON.parse(response.text || '[]');
  return Array.isArray(parsed) ? parsed : [];
}
