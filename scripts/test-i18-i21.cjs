const assert=require('node:assert/strict');
const {setup,documents,distribute,ready,sokRound}=require('./test-i10-i13.cjs');
const {actor,graphCheck}=require('./test-i06-i09.cjs');
const {Repository}=require('../app/workflow.js');
const graph=require('../app/preparation-graph.js');

function operational(){
  const fixture=setup();documents(fixture);distribute(fixture);ready(fixture);sokRound(fixture);fixture.run('sok-confirmed');
  const wo=()=>fixture.repo.state.orders[0];
  fixture.run('initial-safe',{conditionsOk:true});fixture.run('no-delegation');fixture.run('start-round');
  for(const role of ['pelaksana_pdkb','kepala_regu','pengawas_k3'])fixture.run('lane-report',{roundId:wo().executionRounds.at(-1).id},role);
  fixture.run('round-clear');fixture.run('round-finished');fixture.run('physical-report');fixture.run('normal-request');
  for(const action of ['normal-area','normal-apd','normal-gi','normal-return-apd','normal-return-area','normal-confirm','operational-complete'])fixture.run(action,{normalizationId:wo().normalizationRequests.at(-1).id,applied:true});
  return {...fixture,wo};
}

const used=operational();
assert.throws(()=>used.run('closure-next',{used:true}),/Izin awal/);
const state=used.repo.snapshot();
state.orders[0].heightPermitId='test-permit';
state.documents.push({id:'test-permit',woId:used.wo().id,type:'HEIGHT_PERMIT',status:'issued',version:1});
used.storage.setItem(used.repo.key,JSON.stringify(state));used.repo.reload();
used.run('closure-next',{used:true});used.run('closure-next');
assert.throws(()=>used.run('closure-next',{},'asman_jaringan'),/giliran/);
used.run('permit-close-objection');
assert.equal(used.wo().nodeId,'Node_ttd_penutupan_izin_k3');
for(let i=0;i<5;i++)used.run('closure-next');
assert.equal(used.wo().nodeId,'Node_laporan_hasil_kepala_regu');
assert.equal(used.repo.state.documents.find(doc=>doc.type==='HEIGHT_CLOSURE').sourcePermitId,'test-permit');
graphCheck(used.repo);

const f=operational();
f.run('closure-next',{used:false});f.run('closure-next');f.run('closure-next');
for(let stage=0;stage<3;stage++){
  for(let i=0;i<stage;i++)f.run('closure-next');
  f.run('closure-return');assert.equal(f.wo().nodeId,'Node_revisi_pemberitahuan');f.run('closure-next');
}
for(let i=0;i<5;i++)f.run('closure-next');
assert.equal(f.wo().nodeId,'Node_laporan_harian');
f.run('closure-next');f.run('closure-next');
const fileNode=f.wo().nodeId;
assert.throws(()=>f.run('closure-next'),/berkas wajib/);
assert.equal(f.wo().nodeId,fileNode);
f.run('closure-return');f.run('closure-next');f.run('closure-next');f.run('closure-next',{checked:true});f.run('closure-next');
assert.throws(()=>f.run('closure-next',{},'komisi_unit'),/giliran/);
f.run('closure-next');assert.equal(f.wo().status,'WO Completed');
assert.throws(()=>f.run('closure-next',{},'preparator_pdkb'),/giliran/);
assert.ok(f.wo().administrative_completed_at);
const archive=f.repo.state.documents.find(doc=>doc.id===f.wo().archiveId);
assert.ok(archive.documentIds.every(id=>f.repo.state.documents.some(doc=>doc.id===id&&doc.woId===f.wo().id)));
assert.equal(f.repo.state.documents.filter(doc=>doc.type==='COMPLETION_NOTICE'&&doc.status==='received').length,1);
graphCheck(f.repo);
console.log('PASS I18–I20: dua jalur izin, urutan, tiga cabang revisi, pemberitahuan, kelengkapan, arsip dan penutupan');

const reportFixture=operational();
const local=reportFixture.repo.snapshot();
local.orders[0].operational_completed_at='2026-11-30T17:00:00Z';
local.orders.push({...local.orders[0],id:'prior-month',operational_completed_at:'2026-11-30T16:59:59Z'});
local.orders.push({...local.orders[0],id:'physical-only',operational_completed_at:null});
local.orders.push({...local.orders[0],id:'foreign-unit',unitId:'other'});
reportFixture.storage.setItem(reportFixture.repo.key,JSON.stringify(local));reportFixture.repo.reload();
const repo=reportFixture.repo;
const monthly=(action,role,data={})=>{
  const report=repo.state.reports[0];
  return repo.command({action,expectedVersion:report?.version,idempotencyKey:crypto.randomUUID(),data:{reportId:report?.id,period:'2026-12',documentVersion:report?.versions.at(-1)?.number,...data}},actor(role));
};
monthly('monthly-create','preparator_pdkb');
assert.throws(()=>monthly('monthly-create','preparator_pdkb'),/sudah tersedia/);
monthly('monthly-submit','preparator_pdkb');
assert.deepEqual(repo.state.reports[0].versions[0].snapshot.map(wo=>wo.woId),[local.orders[0].id]);
assert.throws(()=>monthly('monthly-approve','manajer_area'),/giliran/);
monthly('monthly-approve','supervisor_pdkb');monthly('monthly-return','asman_jaringan',{note:'Periksa kembali'});
monthly('monthly-submit','preparator_pdkb');
assert.equal(repo.state.reports[0].versions[0].status,'returned');
assert.throws(()=>monthly('monthly-approve','supervisor_pdkb',{documentVersion:1}),/versi/);
for(const role of ['supervisor_pdkb','asman_jaringan','manajer_area'])monthly('monthly-approve',role);
const report=new Repository(reportFixture.storage).state.reports[0];
assert.equal(report.nodeId,'Node_kirim_laporan_bulanan');
assert.equal(report.versions[1].status,'approved');
assert.equal(report.versions[0].snapshot[0].operationalCompletedAt,'2026-11-30T17:00:00Z');
for(const entry of report.audit){
  let node=entry.origin;
  for(const id of entry.edgeIds){const edge=graph.edges.find(item=>item.id===id);assert.equal(edge.source,node);node=edge.target;}
  assert.equal(node,entry.nodeId);
}
console.log('PASS I21: batas WIB, filter cakupan, versi dan snapshot tetap, revisi, tiga reviewer, refresh');
