const assert = require('node:assert/strict');
const { Repository, UNIT, KEY } = require('../app/workflow.js');
const graph = require('../docs/baseline-i01/bpmn.json');
const edges = Object.fromEntries(graph.flows.map(flow => [flow.id, flow]));
class MemoryStorage {
  constructor() { this.data = new Map(); this.fail = false; }
  getItem(key) { return this.data.get(key) || null; }
  setItem(key, value) { if (this.fail) throw new Error('Disk full'); this.data.set(key, value); }
}
const identity = role => ({ id: 'demo:' + role, name: role, role, unitId: UNIT });
const proposal = { nama_wo: 'Pekerjaan uji', lokasi: 'Lokasi sintetis', katalog_id: 'KAT-01', proses_bisnis: 'PDKB', uraian: 'Kebutuhan pemeliharaan' };
let checks = 0;
const results = [];
function test(name, fn) { fn(); checks++; results.push({ name, result: 'PASS' }); console.log('PASS', name); }
function fresh() { const storage = new MemoryStorage(); return { storage, repo: new Repository(storage) }; }
function client(repo, role) {
  return (id, action, data = {}) => repo.command({ action, data, woId: id, expectedVersion: repo.state.orders.find(wo => wo.id === id)?.version, idempotencyKey: crypto.randomUUID() }, identity(role));
}
function create(repo, role = 'tl_op') { return client(repo, role)(undefined, 'create', proposal).woId; }
function submit(repo, id, role = 'tl_op') { return client(repo, role)(id, 'submit', proposal); }
function approve(repo, id) { for (const role of ['asman_jaringan', 'supervisor_pdkb', 'manajer_area']) client(repo, role)(id, 'approve'); }
function survey(repo, id) {
  client(repo, 'preparator_pdkb')(id, 'survey', { surveyDate: '2026-11-19', location: 'Tiang A', findings: 'Konduktor perlu dipelihara', access: 'Jalan umum', equipment: 'Peralatan sesuai SOP', material: 'Jumper' });
  client(repo, 'preparator_pdkb')(id, 'analysis', { jsa: 'Bahaya dan mitigasi awal', ibppr: 'Identifikasi risiko awal' });
}
for (const role of ['tl_op', 'tl_har', 'tl_konstruksi']) {
  test(role + ' submit, rejection, same-ID revision, priority, survey, plan', () => {
    const { repo, storage } = fresh();
    const id = create(repo, role); submit(repo, id, role);
    client(repo, 'asman_jaringan')(id, 'approve');
    client(repo, 'supervisor_pdkb')(id, 'reject', { reason: 'Perbaiki ruang lingkup' });
    assert.equal(repo.tasks(identity('asman_jaringan'))[0].nodeId, 'Node_identifikasi_pengaju');
    client(repo, 'asman_jaringan')(id, 'return');
    assert.equal(repo.tasks(identity(role))[0].woId, id);
    submit(repo, id, role); approve(repo, id);
    assert.equal(repo.tasks(identity('supervisor_pdkb'))[0].nodeId, 'Node_prioritas_wo');
    client(repo, 'supervisor_pdkb')(id, 'priority', { priority: 'Tinggi', workPlan: 'Survei lokasi pekerjaan' });
    survey(repo, id);
    client(repo, 'supervisor_pdkb')(id, 'feasibility', { decision: 'repeat', reason: 'Perlu ukur ulang' });
    survey(repo, id);
    client(repo, 'supervisor_pdkb')(id, 'feasibility', { decision: 'feasible', reason: 'Dapat dikerjakan sesuai metode' });
    client(repo, 'preparator_pdkb')(id, 'plan', { date: '2026-12-01', time: '09:00', personnel: 'Regu A', method: 'Metode sesuai SOP' });
    const wo = repo.state.orders[0];
    assert.equal(wo.stage, 'jsa'); assert.equal(wo.surveyVersions.length, 2);
    assert.equal(repo.state.orders.length, 1); assert.ok(repo.state.audits.some(event => event.action === 'reject'));
    assert.equal(new Repository(storage).state.orders[0].id, id);
    assert.ok(repo.state.audits.every(event => event.actor.id && event.at && event.processVersion));
    for (const event of repo.state.audits) {
      let node = event.nodeId;
      for (const id of event.edgeIds) { assert.equal(edges[id].source, node); node = edges[id].target; }
      assert.equal(node, event.nextNodeId);
    }
  });
  test(role + ' stops at own BPMN terminal', () => {
    const { repo } = fresh(); const id = create(repo, role); submit(repo, id, role);
    client(repo, 'asman_jaringan')(id, 'reject', { reason: 'Usulan perlu diperbaiki' });
    client(repo, 'asman_jaringan')(id, 'return');
    client(repo, role)(id, 'stop', { reason: 'Kebutuhan tidak dilanjutkan' });
    assert.equal(repo.state.tasks.length, 0);
    assert.equal(repo.state.orders[0].nodeId, 'Node_stop_' + { tl_op: 'op', tl_har: 'har', tl_konstruksi: 'konstruksi' }[role]);
  });
}
test('wrong role, unit, owner and out-of-turn rejected', () => {
  const { repo } = fresh(); const id = create(repo); submit(repo, id);
  for (const role of ['tl_op', 'supervisor_pdkb', 'bagian_terkait', 'superadmin']) assert.throws(() => client(repo, role)(id, 'approve'), /giliran/);
  for (const actor of [{ ...identity('tl_op'), id: 'different-user' }, { ...identity('asman_jaringan'), unitId: 'OTHER' }]) {
    assert.equal(repo.orders(actor).length, 0);
    assert.throws(() => repo.command({ action: 'approve', woId: id, expectedVersion: 2, data: {}, idempotencyKey: crypto.randomUUID() }, actor), /cakupan/);
  }
});
test('each approval level returns through Asman and keeps the same WO', () => {
  const levels = ['asman_jaringan', 'supervisor_pdkb', 'manajer_area'];
  for (let level = 0; level < levels.length; level++) {
    const { repo } = fresh(); const id = create(repo); submit(repo, id);
    for (let i = 0; i < level; i++) client(repo, levels[i])(id, 'approve');
    client(repo, levels[level])(id, 'reject', { reason: 'Perlu perbaikan' });
    assert.equal(repo.state.orders[0].stage, 'return');
    client(repo, 'asman_jaringan')(id, 'return'); submit(repo, id);
    assert.equal(repo.state.orders.length, 1); assert.equal(repo.state.orders[0].stage, 'asman');
  }
});
test('idempotent create and action, conflicting reused key rejected', () => {
  const { repo } = fresh();
  const request = { action: 'create', data: proposal, idempotencyKey: 'stable' };
  const first = repo.command(request, identity('tl_op'));
  assert.deepEqual(repo.command(request, identity('tl_op')), first);
  assert.equal(repo.state.orders.length, 1); assert.equal(repo.state.audits.length, 1);
  assert.throws(() => repo.command({ ...request, data: { ...proposal, nama_wo: 'Other' } }, identity('tl_op')), /isi berbeda/);
});
test('stale object version and stale tab require reload', () => {
  const { repo, storage } = fresh(); const id = create(repo);
  const second = new Repository(storage); submit(repo, id);
  assert.throws(() => client(second, 'tl_op')(id, 'save', proposal), /sesi lain/);
  second.reload(); assert.equal(second.state.orders[0].stage, 'asman');
  assert.throws(() => second.command({ action: 'approve', woId: id, expectedVersion: 1, data: {}, idempotencyKey: 'stale' }, identity('asman_jaringan')), /Versi WO/);
});
test('failed persistence leaves state and task unchanged, retry works', () => {
  const { repo, storage } = fresh(); const id = create(repo); const before = repo.snapshot();
  storage.fail = true; assert.throws(() => submit(repo, id), /Disk full/);
  assert.deepEqual(repo.snapshot(), before);
  storage.fail = false; submit(repo, id); assert.equal(repo.state.orders[0].stage, 'asman');
});
test('not feasible requires explicit notice to originator', () => {
  const { repo } = fresh(); const id = create(repo); submit(repo, id); approve(repo, id);
  client(repo, 'supervisor_pdkb')(id, 'priority', { priority: 'Normal', workPlan: 'Survei' }); survey(repo, id);
  client(repo, 'supervisor_pdkb')(id, 'feasibility', { decision: 'stop', reason: 'Lokasi tidak memenuhi' });
  assert.equal(repo.state.notifications.length, 0);
  client(repo, 'supervisor_pdkb')(id, 'notify');
  assert.equal(repo.state.orders[0].nodeId, 'Node_end_survei');
  assert.equal(repo.state.notifications[0].recipientId, 'demo:tl_op'); assert.equal(repo.state.tasks.length, 0);
});
test('permit/date alone cannot skip feasibility', () => {
  const { repo } = fresh(); const id = create(repo); submit(repo, id); approve(repo, id);
  assert.throws(() => client(repo, 'preparator_pdkb')(id, 'plan', { date: '2026-12-01', permit: 'ABC' }), /giliran/);
});
test('legacy review keeps old approvals and requires named originator', () => {
  const { repo } = fresh(); repo.importLegacy([{ id: 'OLD', status: 'Assignment Review', approval_asman: { approved: true, by: 'Original' } }]);
  assert.equal(repo.tasks(identity('supervisor_pdkb'))[0].title, 'Tinjau penugasan lama');
  client(repo, 'supervisor_pdkb')('OLD', 'reclassify', { ownerRole: 'tl_op', reason: 'Verifikasi data pengusul' });
  assert.equal(repo.state.orders[0].legacyApprovals.asman.by, 'Original');
  assert.equal(repo.state.orders[0].stage, 'asman');
});
test('corrupt storage is reported without replacing data', () => {
  const storage = new MemoryStorage(); storage.setItem(KEY, '{broken');
  assert.throws(() => new Repository(storage), /tidak dapat dibaca/); assert.equal(storage.getItem(KEY), '{broken');
});
test('reset only available to explicit demo administrator', () => {
  const { repo } = fresh(); create(repo);
  assert.throws(() => repo.reset(identity('tl_op')), /Super Admin/);
  repo.reset(identity('superadmin')); assert.equal(repo.state.orders.length, 0);
});
test('task queue resolves all 17 canonical roles with new fixture IDs', () => {
  const { repo } = fresh();
  const config = require('../docs/baseline-i01/inventory.json');
  for (const role of Object.keys(config.roles).filter(key => key !== 'superadmin')) {
    repo.state.tasks.push({ id: crypto.randomUUID(), woId: 'NEW-FIXTURE-' + role, role, unitId: UNIT });
    const queue = repo.tasks(identity(role));
    assert.equal(queue.length, 1); assert.equal(queue[0].role, role);
  }
});
test('attachment survives reload and other owner cannot modify it', () => {
  const { repo, storage } = fresh(); const id = create(repo);
  client(repo, 'tl_op')(id, 'attach', { name: 'preuve.pdf', mime: 'application/pdf', content: 'data:application/pdf;base64,JVBERg==' });
  const reopened = new Repository(storage);
  assert.equal(reopened.state.documents[0].woId, id);
  assert.equal(reopened.state.orders[0].documentIds.length, 1);
  assert.throws(() => client(repo, 'tl_har')(id, 'attach', { name: 'file' }), /cakupan/);
});
test('survey input failure is atomic and needs full initial analyses', () => {
  const { repo } = fresh(); const id = create(repo); submit(repo, id); approve(repo, id);
  client(repo, 'supervisor_pdkb')(id, 'priority', { priority: 'Normal', workPlan: 'Survei' });
  const before = repo.snapshot();
  assert.throws(() => client(repo, 'preparator_pdkb')(id, 'survey', { surveyDate: '2026-11-19' }), /Lengkapi/);
  assert.deepEqual(before, repo.snapshot());
});
console.log(checks + ' domain scenarios passed.');
require('node:fs').writeFileSync(require('node:path').join(__dirname, '../docs/execution-i02-i05/domain-results.json'), JSON.stringify({ count: checks, results }, null, 2));
