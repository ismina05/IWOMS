const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Repository, UNIT } = require('../app/workflow.js');
const preparation = require('../app/preparation.js');
const results = [];
class Storage {
  constructor() { this.map = new Map(); this.fail = false; }
  getItem(key) { return this.map.get(key) || null; }
  setItem(key, value) { if (this.fail) throw new Error('Storage full'); this.map.set(key, value); }
}
const actor = role => ({ id: 'demo:' + role, role, unitId: UNIT, name: 'Uji ' + role });
const proposal = { nama_wo: 'Uji persiapan', lokasi: 'Tiang uji', katalog_id: 'KAT-01', proses_bisnis: 'PDKB', uraian: 'Data sintetis' };
const payloads = {
  JSA: { steps: 'Persiapan dan pekerjaan', hazards: 'Bahaya listrik', controls: 'Pengendalian sesuai SOP', responsible: 'Regu uji' },
  IBPPR: { hazards: 'Bahaya listrik', riskAssessment: 'Penilaian awal tinggi', controls: 'Pengendalian sesuai SOP', residualRisk: 'Penilaian akhir terkendali', responsible: 'Regu uji' },
  HEIGHT_PERMIT: { scope: 'Pekerjaan pada tiang', workLocation: 'Tiang uji', workers: 'Regu A', hazards: 'Jatuh dari ketinggian', precautions: 'APD dan prosedur sesuai SOP' },
};
function fixture() {
  const storage = new Storage(); const repo = new Repository(storage);
  function run(action, data = {}, role, requestOverrides = {}) {
    const wo = repo.state.orders[0];
    const config = preparation.configuration(wo || {});
    const doc = wo && preparation.latestDocument(repo.state, wo, config.documentType);
    const active = repo.state.tasks[0];
    return repo.command({ action, data: { reason: 'Catatan uji ' + action, ...(doc ? { documentVersionId: doc.id } : {}), ...data }, woId: wo?.id, expectedVersion: wo?.version, idempotencyKey: crypto.randomUUID(), ...requestOverrides }, actor(role || active?.role || 'tl_op'));
  }
  run('create', proposal, 'tl_op'); run('submit', proposal);
  run('approve'); run('approve'); run('approve');
  run('priority', { priority: 'Normal', workPlan: 'Laksanakan survei' });
  run('survey', { surveyDate: '2026-11-19', location: 'Tiang A', findings: 'Kondisi terukur', access: 'Akses umum', equipment: 'Peralatan', material: 'Material' });
  run('analysis', { jsa: 'Analisis awal', ibppr: 'Analisis awal' });
  run('feasibility', { decision: 'feasible' });
  run('plan', { date: '2026-12-01', time: '09:00', personnel: 'Regu A dan B', method: 'Sesuai SOP' });
  return { repo, storage, run };
}
function graphCheck(repo) {
  for (const event of repo.state.audits) {
    let node = event.nodeId;
    for (const edgeId of event.edgeIds) {
      const edge = preparation.graph.edges.find(item => item.id === edgeId);
      assert.ok(edge, edgeId); assert.equal(edge.source, node, event.action + ' ' + edgeId); node = edge.target;
    }
    assert.equal(node, event.nextNodeId, event.action);
  }
}
function test(name, run) {
  run(); results.push({ name, status: 'PASS' }); console.log('PASS', name);
}
function approveDocument(f, type) { f.run('document-submit', payloads[type]); for (let i = 0; i < (type === 'HEIGHT_PERMIT' ? 4 : 2); i++) f.run('document-approve'); }
function reachAuthority(f, height = false) {
  approveDocument(f, 'JSA'); approveDocument(f, 'IBPPR');
  f.run(height ? 'height-needed' : 'height-not-needed');
  if (height) { approveDocument(f, 'HEIGHT_PERMIT'); f.run('height-record'); }
}
function person(id, valid = true) {
  return { personId: id, name: 'Personel ' + id, duty: 'Pelaksana', requiredCompetence: 'PDKB-TM', certificateNo: 'SK-' + id, competence: 'PDKB-TM', validFrom: '2026-01-01', validUntil: valid ? '2027-12-31' : '2026-01-02', evidence: 'Berkas surat ' + id };
}
if (require.main === module) {
for (const hold of preparation.holds) {
  for (const outcome of ['resolved', 'temporary', 'cancel-approved', 'cancel-rejected']) {
    test(hold.id + ' ' + outcome, () => {
      const f = fixture(); const wo = f.repo.state.orders[0];
      wo.stage = 'preparation'; wo.nodeId = 'Node_hold_' + hold.suffix; wo.status = 'Hold Review';
      wo.pendingHold = { cause: hold.suffix, originNodeId: wo.nodeId, reason: 'Fixture kendala' };
      f.storage.setItem(f.repo.key, JSON.stringify(f.repo.state)); f.repo.reload();
      const id = wo.id;
      const previousDocuments = JSON.parse(JSON.stringify(f.repo.state.documents));
      f.run('hold-establish'); assert.equal(f.repo.state.tasks[0].role, hold.coordinator);
      f.run('hold-fulfill');
      if (outcome === 'resolved') { f.run('hold-resolved'); f.run('hold-resume'); assert.equal(f.repo.state.orders[0].nodeId, hold.resumeNodeId); }
      if (outcome === 'temporary') { f.run('hold-temporary'); assert.equal(f.repo.state.orders[0].nodeId, 'Node_atasi_' + hold.suffix); }
      if (outcome.startsWith('cancel-')) {
        f.run('hold-permanent'); assert.equal(f.repo.state.tasks[0].role, 'supervisor_pdkb');
        f.run('hold-request-cancel'); assert.equal(f.repo.state.tasks[0].role, 'manajer_area');
        f.run(outcome === 'cancel-approved' ? 'hold-approve-cancel' : 'hold-reject-cancel');
        assert.equal(f.repo.state.orders[0].nodeId, outcome === 'cancel-approved' ? 'Node_end_batal_' + hold.suffix : 'Node_atasi_' + hold.suffix);
        if (outcome === 'cancel-approved') assert.equal(f.repo.state.tasks.length, 0);
      }
      assert.equal(f.repo.state.orders[0].id, id); assert.equal(f.repo.state.orders[0].surveyVersions.length, 1);
      assert.deepEqual(f.repo.state.documents, previousDocuments);
      graphCheck(f.repo);
    });
  }
}
for (const type of ['JSA', 'IBPPR']) {
  for (const reviewer of ['k3', 'asman']) {
    test(type + ' rejection at ' + reviewer + ', immutable prior version and hold recovery', () => {
      const f = fixture(); if (type === 'IBPPR') approveDocument(f, 'JSA');
      f.run('document-submit', payloads[type]); if (reviewer === 'asman') f.run('document-approve');
      f.run('document-reject'); const old = copyLatest(f, type);
      f.run('document-unrepairable'); f.run('hold-establish'); f.run('hold-fulfill'); f.run('hold-resolved'); f.run('hold-resume');
      f.run('document-submit', { ...payloads[type], controls: 'Pengendalian hasil perbaikan' });
      assert.deepEqual(f.repo.state.documents.find(doc => doc.id === old.id), old);
      f.run('document-approve'); f.run('document-approve');
      assert.equal(preparation.latestDocument(f.repo.state, f.repo.state.orders[0], type).version, 2);
      graphCheck(f.repo);
    });
  }
}
function copyLatest(f, type) { return JSON.parse(JSON.stringify(preparation.latestDocument(f.repo.state, f.repo.state.orders[0], type))); }
for (let reviewer = 0; reviewer < 4; reviewer++) {
  test('height permit rejection at reviewer ' + (reviewer + 1) + ' returns to K3 in new version', () => {
    const f = fixture(); approveDocument(f, 'JSA'); approveDocument(f, 'IBPPR'); f.run('height-needed');
    f.run('document-submit', payloads.HEIGHT_PERMIT);
    for (let i = 0; i < reviewer; i++) f.run('document-approve');
    f.run('document-reject'); f.run('document-revise');
    f.run('document-submit', payloads.HEIGHT_PERMIT); assert.equal(f.repo.state.tasks[0].role, 'pengawas_k3');
    for (let i = 0; i < 4; i++) f.run('document-approve');
    assert.equal(copyLatest(f, 'HEIGHT_PERMIT').status, 'approved');
    f.run('height-record'); assert.equal(copyLatest(f, 'HEIGHT_PERMIT').status, 'issued');
    graphCheck(f.repo);
  });
}
test('height rejection integrates H03', () => {
  const f = fixture(); approveDocument(f, 'JSA'); approveDocument(f, 'IBPPR'); f.run('height-needed'); f.run('document-submit', payloads.HEIGHT_PERMIT);
  f.run('document-reject'); f.run('document-unrepairable'); f.run('hold-establish'); assert.equal(f.repo.state.orders[0].holds[0].causeId, 'H03'); graphCheck(f.repo);
});
test('height not required skips permit and valid roster reaches SP2B boundary', () => {
  const f = fixture(); reachAuthority(f); f.run('authority-collect', { people: [person('A'), person('B')] }); f.run('authority-verify');
  assert.equal(f.repo.state.orders[0].nodeId, 'Node_siapkan_sp2b'); assert.equal(f.repo.state.tasks[0].actionable, true);
  assert.ok(!f.repo.state.documents.some(doc => doc.type === 'HEIGHT_PERMIT')); graphCheck(f.repo);
});
test('expired person blocks SP2B; valid replacement verified with original identity retained in history', () => {
  const f = fixture(); reachAuthority(f, true); f.run('authority-collect', { people: [person('A'), person('B', false)] }); f.run('authority-verify');
  assert.equal(f.repo.state.orders[0].authorityValid, false);
  f.run('authority-use-replacement'); f.run('authority-replace', { replacements: [{ ...person('C'), replacesId: 'B' }] }); f.run('authority-verify');
  assert.equal(f.repo.state.orders[0].nodeId, 'Node_siapkan_sp2b');
  assert.ok(f.repo.state.documents.find(doc => doc.type === 'AUTHORITY_ROSTER').people.some(row => row.personId === 'B')); graphCheck(f.repo);
});
test('renewal by manager returns through Preparator and full verification', () => {
  const f = fixture(); reachAuthority(f); f.run('authority-collect', { people: [person('A', false)] }); f.run('authority-verify');
  f.run('authority-request-renewal'); f.run('authority-renew', { people: [person('A')] });
  assert.equal(f.repo.state.orders[0].nodeId, 'Node_verifikasi_surat_baru');
  f.run('authority-check-renewal'); f.run('authority-verify'); assert.equal(f.repo.state.orders[0].authorityValid, true); graphCheck(f.repo);
});
test('failed renewal integrates H04 and competency mismatch cannot pass', () => {
  const f = fixture(); reachAuthority(f); f.run('authority-collect', { people: [{ ...person('A'), competence: 'OTHER' }] }); f.run('authority-verify');
  f.run('authority-request-renewal'); f.run('authority-renewal-failed'); f.run('hold-establish');
  assert.equal(f.repo.state.orders[0].holds[0].causeId, 'H04'); graphCheck(f.repo);
});
test('wrong reviewer, stale document version, duplicate submit and storage failure', () => {
  const f = fixture();
  assert.throws(() => f.run('document-submit', payloads.IBPPR, 'asman_jaringan'), /giliran/);
  f.run('document-submit', payloads.JSA);
  assert.throws(() => f.run('document-approve', {}, 'asman_jaringan'), /giliran/);
  assert.throws(() => f.run('document-approve', { documentVersionId: 'OLD' }), /Versi dokumen/);
  const before = f.repo.snapshot(); f.storage.fail = true;
  assert.throws(() => f.run('document-approve'), /Storage full/); assert.deepEqual(f.repo.snapshot(), before); f.storage.fail = false;
  const request = { action: 'document-approve', data: { documentVersionId: copyLatest(f, 'JSA').id }, woId: before.orders[0].id, expectedVersion: before.orders[0].version, idempotencyKey: 'retry-review' };
  const receipt = f.repo.command(request, actor('p2k3_k3l')); assert.deepEqual(f.repo.command(request, actor('p2k3_k3l')), receipt);
  assert.equal(copyLatest(f, 'JSA').decisions.length, 1);
  assert.equal(new Repository(f.storage).state.documents.find(doc => doc.type === 'JSA').payload.steps, payloads.JSA.steps);
});
test('support files belong to a single submitted document version', () => {
  const f = fixture();
  f.run('document-file', { name: 'test.pdf', mime: 'application/pdf', content: 'data:application/pdf;base64,JVBERg==' });
  f.run('document-submit', payloads.JSA); const first = copyLatest(f, 'JSA');
  assert.equal(first.fileIds.length, 1);
  f.run('document-reject'); f.run('document-revise'); f.run('document-submit', payloads.JSA);
  assert.equal(copyLatest(f, 'JSA').fileIds.length, 0);
  assert.equal(f.repo.state.documents.find(doc => doc.id === first.id).fileIds[0], first.fileIds[0]);
});
test('saved I05 boundary becomes actionable without losing records', () => {
  const f = fixture(); const before = f.repo.state.orders[0];
  f.repo.state.tasks[0].actionable = false; f.storage.setItem(f.repo.key, JSON.stringify(f.repo.state));
  const reloaded = new Repository(f.storage);
  assert.equal(reloaded.state.tasks[0].actionable, true);
  assert.deepEqual(reloaded.state.orders[0], before);
});
test('replacement cannot reduce competence requirements or replace a valid member', () => {
  const f = fixture(); reachAuthority(f); f.run('authority-collect', { people: [person('A'), person('B', false)] }); f.run('authority-verify'); f.run('authority-use-replacement');
  assert.throws(() => f.run('authority-replace', { replacements: [{ ...person('C'), replacesId: 'B', requiredCompetence: 'OTHER', competence: 'OTHER' }] }), /kompetensi yang sama/);
  assert.throws(() => f.run('authority-replace', { replacements: [{ ...person('C'), replacesId: 'A' }] }), /belum memenuhi/);
});
test('hold coordination has nine Preparator and three Kepala Regu causes', () => {
  assert.equal(preparation.holds.filter(hold => hold.coordinator === 'preparator_pdkb').length, 9);
  assert.equal(preparation.holds.filter(hold => hold.coordinator === 'kepala_regu').length, 3);
});
test('H04 actual recovery updates letter evidence then re-verifies the same roster', () => {
  const f = fixture(); reachAuthority(f); f.run('authority-collect', { people: [person('A', false)] }); f.run('authority-verify');
  f.run('authority-request-renewal'); f.run('authority-renewal-failed'); f.run('hold-establish');
  f.run('hold-fulfill', { people: [person('A', false)] });
  assert.throws(() => f.run('hold-resolved'), /belum memenuhi/);
  f.run('hold-temporary'); f.run('hold-fulfill', { people: [person('A')] });
  f.run('hold-resolved'); f.run('hold-resume'); f.run('authority-verify');
  assert.equal(f.repo.state.orders[0].nodeId, 'Node_siapkan_sp2b'); graphCheck(f.repo);
});
const output = path.join(__dirname, '../docs/execution-i06-i09'); fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'domain-results.json'), JSON.stringify({ count: results.length, results }, null, 2));
console.log(results.length + ' preparation scenarios passed.');
}
module.exports = { fixture, reachAuthority, person, graphCheck, actor };
