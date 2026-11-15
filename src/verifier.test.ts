import assert from 'node:assert/strict';
import test from 'node:test';
import { runAutomatedVerificationChecks } from './llmCouncil';
import { generateMpPanchayatDataset } from './mpPanchayatGenerator';

test('Verifier Gate enforces 12/12 Karpathy LLM Council checks and zero fake phones', () => {
  const ds = generateMpPanchayatDataset({
    id: 'sehore/sehore/mahodiya',
    name: 'महौदिया',
    tehsil: 'सीहोर जनपद',
    district: 'सीहोर (मध्य प्रदेश)',
    voters: 3640,
    villages: ['महौदिया', 'सिरपड़ी', 'बड़ियाखेड़ी'],
    isDemo: false,
  });

  const checks = runAutomatedVerificationChecks(ds, 55, 9);
  assert.equal(checks.length, 12);
  for (const check of checks) {
    assert.equal(check.passed, true, `Failed check: ${check.id}`);
  }
});
