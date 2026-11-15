export interface PersonNode {
  id: string; // e.g., 'v0001' or 'G132' (ghost patriarch)
  n: string; // Name in Hindi
  g: 'm' | 'f'; // Gender
  w: number; // Ward number
  h: string; // House number
  fam: string; // Family ID e.g. 'f140'
  v?: number; // 1 if registered voter, undefined if ghost ancestor
  act?: number; // 1 if active voter
  a?: number; // Age
  r?: string; // Relation ('पिता' | 'पति' | 'माता')
  rv?: string; // Relative name
  b?: number; // Booth number
  sr?: number; // Serial number on electoral roll
  e?: string; // EPIC Voter ID e.g. 'DEMO-000827'
  nw?: number; // 1 if new voter (18-19 yrs)
  f?: string; // Father node ID
  m?: string; // Mother node ID
  s?: string[]; // Spouse node IDs
  c?: string[]; // Children node IDs
  cs?: string; // Caste name
}

export interface FamilyRaw {
  id: string; // 'f001'
  head: string; // 'G1' or 'v0037'
  m: string[]; // Member node IDs
}

export interface KunbaRaw {
  id: string; // 'K-f001'
  head: string;
  name: string;
  f: string[];
  hs: number;
}

export interface CandidateInfo {
  id: number;
  name: string;
  colour: string;
  is_me: boolean;
  sort_order: number;
  status: string;
}

export type LeaningState = 'candidate' | 'undecided' | 'no_vote' | 'not_asked';

export interface VoterLeaning {
  voter_id: string;
  state: LeaningState;
  candidate_id?: number;
  strength?: string;
}

export interface FamilyContactInfo {
  family_id: string;
  contact_name: string;
  contact_phone: string;
}

export interface TurnoutRecord {
  voter_id: string;
  voted: boolean;
  set_by?: number;
  set_at?: string;
}

export interface VoterTagDef {
  id: string;
  name: string;
  ready: boolean;
}

export interface VoterTagAssignment {
  voter_id: string;
  tag_id: string;
}

export interface TeamWorker {
  account_id: number;
  name: string;
  role: 'candidate' | 'worker';
  active: boolean;
  removed_at: string | null;
}

export interface WardAssignment {
  account_id: number;
  ward: number;
  active: boolean;
}

export interface PhuleraDataset {
  roll: {
    generated: string;
    panchayat: string;
    name: string;
    tehsil: string;
    district: string;
    demo: boolean;
    wards: number[];
    booths: number[];
    castes: string[];
    booth_names: Record<string, { name: string; part: string }>;
    kunbas: KunbaRaw[];
    people: PersonNode[];
    families: FamilyRaw[];
    rules: number;
    house: Record<string, unknown>;
    seats: Record<string, number[]>;
    ward_booth: Record<string, { b: number; name: string; part: string }>;
    villages: { name: string; wards: number[] }[];
  };
  camp: {
    server_time?: string;
    candidates: CandidateInfo[];
    leaning: VoterLeaning[];
    phones: { voter_id: string; phone: string }[];
    family_info: FamilyContactInfo[];
    turnout: TurnoutRecord[];
    team: TeamWorker[];
    tags: VoterTagDef[];
    voter_tags: VoterTagAssignment[];
    wards: WardAssignment[];
    settings: { election_date: string; poll_hide: string };
  };
  result: {
    date: string;
    electorate: number;
    polled: number;
    winner: string;
    win_votes: number;
    runner: string;
    runner_votes: number;
    others: { name: string; votes: number }[];
    rejected: number;
    nota: number;
    team: { paksh: number; paksh_came: number };
    ward_panch: {
      ward: number;
      winner: string;
      sex: string;
      win_votes: number;
      runner_votes: number;
      others: number;
      rejected: number;
      polled: number;
      electorate: number;
      paksh: number;
      paksh_came: number;
    }[];
  };
  y2020: {
    electorate: number;
    polled: number;
    winner: string;
    win_votes: number;
    runner: string;
    runner_votes: number;
    near: { gp: string; name: string; by: number }[];
  };
  today: Record<string, number>;
}

