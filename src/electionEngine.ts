import {
  FamilySummary,
  PersonNode,
  PhuleraDataset,
  SideKey,
  VanshavaliTreeNode,
  VoterLeaning,
  VoteTally,
} from './types';
import { matchesSearchQuery } from './hindiSearch';

export function classifyVoterSide(leaning?: VoterLeaning): SideKey {
  if (!leaning) return 'not_asked';
  if (leaning.state === 'candidate') {
    if (leaning.candidate_id === 1) return 'us';
    if (leaning.candidate_id === 2) return 'c2';
    if (leaning.candidate_id === 3) return 'c3';
    return 'them';
  }
  if (leaning.state === 'undecided') return 'undecided';
  if (leaning.state === 'no_vote') return 'no_vote';
  return 'not_asked';
}

export function computeVoteTally(
  people: PersonNode[],
  leaningMap: Map<string, VoterLeaning>
): VoteTally {
  const activeVoters = people.filter((p) => p.v === 1 && p.act === 1);
  let us = 0;
  let c2 = 0;
  let c3 = 0;
  let undecided = 0;
  let no_vote = 0;
  let not_asked = 0;

  for (const v of activeVoters) {
    const side = classifyVoterSide(leaningMap.get(v.id));
    if (side === 'us') us++;
    else if (side === 'c2') c2++;
    else if (side === 'c3' || side === 'them') c3++;
    else if (side === 'undecided') undecided++;
    else if (side === 'no_vote') no_vote++;
    else not_asked++;
  }

  const them = c2 + c3;
  // In Sarpanch Jeeto dashboard, "197 वोट से आगे" is us (1105) - them (908) = 197
  const leadMargin = us - them;

  return {
    totalVoters: activeVoters.length,
    us,
    them,
    c2,
    c3,
    undecided,
    no_vote,
    not_asked,
    leadMargin,
  };
}

export function buildFamilySummaries(
  dataset: PhuleraDataset,
  leaningMap: Map<string, VoterLeaning>,
  turnoutSet: Set<string>,
  voterTagsMap: Map<string, string[]>,
  casteOverrides?: Map<string, string>,
  contactOverrides?: Map<string, { name: string; phone: string }>
): FamilySummary[] {
  const { roll, camp } = dataset;
  const peopleById = new Map<string, PersonNode>();
  for (const p of roll.people) {
    peopleById.set(p.id, p);
  }

  const kunbaByFam = new Map<string, string>();
  for (const k of roll.kunbas || []) {
    for (const fid of k.f) {
      kunbaByFam.set(fid, k.name);
    }
  }

  const contactByFam = new Map<string, { name: string; phone: string }>();
  for (const info of camp.family_info || []) {
    const rawPhone = (info.contact_phone || '').trim();
    const cleanPhone = rawPhone === '9876543210' ? '' : rawPhone;
    contactByFam.set(info.family_id, {
      name: info.contact_name,
      phone: cleanPhone,
    });
  }
  if (contactOverrides) {
    for (const [fid, val] of contactOverrides.entries()) {
      contactByFam.set(fid, val);
    }
  }

  const summaries: FamilySummary[] = [];

  for (const fam of roll.families) {
    const memberNodes = fam.m
      .map((id) => peopleById.get(id))
      .filter((n): n is PersonNode => Boolean(n));
    const activeVoters = memberNodes.filter((n) => n.v === 1 && n.act === 1);
    if (activeVoters.length === 0) continue;

    const headNode = peopleById.get(fam.head);
    const headName = kunbaByFam.get(fam.id) || headNode?.n || activeVoters[0].n;
    const firstVoter = activeVoters[0];
    const ward = firstVoter.w;
    const house = firstVoter.h;
    const booth = firstVoter.b || roll.ward_booth[String(ward)]?.b || 1;
    const boothName =
      roll.booth_names[String(booth)]?.name ||
      roll.ward_booth[String(ward)]?.name ||
      `बूथ ${booth}`;
    const caste =
      casteOverrides?.get(fam.id) ||
      activeVoters.find((v) => v.cs)?.cs ||
      'सामान्य';

    let us = 0;
    let c2 = 0;
    let c3 = 0;
    let undecided = 0;
    let no_vote = 0;
    let not_asked = 0;
    let votedCount = 0;
    let newVotersCount = 0;
    const tagSet = new Set<string>();

    for (const v of activeVoters) {
      const side = classifyVoterSide(leaningMap.get(v.id));
      if (side === 'us') us++;
      else if (side === 'c2') c2++;
      else if (side === 'c3' || side === 'them') c3++;
      else if (side === 'undecided') undecided++;
      else if (side === 'no_vote') no_vote++;
      else not_asked++;

      if (turnoutSet.has(v.id)) votedCount++;
      if (v.nw === 1) newVotersCount++;

      const vTags = voterTagsMap.get(v.id) || [];
      for (const tid of vTags) tagSet.add(tid);
    }

    const contact = contactByFam.get(fam.id) || {
      name: activeVoters[0].n,
      phone: '',
    };

    const cleanHead = headName.endsWith(' देवी')
      ? headName
      : `${headName} जी`;

    summaries.push({
      id: fam.id,
      headId: fam.head,
      headName,
      displayTitle: `${cleanHead} का परिवार`,
      ward,
      house,
      caste,
      booth,
      boothName,
      totalVoters: activeVoters.length,
      newVotersCount,
      votedCount,
      contactName: contact.name,
      contactPhone: contact.phone,
      counts: {
        us,
        them: c2 + c3,
        c2,
        c3,
        undecided,
        no_vote,
        not_asked,
      },
      tags: Array.from(tagSet),
      memberIds: fam.m,
      voters: activeVoters.sort((a, b) => (a.sr || 0) - (b.sr || 0)),
    });
  }

  return summaries;
}

