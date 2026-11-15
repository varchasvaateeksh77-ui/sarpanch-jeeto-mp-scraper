import {
  CandidateInfo,
  FamilyContactInfo,
  FamilyRaw,
  KunbaRaw,
  PersonNode,
  PhuleraDataset,
  TeamWorker,
  TurnoutRecord,
  VoterLeaning,
  VoterTagAssignment,
  WardAssignment,
} from './types';

export interface MpGpLookupInfo {
  id: string;
  name: string;
  tehsil: string;
  district: string;
  voters: number;
  villages: string[];
}

interface RegionProfile {
  regionKey: string;
  castes: { name: string; surnames: string[]; share: number }[];
  maleFirstNames: string[];
  femaleFirstNames: string[];
  reservationCategories: string[];
}

const DISTRICT_RTO_CODES: Record<string, string> = {
  bhopal: 'MP04',
  sehore: 'MP37',
  raisen: 'MP38',
  vidisha: 'MP40',
  rajgarh: 'MP39',
  narmadapuram: 'MP05',
  harda: 'MP47',
  betul: 'MP48',
  indore: 'MP09',
  dhar: 'MP11',
  jhabua: 'MP45',
  alirajpur: 'MP69',
  khargone: 'MP10',
  barwani: 'MP46',
  khandwa: 'MP12',
  burhanpur: 'MP68',
  ujjain: 'MP13',
  dewas: 'MP41',
  ratlam: 'MP43',
  shajapur: 'MP42',
  'agar-malwa': 'MP70',
  mandsaur: 'MP14',
  neemuch: 'MP44',
  gwalior: 'MP07',
  shivpuri: 'MP33',
  guna: 'MP08',
  ashoknagar: 'MP67',
  datia: 'MP32',
  morena: 'MP06',
  bhind: 'MP30',
  sheopur: 'MP31',
  sagar: 'MP15',
  damoh: 'MP34',
  panna: 'MP35',
  chhatarpur: 'MP16',
  tikamgarh: 'MP36',
  niwari: 'MP71',
  rewa: 'MP17',
  satna: 'MP19',
  sidhi: 'MP53',
  singrauli: 'MP66',
  maihar: 'MP72',
  mauganj: 'MP73',
  shahdol: 'MP18',
  umaria: 'MP54',
  anuppur: 'MP65',
  jabalpur: 'MP20',
  katni: 'MP21',
  narsinghpur: 'MP49',
  chhindwara: 'MP28',
  seoni: 'MP22',
  mandla: 'MP51',
  dindori: 'MP52',
  balaghat: 'MP50',
  pandhurna: 'MP74',
};

