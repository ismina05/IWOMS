const assert=require('node:assert/strict');
const {setup}=require('./test-i10-i13.cjs');
const {actor}=require('./test-i06-i09.cjs');
const {Repository}=require('../app/workflow.js');
const reporting=require('../app/reporting.js');
const graph=require('../app/preparation-graph.js');

const f=setup();
const state=f.repo.snapshot();
const original={...state.orders[0],nama_wo:'=1+1, "uji"',operational_completed_at:'2026-11-30T17:00:00Z'};
state.orders[0]=original;
state.orders.push({...original,id:'prior',operational_completed_at:'2026-11-30T16:59:59Z'});
state.orders.push({...original,id:'physical-only',operational_completed_at:null});
f.storage.setItem(f.repo.key,JSON.stringify(state));f.repo.reload();
function command(action,role,overrides={}){
  const report=f.repo.state.reports[0];
  return f.repo.command({action,expectedVersion:report?.version,idempotencyKey:crypto.randomUUID(),data:{period:'2026-12',reportId:report?.id,documentVersion:report?.versions.at(-1)?.number},...overrides},actor(role));
}
command('monthly-create','preparator_pdkb');
assert.throws(()=>command('monthly-send','preparator_pdkb'),/Tindakan/);
command('monthly-submit','preparator_pdkb');
for(const role of ['supervisor_pdkb','asman_jaringan','manajer_area'])command('monthly-approve',role);
assert.throws(()=>command('monthly-receive','komisi_pusat'),/giliran/);
const before=f.repo.snapshot();
f.storage.fail=true;
assert.throws(()=>command('monthly-send','preparator_pdkb'));
assert.deepEqual(f.repo.snapshot(),before);
f.storage.fail=false;
command('monthly-send','preparator_pdkb');
assert.throws(()=>command('monthly-receive','komisi_pusat'),/giliran/);
command('monthly-forward','komisi_unit');
const report=f.repo.state.reports[0];
const request={action:'monthly-receive',expectedVersion:report.version,idempotencyKey:'receive-once',data:{reportId:report.id,documentVersion:1}};
const received=f.repo.command(request,actor('komisi_pusat'));
assert.deepEqual(f.repo.command(request,actor('komisi_pusat')),received);
assert.throws(()=>command('monthly-receive','komisi_pusat'),/giliran/);
const persisted=new Repository(f.storage).state.reports[0];
assert.equal(persisted.nodeId,'Node_end_bulanan');
assert.equal(persisted.versions[0].distribution.length,3);
assert.deepEqual(f.repo.state.orders,before.orders);
for(const entry of persisted.audit){
  let node=entry.origin;
  for(const id of entry.edgeIds){const edge=graph.edges.find(item=>item.id===id);assert.equal(edge.source,node);node=edge.target;}
  assert.equal(node,entry.nodeId);
}
const rows=reporting.rows(state.orders,[],{period:'2026-12',category:'operational'});
assert.deepEqual(rows.map(row=>row.id),[original.id]);
assert.equal(reporting.rows(state.orders,[],{search:'physical-only',category:'operational'}).length,0);
assert.equal(reporting.rows(state.orders,[{woId:original.id,actionable:true}],{category:'tasks'}).length,1);
assert.equal(reporting.day(original.operational_completed_at),'2026-12-01');
const csv=reporting.csv(persisted,persisted.versions[0]);
assert.ok(csv.includes(original.id)&&!csv.includes('physical-only')&&!csv.includes('prior'));
assert.ok(csv.includes("'=1+1, \"\"uji\"\""));
assert.throws(()=>reporting.csv(persisted,null),/snapshot/);
console.log('PASS I22–I23: BPMN distribusi, versi final, role, idempotensi, simpan gagal, KPI, batas WIB dan CSV.');