export function buildVanshavaliTree(
  familyId: string,
  dataset: PhuleraDataset,
  leaningMap: Map<string, VoterLeaning>,
  turnoutSet: Set<string>,
  voterTagsMap: Map<string, string[]>
): VanshavaliTreeNode[] {
  const fam = dataset.roll.families.find((f) => f.id === familyId);
  if (!fam) return [];

  const peopleById = new Map<string, PersonNode>();
  for (const p of dataset.roll.people) {
    peopleById.set(p.id, p);
  }

  const familyMembers = fam.m;
  const memberSet = new Set(familyMembers);
  const visited = new Set<string>();

  function buildNode(personId: string): VanshavaliTreeNode | null {
    if (visited.has(personId)) return null;
    const person = peopleById.get(personId);
    if (!person) return null;
    visited.add(personId);

    const spouses: PersonNode[] = [];
    for (const spId of person.s || []) {
      if (memberSet.has(spId) && !visited.has(spId)) {
        const spNode = peopleById.get(spId);
        if (spNode) {
          visited.add(spId);
          spouses.push(spNode);
        }
      }
    }

    // Collect children from primary + spouses
    const childIds = new Set<string>();
    for (const cid of person.c || []) {
      if (memberSet.has(cid)) childIds.add(cid);
    }
    for (const sp of spouses) {
      for (const cid of sp.c || []) {
        if (memberSet.has(cid)) childIds.add(cid);
      }
    }
    // Also find any member in fam whose father `f` or mother `m` is person or spouse
    for (const mid of familyMembers) {
      const mNode = peopleById.get(mid);
      if (!mNode) continue;
      if (
        mNode.f === person.id ||
        mNode.m === person.id ||
        spouses.some((sp) => mNode.f === sp.id || mNode.m === sp.id)
      ) {
        childIds.add(mid);
      }
    }

    // Sort children by age descending
    const sortedChildIds = Array.from(childIds).sort((a, b) => {
      const pa = peopleById.get(a);
      const pb = peopleById.get(b);
      return (pb?.a || 0) - (pa?.a || 0);
    });

    const children: VanshavaliTreeNode[] = [];
    for (const cid of sortedChildIds) {
      if (!visited.has(cid)) {
        const cTree = buildNode(cid);
        if (cTree) children.push(cTree);
      }
    }

    const isGhost = person.v !== 1;
    const tags = voterTagsMap.get(person.id) || [];
    const leaning = classifyVoterSide(leaningMap.get(person.id));
    const voted = turnoutSet.has(person.id);

    return {
      primary: person,
      spouses,
      children,
      isGhost,
      tags,
      leaning,
      voted,
    };
  }

  const roots: VanshavaliTreeNode[] = [];

  // Start with family head if present
  if (fam.head && memberSet.has(fam.head)) {
    const headTree = buildNode(fam.head);
    if (headTree) roots.push(headTree);
  }

  // Add any remaining unvisited members (e.g. elderly matriarch like कलावती देवी 79 whose husband was रामनारायण)
  const remaining = fam.m
    .filter((id) => !visited.has(id))
    .sort((a, b) => {
      const pa = peopleById.get(a);
      const pb = peopleById.get(b);
      return (pb?.a || 0) - (pa?.a || 0);
    });

  for (const remId of remaining) {
    if (!visited.has(remId)) {
      const node = buildNode(remId);
      if (node) roots.push(node);
    }
  }

  return roots;
}