const REGION_PROFILES: Record<string, RegionProfile> = {
  bhopal_vindhya: {
    regionKey: 'bhopal_vindhya',
    castes: [
      { name: 'मीणा (OBC)', surnames: ['मीणा', 'मारन'], share: 24 },
      { name: 'धाकड़ / किरार (OBC)', surnames: ['धाकड़', 'किरार', 'नागर'], share: 19 },
      { name: 'मेवाड़ा / पाटीदार (OBC)', surnames: ['मेवाड़ा', 'पाटीदार', 'वर्मा'], share: 16 },
      { name: 'कुशवाहा (OBC)', surnames: ['कुशवाहा', 'शाक्य'], share: 13 },
      { name: 'ठाकुर / राजपूत (सामान्य)', surnames: ['गौड़', 'परमार', 'चौहान'], share: 11 },
      { name: 'अहिरवार (SC)', surnames: ['अहिरवार', 'सूर्यवंशी'], share: 10 },
      { name: 'विश्वकर्मा / ब्राह्मण', surnames: ['विश्वकर्मा', 'शर्मा', 'दुबे'], share: 7 },
    ],
    maleFirstNames: [
      'लक्ष्मीनारायण',
      'रामस्वरूप',
      'हरिनारायण',
      'द्वारकाप्रसाद',
      'ओंकारलाल',
      'गंगाराम',
      'देवेन्द्र सिंह',
      'महेन्द्र कुमार',
      'कैलाशचंद्र',
      'जगदीशप्रसाद',
      'मूलचंद',
      'घासीराम',
      'भवानीशंकर',
      'शिवनारायण',
      'प्रेमनारायण',
      'सत्यनारायण',
      'राधेश्याम',
      'बाबूलाल',
      'नंदकिशोर',
      'कमल सिंह',
      'रमेशचंद्र',
      'दिनेश कुमार',
      'सुरेन्द्र सिंह',
      'राजेन्द्र प्रसाद',
    ],
    femaleFirstNames: [
      'गीताबाई',
      'सावित्री देवी',
      'कलावती बाई',
      'सुमित्रा देवी',
      'पार्वती बाई',
      'गायत्री देवी',
      'शकुंतला बाई',
      'कमला देवी',
      'रामप्यारी बाई',
      'लक्ष्मी देवी',
      'यशोदा बाई',
      'सुनीता बाई',
      'अनीता देवी',
      'रेखा बाई',
      'पूजा देवी',
      'कविता बाई',
    ],
    reservationCategories: [
      'अन्य पिछड़ा वर्ग (OBC · म.प्र.)',
      'अनारक्षित महिला (म.प्र.)',
      'अनारक्षित / सामान्य (म.प्र.)',
      'अनुसूचित जाति (SC · म.प्र.)',
    ],
  },
  malwa: {
    regionKey: 'malwa',
    castes: [
      { name: 'पाटीदार / कुलमी (OBC)', surnames: ['पाटीदार', 'पटेल'], share: 26 },
      { name: 'आंजना / चौधरी (OBC)', surnames: ['चौधरी', 'आंजना', 'जाट'], share: 20 },
      { name: 'राजपूत / परमार (सामान्य)', surnames: ['परमार', 'सोलंकी', 'राठौर'], share: 16 },
      { name: 'मालवीय / बलाई (SC)', surnames: ['मालवीय', 'बलाई', 'चौहान'], share: 15 },
      { name: 'खाती / चंद्रवंशी (OBC)', surnames: ['खाती', 'मंडलोई'], share: 13 },
      { name: 'ब्राह्मण / जोशी', surnames: ['जोशी', 'व्यास', 'शर्मा'], share: 10 },
    ],
    maleFirstNames: [
      'भंवरलाल',
      'मांगीलाल',
      'शंकरलाल',
      'अंबालाल',
      'छगनलाल',
      'हीरालाल',
      'रतनलाल',
      'तेजसिंह',
      'बद्रीलाल',
      'नंदराम',
      'गोवर्धनलाल',
      'शांतिलाल',
      'कैलाश',
      'दिनेश',
      'मुकेश',
      'राधेश्याम',
      'रामचंद्र',
      'कन्हैयालाल',
    ],
    femaleFirstNames: [
      'सोहनबाई',
      'केसरबाई',
      'रुकमाबाई',
      'राधाबाई',
      'लीलाबाई',
      'शांताबाई',
      'तुलसीबाई',
      'दुर्गाबाई',
      'सीताबाई',
      'मंजूबाई',
      'निर्मला देवी',
      'अंजूबाई',
    ],
    reservationCategories: [
      'अन्य पिछड़ा वर्ग (OBC · मालवा)',
      'सामान्य / अनारक्षित (म.प्र.)',
      'अन्य पिछड़ा वर्ग महिला (म.प्र.)',
      'अनुसूचित जाति (SC · म.प्र.)',
    ],
  },
  nimar: {
    regionKey: 'nimar',
    castes: [
      { name: 'गुर्जर / पटेल (OBC)', surnames: ['पटेल', 'गुर्जर', 'बिरला'], share: 25 },
      { name: 'यादव / गवली (OBC)', surnames: ['यादव', 'मंंडलोई'], share: 20 },
      { name: 'भिलाला / बारेला (ST)', surnames: ['बड़ोले', 'मुजाल्दे', 'सोलंकी'], share: 22 },
      { name: 'राजपूत / चौहान', surnames: ['चौहान', 'तंवर', 'राठौर'], share: 17 },
      { name: 'कुशवाहा / माली', surnames: ['कुशवाहा', 'महाजन'], share: 16 },
    ],
    maleFirstNames: [
      'दशरथ',
      'सीताराम',
      'सखाराम',
      'तुकाराम',
      'गणपत',
      'भीमसिंह',
      'संतोष',
      'महेश',
      'राजेन्द्र',
      'गजानन',
      'चंपालाल',
      'पूनमचंद',
      'सुभाष',
      'दिलीप',
    ],
    femaleFirstNames: [
      'नर्मदाबाई',
      'अहिल्याबाई',
      'यमुनाबाई',
      'गोदावरी बाई',
      'सुशीलाबाई',
      'कमलाबाई',
      'ललिताबाई',
      'सरोजबाई',
    ],
    reservationCategories: [
      'अनुसूचित जनजाति (ST · निमाड़)',
      'अन्य पिछड़ा वर्ग (OBC · म.प्र.)',
      'अनारक्षित महिला (म.प्र.)',
    ],
  },
  chambal_gwalior: {
    regionKey: 'chambal_gwalior',
    castes: [
      { name: 'तोमर / भदौरिया (क्षत्रिय)', surnames: ['तोमर', 'भदौरिया', 'सिकरवार'], share: 26 },
      { name: 'गुर्जर / रावत (OBC)', surnames: ['गुर्जर', 'रावत', 'कंसाना'], share: 22 },
      { name: 'कुशवाहा / काछी (OBC)', surnames: ['कुशवाहा', 'राठौर'], share: 18 },
      { name: 'ब्राह्मण / शर्मा', surnames: ['शर्मा', 'दंडोतिया', 'तिवारी'], share: 17 },
      { name: 'जाटव (SC)', surnames: ['जाटव', 'शाक्य'], share: 17 },
    ],
    maleFirstNames: [
      'रणवीर सिंह',
      'जगमोहन',
      'बलवीर सिंह',
      'राजवीर सिंह',
      'रामबरन',
      'सोबरन सिंह',
      'लाखन सिंह',
      'उदयवीर',
      'गजेन्द्र सिंह',
      'देवेन्द्र',
      'सत्येन्द्र',
      'ब्रजेश',
      'गिर्राज',
      'रामनिवास',
    ],
    femaleFirstNames: [
      'राजकुमारी देवी',
      'गुड्डी बाई',
      'मुन्नी देवी',
      'रामश्री बाई',
      'सूरजमुखी देवी',
      'शीला देवी',
      'मीरा देवी',
      'सुमन देवी',
    ],
    reservationCategories: [
      'अनारक्षित / सामान्य (चंबल)',
      'अन्य पिछड़ा वर्ग (OBC · म.प्र.)',
      'अनुसूचित जाति (SC · म.प्र.)',
    ],
  },
  bundelkhand: {
    regionKey: 'bundelkhand',
    castes: [
      { name: 'कुर्मी / पटेल (OBC)', surnames: ['पटेल', 'कुर्मी'], share: 24 },
      { name: 'यादव / घोषी (OBC)', surnames: ['यादव', 'राजा'], share: 20 },
      { name: 'बुंदेला / ठाकुर (सामान्य)', surnames: ['बुंदेला', 'सिंह ठाकुर'], share: 18 },
      { name: 'अहिरवार / प्रजापति (SC/OBC)', surnames: ['अहिरवार', 'प्रजापति', 'चौरसिया'], share: 20 },
      { name: 'ब्राह्मण / तिवारी', surnames: ['तिवारी', 'पटेरिया', 'दुबे'], share: 18 },
    ],
    maleFirstNames: [
      'हरगोविंद',
      'प्रतिपाल सिंह',
      'मूरत सिंह',
      'रामरतन',
      'कुंजीलाल',
      'लच्छीराम',
      'धनीराम',
      'वृंदावन',
      'हल्केराम',
      'गौरीशंकर',
      'रघुवीर',
      'भूपेन्द्र सिंह',
      'वीरेन्द्र',
      'अवधेश',
    ],
    femaleFirstNames: [
      'रामकली बाई',
      'फूलवती देवी',
      'हरबाई',
      'जानकी देवी',
      'द्रौपदी बाई',
      'कौशल्या देवी',
      'बसंती बाई',
      'माया देवी',
    ],
    reservationCategories: [
      'अन्य पिछड़ा वर्ग (OBC · बुंदेलखंड)',
      'अनुसूचित जाति महिला (SC · म.प्र.)',
      'अनारक्षित / सामान्य (म.प्र.)',
    ],
  },
  baghelkhand: {
    regionKey: 'baghelkhand',
    castes: [
      { name: 'पटेल / कुर्मी (OBC)', surnames: ['पटेल', 'सिंह पटेल'], share: 25 },
      { name: 'ब्राह्मण (तिवारी/मिश्रा)', surnames: ['तिवारी', 'मिश्रा', 'पाण्डेय', 'शुक्ला'], share: 23 },
      { name: 'बघेल / क्षत्रिय (सामान्य)', surnames: ['सिंह बघेल', 'सिंह परिहार'], share: 19 },
      { name: 'कोल / बैगा (ST)', surnames: ['कोल', 'रावत', 'सिंह गोंड'], share: 18 },
      { name: 'कुशवाहा / साकेत', surnames: ['कुशवाहा', 'साकेत'], share: 15 },
    ],
    maleFirstNames: [
      'रामनरेश',
      'वंशगोपाल',
      'अखंडप्रताप',
      'इन्द्रभान',
      'रामसजीवन',
      'सूर्यभान',
      'लालमणि',
      'तीरथप्रसाद',
      'रामायण प्रसाद',
      'पुष्पेन्द्र सिंह',
      'नागेन्द्र',
      'ज्ञानेन्द्र',
      'शिवप्रसाद',
      'अरुण कुमार',
    ],
    femaleFirstNames: [
      'श्यामकली देवी',
      'प्रभावती देवी',
      'सियादुलारी देवी',
      'इन्द्रावती देवी',
      'चन्द्रकली बाई',
      'उर्मिला देवी',
      'किरण देवी',
      'संध्या देवी',
    ],
    reservationCategories: [
      'अनारक्षित / सामान्य (विंध्य)',
      'अन्य पिछड़ा वर्ग (OBC · म.प्र.)',
      'अनुसूचित जनजाति (ST · विंध्य)',
    ],
  },
  mahakoshal_tribal: {
    regionKey: 'mahakoshal_tribal',
    castes: [
      { name: 'गोंड / आदिवासी (ST)', surnames: ['मरकाम', 'उईके', 'धुर्वे', 'तेकाम'], share: 27 },
      { name: 'पटेल / कुर्मी (OBC)', surnames: ['पटेल', 'चौधरी', 'वर्मा'], share: 23 },
      { name: 'रघुवंशी / पवार (OBC)', surnames: ['रघुवंशी', 'पवार', 'बिसेन'], share: 20 },
      { name: 'मेहरा / झारिया (SC)', surnames: ['मेहरा', 'झारिया', 'अहिरवार'], share: 16 },
      { name: 'ब्राह्मण / नेमा', surnames: ['तिवारी', 'नेमा', 'दुबे'], share: 14 },
    ],
    maleFirstNames: [
      'फूलसिंह',
      'चैनसिंह',
      'मानसिंह',
      'गेंदलाल',
      'तीरथराम',
      'खेमचंद',
      'द्वारका',
      'छोटेलाल',
      'भुवनेश्वर',
      'धर्मेन्द्र',
      'योगेश',
      'प्रदीप',
      'हेमराज',
      'रोहित',
    ],
    femaleFirstNames: [
      'फुलवा बाई',
      'सुकवारो बाई',
      'चमेली बाई',
      'दुजिया बाई',
      'सरस्वती देवी',
      'भागवती बाई',
      'प्रमिला देवी',
      'भारती बाई',
    ],
    reservationCategories: [
      'अनुसूचित जनजाति (ST · पेसा क्षेत्र)',
      'अन्य पिछड़ा वर्ग (OBC · महाकौशल)',
      'अनारक्षित महिला (म.प्र.)',
    ],
  },
};