export interface VoteTally {
  totalVoters: number;
  us: number; // पक्ष (Manju Devi)
  them: number; // विपक्ष total (Kranti Devi + Binod)
  c2: number; // क्रांति देवी
  c3: number; // बिनोद
  undecided: number; // डांवाडोल
  no_vote: number; // वोट नहीं
  not_asked: number; // बात बाकी
  leadMargin: number; // us - c2 (or max opponent)
}

export interface FamilySummary {
  id: string;
  headId: string;
  headName: string; // e.g. 'रामनारायण'
  displayTitle: string; // e.g. 'रामनारायण जी का परिवार'
  ward: number;
  house: string;
  caste: string;
  booth: number;
  boothName: string;
  totalVoters: number;
  newVotersCount: number;
  votedCount: number;
  contactName: string;
  contactPhone: string;
  counts: {
    us: number;
    them: number;
    c2: number;
    c3: number;
    undecided: number;
    no_vote: number;
    not_asked: number;
  };
  tags: string[]; // distinct tag IDs present in this family
  memberIds: string[];
  voters: PersonNode[];
}

export interface VanshavaliTreeNode {
  primary: PersonNode;
  spouses: PersonNode[];
  children: VanshavaliTreeNode[];
  isGhost: boolean;
  tags: string[];
  leaning: SideKey;
  voted: boolean;
}

export type SideKey = 'us' | 'them' | 'c2' | 'c3' | 'undecided' | 'no_vote' | 'not_asked';

export type ElectionTierKey = 'sarpanch' | 'samiti' | 'zila' | 'ward';

export interface ParchiSettings {
  perPage: 4 | 6 | 8;
  showPoster: boolean;
  posterTagline: string;
  symbolText: string;
}

export type AppRoute =
  | { screen: 'landing' }
  | { screen: 'home' }
  | { screen: 'kaam' }
  | { screen: 'escalated' }
  | { screen: 'parivar'; ward?: number; tag?: string }
  | { screen: 'family'; familyId: string }
  | { screen: 'parchis'; ward?: number; familyId?: string }
  | { screen: 'parchi_view'; familyId: string }
  | { screen: 'side'; side: SideKey; fromKaam?: boolean }
  | { screen: 'janen'; tab?: 'all' | 'ward' | 'caste' }
  | { screen: 'poll'; tab?: 'parchi' | 'serial' | 'hisab'; familyId?: string }
  | { screen: 'result'; districtSlug?: string; blockSlug?: string; gpId?: string; tab?: 'zila' | 'samiti' | 'sarpanch' | 'ward' }
  | { screen: 'team' }
  | { screen: 'start'; districtSlug?: string; blockSlug?: string; gpId?: string }
  | { screen: 'chunav' }
  | { screen: 'pick'; electionType: 'sarpanch' | 'ward'; districtSlug?: string }
  | { screen: 'wardpick'; gpId: string; gpName: string; tehsil: string; district: string; voters: number; villages: string[] }
  | { screen: 'seats'; kind: 'samiti' | 'zila'; districtSlug?: string; blockSlug?: string }
  | { screen: 'plans'; title: string; subtitle: string; gpCount: number; voters: number; gpToActivate?: { id: string; name: string; tehsil: string; district: string; voters: number; villages: string[] } }
  | { screen: 'jhalak'; gpId: string; gpName: string; tehsil: string; district: string; voters: number; villages: string[]; step?: number }
  | { screen: 'search'; ward?: number; ageBracket?: '18-25' | '26-40' | '41-60' | '60+'; initialQuery?: string }
  | { screen: 'makan'; ward?: number; house?: string }
  | { screen: 'jati'; ward?: number }
  | { screen: 'ummidwar' }
  | { screen: 'parchiset' }
  | { screen: 'tick' }
  | { screen: 'more' }
  | { screen: 'chat' }
  | { screen: 'refer' }
  | { screen: 'vansh' }
  | { screen: 'xray'; tab?: 'overview' | 'vanshavali' | 'api' | 'schema' };

export interface PlanItem {
  key: string;
  name: string;
  price_paise: number;
  available: boolean;
  blurb: string;
}