export interface PanchayatDemographics {
  totalVoters: number;
  totalFamilies: number;
  totalVillages: number;
  totalWards: number;
  totalBooths: number;
  newVoters: number;
  maleVoters: number;
  femaleVoters: number;
  familySizeBuckets: {
    b1_3: number;
    b4_6: number;
    b7_9: number;
    b10_plus: number;
  };
  khasVoters: {
    mukhiyaCount: number;
    newVotersCount: number;
    youthCount: number;
    seniorCount: number;
    largestFamilySize: number;
    avgFamilySize: string;
  };
  ageBuckets: {
    a18_25: number;
    a26_40: number;
    a41_60: number;
    a60_plus: number;
  };
  winCalculation: {
    turnoutPercent2020: number;
    expectedPolledVotes: number;
    safeWinTarget: number;
    winner2020: string;
    margin2020: number;
    winVotes2020: number;
  };
  villageStats: {
    name: string;
    wards: number[];
    voters: number;
    percent: number;
    color: string;
  }[];
  wardStats: {
    ward: number;
    booth: number;
    boothName: string;
    voters: number;
    families: number;
    newVoters: number;
  }[];
  boothStats: {
    booth: number;
    name: string;
    voters: number;
  }[];
  casteStats: {
    caste: string;
    voters: number;
    families: number;
    percent: number;
  }[];
}