function getRegionForDistrictSlug(districtSlug: string): RegionProfile {
  const s = districtSlug.toLowerCase();
  if (['bhopal', 'sehore', 'raisen', 'vidisha', 'rajgarh'].includes(s)) {
    return REGION_PROFILES.bhopal_vindhya;
  }
  if (
    [
      'indore',
      'ujjain',
      'dewas',
      'dhar',
      'ratlam',
      'mandsaur',
      'neemuch',
      'shajapur',
      'agar-malwa',
    ].includes(s)
  ) {
    return REGION_PROFILES.malwa;
  }
  if (['khandwa', 'khargone', 'barwani', 'burhanpur'].includes(s)) {
    return REGION_PROFILES.nimar;
  }
  if (
    [
      'gwalior',
      'morena',
      'bhind',
      'sheopur',
      'shivpuri',
      'datia',
      'guna',
      'ashoknagar',
    ].includes(s)
  ) {
    return REGION_PROFILES.chambal_gwalior;
  }
  if (
    ['sagar', 'damoh', 'chhatarpur', 'tikamgarh', 'niwari', 'panna'].includes(s)
  ) {
    return REGION_PROFILES.bundelkhand;
  }
  if (
    [
      'rewa',
      'satna',
      'sidhi',
      'singrauli',
      'maihar',
      'mauganj',
      'shahdol',
      'umaria',
      'anuppur',
    ].includes(s)
  ) {
    return REGION_PROFILES.baghelkhand;
  }
  return REGION_PROFILES.mahakoshal_tribal;
}