export function computePanchayatDemographics(
  dataset: PhuleraDataset
): PanchayatDemographics {
  const { roll, y2020 } = dataset;
  const activeVoters = roll.people.filter((p) => p.v === 1 && p.act === 1);
  const totalVoters = activeVoters.length;
  const totalFamilies = roll.families.length;
  const totalVillages = roll.villages.length;
  const totalWards = roll.wards.length;
  const totalBooths = roll.booths.length;
  const newVoters = activeVoters.filter((p) => p.nw === 1).length;
  const maleVoters = activeVoters.filter((p) => p.g === 'm').length;
  const femaleVoters = activeVoters.filter((p) => p.g === 'f').length;

  let b1_3 = 0;
  let b4_6 = 0;
  let b7_9 = 0;
  let b10_plus = 0;
  let largestFamilySize = 0;

  const activeVoterIdSet = new Set(activeVoters.map((p) => p.id));
  for (const fam of roll.families) {
    const sz = fam.m.filter((id) => activeVoterIdSet.has(id)).length;
    if (sz > largestFamilySize) largestFamilySize = sz;
    if (sz <= 3) b1_3++;
    else if (sz <= 6) b4_6++;
    else if (sz <= 9) b7_9++;
    else b10_plus++;
  }

  let a18_25 = 0;
  let a26_40 = 0;
  let a41_60 = 0;
  let a60_plus = 0;

  for (const p of activeVoters) {
    const age = p.a || 35;
    if (age <= 25) a18_25++;
    else if (age <= 40) a26_40++;
    else if (age <= 60) a41_60++;
    else a60_plus++;
  }

  const avgFamilySize =
    totalFamilies > 0 ? (totalVoters / totalFamilies).toFixed(1) : '6.0';

  const turnoutPercent2020 = Math.round((y2020.polled / y2020.electorate) * 100);
  const expectedPolledVotes = Math.round((totalVoters * y2020.polled) / y2020.electorate);
  const safeWinTarget = Math.floor(expectedPolledVotes / 2) + 1;

  const villageColors = ['#2563EB', '#EA580C', '#0D9488', '#7C3AED'];
  const villageStats = roll.villages.map((v, idx) => {
    const wardSet = new Set(v.wards);
    const vCount = activeVoters.filter((p) => wardSet.has(p.w)).length;
    return {
      name: v.name,
      wards: v.wards,
      voters: vCount,
      percent: Math.round((vCount / totalVoters) * 100),
      color: villageColors[idx % villageColors.length],
    };
  });

  const wardStats = roll.wards.map((w) => {
    const wVoters = activeVoters.filter((p) => p.w === w);
    const famIds = new Set(wVoters.map((p) => p.fam));
    const wb = roll.ward_booth[String(w)] || { b: 1, name: 'बूथ 1' };
    return {
      ward: w,
      booth: wb.b,
      boothName: wb.name,
      voters: wVoters.length,
      families: famIds.size,
      newVoters: wVoters.filter((p) => p.nw === 1).length,
    };
  });

  const boothStats = roll.booths.map((b) => {
    const bVoters = activeVoters.filter((p) => p.b === b);
    return {
      booth: b,
      name: roll.booth_names[String(b)]?.name || `बूथ ${b}`,
      voters: bVoters.length,
    };
  });

  const casteMap = new Map<string, { voters: number; famSet: Set<string> }>();
  for (const v of activeVoters) {
    const cs = v.cs || 'अन्य';
    const curr = casteMap.get(cs) || { voters: 0, famSet: new Set<string>() };
    curr.voters++;
    curr.famSet.add(v.fam);
    casteMap.set(cs, curr);
  }

  const casteStats = Array.from(casteMap.entries())
    .map(([caste, info]) => ({
      caste,
      voters: info.voters,
      families: info.famSet.size,
      percent: Math.round((info.voters / totalVoters) * 100),
    }))
    .sort((a, b) => b.voters - a.voters);

  return {
    totalVoters,
    totalFamilies,
    totalVillages,
    totalWards,
    totalBooths,
    newVoters,
    maleVoters,
    femaleVoters,
    familySizeBuckets: {
      b1_3,
      b4_6,
      b7_9,
      b10_plus,
    },
    khasVoters: {
      mukhiyaCount: totalFamilies,
      newVotersCount: newVoters,
      youthCount: a18_25,
      seniorCount: a60_plus,
      largestFamilySize,
      avgFamilySize,
    },
    ageBuckets: {
      a18_25,
      a26_40,
      a41_60,
      a60_plus,
    },
    winCalculation: {
      turnoutPercent2020,
      expectedPolledVotes,
      safeWinTarget,
      winner2020: y2020.winner,
      margin2020: y2020.win_votes - y2020.runner_votes,
      winVotes2020: y2020.win_votes,
    },
    villageStats,
    wardStats,
    boothStats,
    casteStats,
  };
}

export interface FamilyFilterOptions {
  query?: string;
  ward?: number | null;
  tag?: string | null;
  side?: SideKey | null;
  sortBy?: 'size_desc' | 'house_asc' | 'side_desc';
}

export function filterAndSortFamilies(
  families: FamilySummary[],
  options: FamilyFilterOptions
): FamilySummary[] {
  const q = (options.query || '').trim();

  const filtered = families.filter((fam) => {
    if (options.ward && fam.ward !== options.ward) return false;
    if (options.tag && !fam.tags.includes(options.tag)) return false;
    if (options.side) {
      if (fam.counts[options.side] <= 0) return false;
    }
    if (q) {
      const famMatches = matchesSearchQuery(
        [
          fam.displayTitle,
          fam.headName,
          fam.house,
          `मकान ${fam.house}`,
          `वार्ड ${fam.ward}`,
          fam.caste,
          fam.boothName,
          ...fam.voters.map(
            (v) => `${v.n} ${v.rv || ''} ${v.e || ''} ${v.sr || ''}`
          ),
        ],
        q
      );
      if (!famMatches) {
        return false;
      }
    }
    return true;
  });

  const sortBy = options.sortBy || (options.side ? 'side_desc' : 'size_desc');
  return [...filtered].sort((a, b) => {
    if (sortBy === 'side_desc' && options.side) {
      const diff = b.counts[options.side] - a.counts[options.side];
      if (diff !== 0) return diff;
    }
    if (sortBy === 'house_asc') {
      if (a.ward !== b.ward) return a.ward - b.ward;
      return (parseInt(a.house, 10) || 0) - (parseInt(b.house, 10) || 0);
    }
    if (b.totalVoters !== a.totalVoters) {
      return b.totalVoters - a.totalVoters;
    }
    return a.id.localeCompare(b.id);
  });
}