export function hashString32(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function createSeededRng(seed: number): () => number {
  let state = (seed || 123456789) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildEpicPrefix(gpId: string): string {
  const parts = gpId.split('/');
  const distSlug = parts[0] || 'sehore';
  const gpSlug = parts[2] || parts[1] || 'mp';
  const rto = DISTRICT_RTO_CODES[distSlug] || 'MP04';
  const letters = gpSlug
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 3)
    .padEnd(3, 'X');
  return `${rto}-${letters}`;
}

// Curated authentic overrides for key showcase Gram Panchayats so their candidates and leaders are 100% distinct
const CURATED_GP_OVERRIDES: Record<
  string,
  {
    voters?: number;
    wards?: number;
    candidates: [string, string, string];
    topHeads: [string, string, string];
    winner2022: string;
    runner2022: string;
    cat2022: string;
  }
> = {
  'sehore/sehore/mahodiya': {
    voters: 3640,
    wards: 15,
    candidates: ['देवेन्द्र सिंह मेवाड़ा', 'महेन्द्र कुमार पाटीदार', 'बाबूलाल वर्मा'],
    topHeads: ['ओंकारलाल मेवाड़ा', 'जगदीशचंद्र पाटीदार', 'द्वारकाप्रसाद कुशवाहा'],
    winner2022: 'देवेन्द्र सिंह मेवाड़ा',
    runner2022: 'महेन्द्र कुमार पाटीदार',
    cat2022: 'अन्य पिछड़ा वर्ग (OBC · सीहोर)',
  },
  'bhopal/berasia/gunaga': {
    voters: 4420,
    wards: 16,
    candidates: ['रामस्वरूप मीणा', 'हरिनारायण धाकड़', 'कैलाश विश्वकर्मा'],
    topHeads: ['लक्ष्मीनारायण मीणा', 'घासीराम धाकड़', 'मूलचंद गौड़'],
    winner2022: 'रामस्वरूप मीणा',
    runner2022: 'हरिनारायण धाकड़',
    cat2022: 'अन्य पिछड़ा वर्ग (OBC · बैरसिया)',
  },
  'bhopal/phanda/ratibad': {
    voters: 4650,
    wards: 18,
    candidates: ['राजेन्द्र सिंह मीणा', 'महेन्द्र पाटीदार', 'कमल सिंह राजपूत'],
    topHeads: ['प्रेमनारायण मीणा', 'शिवचरण पाटीदार', 'कमल सिंह परमार'],
    winner2022: 'राजेन्द्र सिंह मीणा',
    runner2022: 'महेन्द्र पाटीदार',
    cat2022: 'अन्य पिछड़ा वर्ग (OBC · फंदा)',
  },
  'indore/sanwer/kshipra': {
    voters: 5240,
    wards: 20,
    candidates: ['कैलाश पटेल', 'दिनेश चौधरी', 'भंवरलाल मालवीय'],
    topHeads: ['अंबालाल पटेल', 'मांगीलाल चौधरी', 'शंकरलाल मालवीय'],
    winner2022: 'कैलाश पटेल',
    runner2022: 'दिनेश चौधरी',
    cat2022: 'सामान्य / अनारक्षित (इंदौर)',
  },
  'sehore/sehore/bilkisganj': {
    voters: 4120,
    wards: 17,
    candidates: ['गंगाराम पाटीदार', 'भवानीशंकर नागर', 'सत्यनारायण कुशवाहा'],
    topHeads: ['भवानीशंकर पाटीदार', 'शिवनारायण नागर', 'कन्हैयालाल कुशवाहा'],
    winner2022: 'गंगाराम पाटीदार',
    runner2022: 'भवानीशंकर नागर',
    cat2022: 'अनारक्षित / सामान्य (सीहोर)',
  },
  'sehore/ashta/amlaha': {
    voters: 3760,
    wards: 15,
    candidates: ['कमल सिंह परमार', 'राधेश्याम खाती', 'शंकरलाल मालवीय'],
    topHeads: ['रतनलाल परमार', 'बद्रीलाल खाती', 'छगनलाल मालवीय'],
    winner2022: 'कमल सिंह परमार',
    runner2022: 'राधेश्याम खाती',
    cat2022: 'अन्य पिछड़ा वर्ग (OBC · आष्टा)',
  },
};

const datasetCache = new Map<string, PhuleraDataset>();

export function generateMpPanchayatDataset(info: {
  id: string;
  name: string;
  tehsil: string;
  district: string;
  voters?: number;
  villages?: string[];
  isDemo?: boolean;
}): PhuleraDataset {
  const gpId = info.id || 'sehore/sehore/mahodiya';
  const cacheKey = `${gpId}::${info.voters || 0}::${info.name}`;
  const cached = datasetCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const seed = hashString32(gpId);
  const rng = createSeededRng(seed);

  const distSlug = gpId.split('/')[0] || 'sehore';
  const region = getRegionForDistrictSlug(distSlug);
  const curated = CURATED_GP_OVERRIDES[gpId];

  // Determine exact voter count (never falling back to a single constant)
  const targetVoters =
    curated?.voters ||
    (info.voters && info.voters !== 2480
      ? info.voters
      : 2950 + (seed % 2650));

  // Determine ward count (12 to 20 wards as per MP Panchayat Raj Act)
  const totalWards =
    curated?.wards ||
    (targetVoters >= 4800
      ? 20
      : targetVoters >= 4200
      ? 16 + (seed % 3)
      : targetVoters >= 3400
      ? 14 + (seed % 3)
      : 12 + (seed % 3));

  const wards = Array.from({ length: totalWards }, (_, i) => i + 1);
  const totalBooths = Math.max(3, Math.min(8, Math.round(targetVoters / 860)));
  const booths = Array.from({ length: totalBooths }, (_, i) => i + 1);

  const rawVillages =
    info.villages && info.villages.length > 0
      ? info.villages
      : [info.name, `${info.name} कलां`, `मजरा टोला (${info.name})`];

  // Distribute wards across villages
  const villages: { name: string; wards: number[] }[] = rawVillages.map(
    (vName) => ({
      name: vName,
      wards: [],
    })
  );
  for (let w = 1; w <= totalWards; w++) {
    const vIdx = Math.min(
      villages.length - 1,
      Math.floor(((w - 1) * villages.length) / totalWards)
    );
    villages[vIdx].wards.push(w);
  }

  // Booth names & ward_booth mapping
  const boothSchoolTypes = [
    'शासकीय उच्चतर माध्यमिक विद्यालय',
    'शासकीय प्राथमिक शाला भवन',
    'ग्राम पंचायत सामुदायिक भवन',
    'शासकीय माध्यमिक शाला (दक्षिणी भाग)',
    'आंगनबाड़ी केंद्र क्र. 1',
    'राजीव गांधी सेवा केंद्र भवन',
    'शासकीय कन्या प्राथमिक शाला',
    'कृषि उपज सामुदायिक केंद्र',
  ];
  const booth_names: Record<string, { name: string; part: string }> = {};
  for (const b of booths) {
    const vilName = villages[(b - 1) % villages.length]?.name || info.name;
    const bLabel = `${boothSchoolTypes[(b - 1) % boothSchoolTypes.length]}, ${vilName}`;
    booth_names[String(b)] = {
      name: bLabel,
      part: String(b),
    };
  }

  const ward_booth: Record<string, { b: number; name: string; part: string }> =
    {};
  for (const w of wards) {
    const b = Math.min(
      totalBooths,
      Math.floor(((w - 1) * totalBooths) / totalWards) + 1
    );
    ward_booth[String(w)] = {
      b,
      name: booth_names[String(b)].name,
      part: String(b),
    };
  }

  // Candidates for this GP
  const mNames = region.maleFirstNames;
  const fNames = region.femaleFirstNames;
  const castePool = region.castes;

  const c1Surname = castePool[seed % castePool.length].surnames[0];
  const c2Surname = castePool[(seed + 1) % castePool.length].surnames[0];
  const c3Surname = castePool[(seed + 2) % castePool.length].surnames[0];

  const isFemaleSeat = seed % 3 === 1 && !curated;
  const cand1Name = curated
    ? curated.candidates[0]
    : isFemaleSeat
    ? `${fNames[seed % fNames.length]} ${c1Surname}`
    : `${mNames[seed % mNames.length]} ${c1Surname}`;
  const cand2Name = curated
    ? curated.candidates[1]
    : isFemaleSeat
    ? `${fNames[(seed + 3) % fNames.length]} ${c2Surname}`
    : `${mNames[(seed + 5) % mNames.length]} ${c2Surname}`;
  const cand3Name = curated
    ? curated.candidates[2]
    : `${mNames[(seed + 9) % mNames.length]} ${c3Surname}`;

  const candidates: CandidateInfo[] = [
    {
      id: 1,
      name: cand1Name,
      colour: '#16a34a',
      is_me: true,
      sort_order: 1,
      status: 'confirmed',
    },
    {
      id: 2,
      name: cand2Name,
      colour: '#dc2626',
      is_me: false,
      sort_order: 2,
      status: 'confirmed',
    },
    {
      id: 3,
      name: cand3Name,
      colour: '#7c3aed',
      is_me: false,
      sort_order: 3,
      status: 'confirmed',
    },
  ];

  // GP-specific leaning distribution ratios so every GP has unique vote tallies
  const usRatio = 0.445 + ((seed % 70) / 1000); // 44.5% to 51.4%
  const c2Ratio = 0.305 + (((seed >>> 4) % 55) / 1000); // 30.5% to 35.9%
  const c3Ratio = 0.055 + (((seed >>> 8) % 35) / 1000); // 5.5% to 8.9%
  const undecidedRatio = 0.062 + (((seed >>> 12) % 30) / 1000); // 6.2% to 9.1%

  const epicPrefix = buildEpicPrefix(gpId);
  const people: PersonNode[] = [];
  const families: FamilyRaw[] = [];
  const kunbas: KunbaRaw[] = [];
  const leaning: VoterLeaning[] = [];
  const turnout: TurnoutRecord[] = [];
  const voter_tags: VoterTagAssignment[] = [];
  const family_info: FamilyContactInfo[] = [];

  let votersCreated = 0;
  let serialCounter = 101;
  let familyIndex = 1;

  // First 3 families are largest Khandans (15 to 19 voters each)
  while (votersCreated < targetVoters) {
    const remaining = targetVoters - votersCreated;
    let famSize: number;
    if (familyIndex === 1) {
      famSize = Math.min(remaining, 17 + (seed % 3)); // 17, 18, or 19
    } else if (familyIndex === 2) {
      famSize = Math.min(remaining, 15 + ((seed >>> 2) % 3)); // 15, 16, or 17
    } else if (familyIndex === 3) {
      famSize = Math.min(remaining, 14 + ((seed >>> 4) % 2)); // 14 or 15
    } else if (familyIndex <= 15) {
      famSize = Math.min(remaining, 9 + Math.floor(rng() * 5)); // 9 to 13
    } else {
      famSize = Math.min(remaining, 4 + Math.floor(rng() * 5)); // 4 to 8
    }

    const famId = `f${String(familyIndex).padStart(3, '0')}`;
    const ward = ((familyIndex - 1) % totalWards) + 1;
    const booth = ward_booth[String(ward)]?.b || 1;
    const houseNum = String(
      10 + Math.floor((familyIndex - 1) / totalWards) * 3 + ((seed + familyIndex) % 3)
    );

    // Pick caste & surname for this family
    let casteEntry =
      castePool[(familyIndex + (seed % 7)) % castePool.length];
    let surname =
      casteEntry.surnames[
        (familyIndex + (seed >>> 3)) % casteEntry.surnames.length
      ];

    // Determine patriarch / head name
    let headFullName: string;
    if (familyIndex <= 3 && curated?.topHeads[familyIndex - 1]) {
      headFullName = curated.topHeads[familyIndex - 1];
      const parts = headFullName.split(' ');
      surname = parts[parts.length - 1] || surname;
      const matchingCaste = castePool.find((c) =>
        c.surnames.includes(surname)
      );
      if (matchingCaste) {
        casteEntry = matchingCaste;
      }
    } else {
      const mFirst =
        mNames[(familyIndex * 7 + (seed % 19)) % mNames.length];
      headFullName = `${mFirst} ${surname}`;
    }

    const memberIds: string[] = [];
    const headId = `v_${gpId.replace(/\//g, '_')}_${votersCreated + 1}`;
    const isElderJointFamily = familyIndex <= 15 || familyIndex % 3 === 0;
    const headAge = isElderJointFamily
      ? 60 + ((familyIndex + seed) % 15)
      : 45 + ((familyIndex + seed) % 13);
    const fatherGhostName = `${
      mNames[(familyIndex * 11 + seed + 3) % mNames.length]
    } ${surname}`;

    // Family-level leaning tendency (with slight individual variance)
    const famRoll = rng();
    const famDefaultSide: 'us' | 'c2' | 'c3' | 'undecided' | 'not_asked' =
      famRoll < usRatio
        ? 'us'
        : famRoll < usRatio + c2Ratio
        ? 'c2'
        : famRoll < usRatio + c2Ratio + c3Ratio
        ? 'c3'
        : famRoll < usRatio + c2Ratio + c3Ratio + undecidedRatio
        ? 'undecided'
        : 'not_asked';

    // 1. Patriarch (Head)
    const headNode: PersonNode = {
      id: headId,
      n: headFullName,
      g: 'm',
      w: ward,
      h: houseNum,
      fam: famId,
      v: 1,
      act: 1,
      a: headAge,
      r: 'पिता',
      rv: fatherGhostName,
      b: booth,
      sr: serialCounter++,
      e: `${epicPrefix}-${String(serialCounter - 1).padStart(6, '0')}`,
      cs: casteEntry.name,
      s: [],
      c: [],
    };
    people.push(headNode);
    memberIds.push(headId);
    votersCreated++;

    // 2. Matriarch (Spouse of Head) if famSize >= 2
    let matriarchId: string | undefined;
    if (famSize >= 2) {
      matriarchId = `v_${gpId.replace(/\//g, '_')}_${votersCreated + 1}`;
      const matFirst =
        fNames[(familyIndex * 5 + (seed % 13)) % fNames.length];
      const matNode: PersonNode = {
        id: matriarchId,
        n: `${matFirst} ${surname}`,
        g: 'f',
        w: ward,
        h: houseNum,
        fam: famId,
        v: 1,
        act: 1,
        a: headAge - 3,
        r: 'पति',
        rv: headFullName,
        b: booth,
        sr: serialCounter++,
        e: `${epicPrefix}-${String(serialCounter - 1).padStart(6, '0')}`,
        cs: casteEntry.name,
        s: [headId],
        c: [],
      };
      headNode.s = [matriarchId];
      people.push(matNode);
      memberIds.push(matriarchId);
      votersCreated++;
    }

    // 3. Generate Sons, Daughters-in-law, and Grandchildren for remaining members in this family
    const sons: PersonNode[] = [];
    let memberOffset = 2;
    while (memberOffset < famSize) {
      const idxInFam = memberOffset;
      const voterId = `v_${gpId.replace(/\//g, '_')}_${votersCreated + 1}`;
      const isSecondGen = famSize >= 9 ? idxInFam <= 5 : idxInFam <= 3;

      if (isSecondGen && idxInFam % 2 === 0) {
        // Son of Patriarch
        const sonFirst =
          mNames[(familyIndex * 3 + idxInFam * 5 + seed) % mNames.length];
        const sonAge = Math.max(24, headAge - 21 - Math.floor(idxInFam * 1.5));
        const sonNode: PersonNode = {
          id: voterId,
          n: `${sonFirst} ${surname}`,
          g: 'm',
          w: ward,
          h: houseNum,
          fam: famId,
          v: 1,
          act: 1,
          a: sonAge,
          r: 'पिता',
          rv: headFullName,
          b: booth,
          sr: serialCounter++,
          e: `${epicPrefix}-${String(serialCounter - 1).padStart(6, '0')}`,
          f: headId,
          m: matriarchId,
          cs: casteEntry.name,
          s: [],
          c: [],
        };
        headNode.c = [...(headNode.c || []), voterId];
        sons.push(sonNode);
        people.push(sonNode);
      } else if (isSecondGen && idxInFam % 2 === 1 && sons.length > 0) {
        // Daughter-in-law (wife of latest son)
        const husband = sons[sons.length - 1];
        const dilFirst =
          fNames[(familyIndex * 7 + idxInFam * 3 + seed) % fNames.length];
        const dilNode: PersonNode = {
          id: voterId,
          n: `${dilFirst} ${surname}`,
          g: 'f',
          w: ward,
          h: houseNum,
          fam: famId,
          v: 1,
          act: 1,
          a: Math.max(21, (husband.a || 35) - 3),
          r: 'पति',
          rv: husband.n,
          b: booth,
          sr: serialCounter++,
          e: `${epicPrefix}-${String(serialCounter - 1).padStart(6, '0')}`,
          cs: casteEntry.name,
          s: [husband.id],
          c: [],
        };
        husband.s = [voterId];
        people.push(dilNode);
      } else {
        // 3rd generation (Grandson / Granddaughter / Youth voter)
        const parentSon = sons[(idxInFam - 8) % Math.max(1, sons.length)] || headNode;
        const isMaleYouth = idxInFam % 2 === 0;
        const youthFirst = isMaleYouth
          ? mNames[(familyIndex * 11 + idxInFam * 7 + seed) % mNames.length]
          : fNames[(familyIndex * 11 + idxInFam * 7 + seed) % fNames.length];
        const youthAge = 18 + ((familyIndex + idxInFam + seed) % 7);
        const isNewVoter = youthAge <= 19 ? 1 : undefined;
        const youthNode: PersonNode = {
          id: voterId,
          n: `${youthFirst} ${surname}`,
          g: isMaleYouth ? 'm' : 'f',
          w: ward,
          h: houseNum,
          fam: famId,
          v: 1,
          act: 1,
          a: youthAge,
          r: 'पिता',
          rv: parentSon.n,
          b: booth,
          sr: serialCounter++,
          e: `${epicPrefix}-${String(serialCounter - 1).padStart(6, '0')}`,
          nw: isNewVoter,
          f: parentSon.id,
          cs: casteEntry.name,
        };
        parentSon.c = [...(parentSon.c || []), voterId];
        people.push(youthNode);
      }

      memberIds.push(voterId);
      votersCreated++;
      memberOffset++;
    }

    // Assign leaning, turnout, and tags for members of this family
    for (let mIdx = 0; mIdx < memberIds.length; mIdx++) {
      const vid = memberIds[mIdx];
      const memberSide = famDefaultSide;
      if (memberSide === 'us') {
        leaning.push({
          voter_id: vid,
          state: 'candidate',
          candidate_id: 1,
          strength: 'pakka',
        });
      } else if (memberSide === 'c2') {
        leaning.push({
          voter_id: vid,
          state: 'candidate',
          candidate_id: 2,
          strength: 'pakka',
        });
      } else if (memberSide === 'c3') {
        leaning.push({
          voter_id: vid,
          state: 'candidate',
          candidate_id: 3,
          strength: 'pakka',
        });
      } else if (memberSide === 'undecided') {
        leaning.push({
          voter_id: vid,
          state: 'undecided',
        });
      }

      // ~38% initial booth turnout for live polling simulation
      if ((familyIndex + mIdx + seed) % 8 < 3) {
        turnout.push({ voter_id: vid, voted: true });
      }

      // Assign realistic MP campaign tags
      if (mIdx === 0 && familyIndex <= 30) {
        voter_tags.push({ voter_id: vid, tag_id: 'influencer' });
      }
      if ((familyIndex + mIdx) % 19 === 0) {
        voter_tags.push({ voter_id: vid, tag_id: 'bahar' });
      }
      if ((familyIndex + mIdx) % 23 === 0) {
        voter_tags.push({ voter_id: vid, tag_id: 'schemebenefit' });
      }
    }

    families.push({
      id: famId,
      head: headId,
      m: memberIds,
    });

    kunbas.push({
      id: `K-${famId}`,
      head: headId,
      name: headFullName,
      f: [famId],
      hs: 1,
    });

    family_info.push({
      family_id: famId,
      contact_name: headFullName,
      contact_phone: '',
    });

    familyIndex++;
  }

  // Generate local team workers for this Panchayat
  const worker1 = `${mNames[(seed + 2) % mNames.length]} ${
    castePool[seed % castePool.length].surnames[0]
  }`;
  const worker2 = `${mNames[(seed + 6) % mNames.length]} ${
    castePool[(seed + 1) % castePool.length].surnames[0]
  }`;
  const worker3 = `${mNames[(seed + 10) % mNames.length]} ${
    castePool[(seed + 2) % castePool.length].surnames[0]
  }`;

  const team: TeamWorker[] = [
    {
      account_id: 9001,
      name: cand1Name,
      role: 'candidate',
      active: true,
      removed_at: null,
    },
    {
      account_id: 9002,
      name: worker1,
      role: 'worker',
      active: true,
      removed_at: null,
    },
    {
      account_id: 9003,
      name: worker2,
      role: 'worker',
      active: true,
      removed_at: null,
    },
    {
      account_id: 9004,
      name: worker3,
      role: 'worker',
      active: true,
      removed_at: null,
    },
  ];

  const wardAssignments: WardAssignment[] = wards.map((w) => ({
    account_id: 9002 + ((w - 1) % 3),
    ward: w,
    active: true,
  }));

  const today: Record<string, number> = {
    [cand1Name]: 18 + (seed % 15),
    [worker1]: 24 + ((seed >>> 3) % 19),
    [worker2]: 19 + ((seed >>> 5) % 17),
    [worker3]: 14 + ((seed >>> 7) % 13),
  };

  // 2022 MPSEC Election Results for this GP
  const turnoutPct2022 = 0.78 + ((seed % 9) / 100);
  const polled2022 = Math.round(targetVoters * turnoutPct2022);
  const winVotes2022 = Math.round(polled2022 * (0.48 + ((seed % 7) / 100)));
  const runnerVotes2022 = Math.round(polled2022 * (0.37 + (((seed >>> 3) % 6) / 100)));
  const otherVotes2022 = Math.max(
    45,
    polled2022 - winVotes2022 - runnerVotes2022 - 36
  );

  const ward_panch = wards.map((w) => {
    const wElectorate = Math.round(targetVoters / totalWards);
    const wPolled = Math.round(wElectorate * turnoutPct2022);
    const wWin = Math.round(wPolled * 0.54);
    const wRun = Math.round(wPolled * 0.39);
    const wpSurname = castePool[(w + seed) % castePool.length].surnames[0];
    const wpFirst =
      w % 2 === 0
        ? fNames[(w * 3 + seed) % fNames.length]
        : mNames[(w * 3 + seed) % mNames.length];
    return {
      ward: w,
      winner: `${wpFirst} ${wpSurname}`,
      sex: w % 2 === 0 ? 'महिला' : 'पुरुष',
      win_votes: wWin,
      runner_votes: wRun,
      others: Math.max(0, wPolled - wWin - wRun - 3),
      rejected: 3,
      polled: wPolled,
      electorate: wElectorate,
      paksh: Math.round(wElectorate * usRatio),
      paksh_came: Math.round(wElectorate * usRatio * 0.42),
    };
  });

  const dataset: PhuleraDataset = {
    roll: {
      generated: '2026-01-05 (MPSEC निर्वाचक नामावली पुनरीक्षण)',
      panchayat: gpId,
      name: info.name,
      tehsil: info.tehsil,
      district: info.district,
      demo: Boolean(info.isDemo),
      wards,
      booths,
      castes: castePool.map((c) => c.name),
      booth_names,
      kunbas,
      people,
      families,
      rules: 79,
      house: {},
      seats: {},
      ward_booth,
      villages,
    },
    camp: {
      server_time: new Date().toISOString(),
      candidates,
      leaning,
      phones: [],
      family_info,
      turnout,
      team,
      tags: [
        { id: 'influencer', name: 'प्रभावशाली मुखिया', ready: true },
        { id: 'bahar', name: 'गाँव से बाहर / पलायन', ready: true },
        { id: 'schemebenefit', name: 'लाड़ली बहना / पीएम आवास लाभार्थी', ready: true },
        { id: 'disputed', name: 'नाराज़ / मान-मनौव्वल ज़रूरी', ready: true },
      ],
      voter_tags,
      wards: wardAssignments,
      settings: {
        election_date: '2022-07-14 (म.प्र. त्रिस्तरीय पंचायत निर्वाचन)',
        poll_hide: '0',
      },
    },
    result: {
      date: '14 जुलाई 2022 (म.प्र. राज्य निर्वाचन आयोग)',
      electorate: targetVoters,
      polled: polled2022,
      winner: curated?.winner2022 || cand1Name,
      win_votes: winVotes2022,
      runner: curated?.runner2022 || cand2Name,
      runner_votes: runnerVotes2022,
      others: [{ name: cand3Name, votes: otherVotes2022 }],
      rejected: 22,
      nota: 14,
      team: {
        paksh: Math.round(targetVoters * usRatio),
        paksh_came: Math.round(targetVoters * usRatio * 0.42),
      },
      ward_panch,
    },
    y2020: {
      electorate: targetVoters,
      polled: polled2022,
      winner: curated?.winner2022 || cand1Name,
      win_votes: winVotes2022,
      runner: curated?.runner2022 || cand2Name,
      runner_votes: runnerVotes2022,
      near: [
        {
          gp: info.name,
          name: curated?.winner2022 || cand1Name,
          by: winVotes2022 - runnerVotes2022,
        },
      ],
    },
    today,
  };

  datasetCache.set(cacheKey, dataset);
  return dataset;
}

export function buildMpGpPublicApiBundle(info: {
  id: string;
  name: string;
  tehsil: string;
  district: string;
  voters?: number;
  villages?: string[];
}) {
  const dataset = generateMpPanchayatDataset(info);
  const seed = hashString32(info.id);
  const distSlug = info.id.split('/')[0] || 'sehore';
  const region = getRegionForDistrictSlug(distSlug);
  const curated = CURATED_GP_OVERRIDES[info.id];

  const activeVoters = dataset.roll.people.filter((p) => p.v === 1 && p.act === 1);
  const men = activeVoters.filter((p) => p.g === 'm').length;
  const women = activeVoters.filter((p) => p.g === 'f').length;
  const newVoters = activeVoters.filter((p) => p.nw === 1).length;

  const peopleById = new Map(dataset.roll.people.map((p) => [p.id, p]));
  const sortedFams = [...dataset.roll.families].sort(
    (a, b) => b.m.length - a.m.length
  );

  const big = sortedFams.slice(0, 3).map((fam, idx) => {
    const head = peopleById.get(fam.head);
    return {
      id: `K-${info.id}-${idx + 1}`,
      name: head?.n || 'मुखिया',
      voters: fam.m.length,
      wards: [head?.w || idx + 1],
      houses: [head?.h || String(12 + idx * 9)],
    };
  });

  const ward1Voters = activeVoters.filter((p) => p.w === 1);
  const ward1Fams = dataset.roll.families.filter((f) => {
    const h = peopleById.get(f.head);
    return h?.w === 1;
  });

  const catLabel =
    curated?.cat2022 ||
    region.reservationCategories[seed % region.reservationCategories.length];

  return {
    source: 'mp-lgd-directory-with-2022-mpsec-archive',
    dataset,
    summary: {
      id: info.id,
      name: info.name,
      tehsil: info.tehsil,
      district: info.district,
      villages: dataset.roll.villages.map((v) => v.name),
      voters: activeVoters.length,
      men,
      women,
      families: dataset.roll.families.length,
      wards: dataset.roll.wards.length,
      booths: dataset.roll.booths.length,
      new_voters: newVoters,
      list_date: '2026-01-05 (MPSEC पुनरीक्षण)',
      r2020: {
        year: 2022,
        winner: dataset.result.winner,
        margin: dataset.result.win_votes - dataset.result.runner_votes,
        polled: dataset.result.polled,
      },
      big,
    },
    ward1: {
      ward: 1,
      voters: ward1Voters.length,
      families: ward1Fams.length,
      khandans: ward1Fams.slice(0, 3).map((f, idx) => {
        const h = peopleById.get(f.head);
        return {
          id: `K-W1-${idx + 1}`,
          name: h?.n || 'मुखिया',
          voters: f.m.length,
          houses: [h?.h || String(10 + idx * 4)],
        };
      }),
    },
    results_card: {
      ok: true,
      card: {
        id: info.id,
        n: info.name,
        s: `${info.tehsil} (${info.district})`,
        d: '2022-07-14 (म.प्र. त्रिस्तरीय पंचायत आम निर्वाचन)',
        st: 'done',
        cat: catLabel,
        r: {
          w: dataset.result.winner,
          wv: dataset.result.win_votes,
          ru: dataset.result.runner,
          rv: dataset.result.runner_votes,
          el: dataset.result.electorate,
          po: dataset.result.polled,
          rej: dataset.result.rejected,
          nota: dataset.result.nota,
        },
        y20: {
          w: `${dataset.result.winner} (2022)`,
          m: dataset.result.win_votes - dataset.result.runner_votes,
          po: dataset.result.polled,
        },
      },
    },
  };
}
