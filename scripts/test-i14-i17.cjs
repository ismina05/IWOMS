const assert = require('node:assert/strict');
const {setup,documents,distribute,ready,sokRound}=require('./test-i10-i13.cjs');
const {actor,graphCheck}=require('./test-i06-i09.cjs');
const {Repository}=require('../app/workflow.js');

function setupField(){
  const f=setup(); documents(f); distribute(f); ready(f); sokRound(f); f.run('sok-confirmed');
  f.order=()=>f.repo.state.orders[0];
  const run=f.run;
  f.run=(action,data={},role)=>run(action,{roundId:f.order().executionRounds?.at(-1)?.id,normalizationId:f.order().normalizationRequests?.at(-1)?.id,...data},role);
  return f;
}
function start(f){f.run('initial-safe',{conditionsOk:true});f.run('no-delegation');f.run('start-round');}
function lanes(f,stop=false){
  f.run(stop?'lane-stop':'lane-report',{},'pelaksana_pdkb');
  assert.throws(()=>f.run('lane-report',{},'pelaksana_pdkb'),/giliran/);
  f.run('lane-report',{},'pengawas_k3');f.run('lane-report',{},'kepala_regu');
}
function recover(f){
  for(const action of ['hold-establish','hold-fulfill','hold-resolved','hold-resume'])f.run(action);
}
const f=setupField();
f.run('initial-unsafe');f.run('initial-evaluate');f.run('initial-recheck');f.run('initial-hold');recover(f);
assert.equal(f.order().nodeId,'Node_periksa_cuaca');
f.run('initial-safe',{conditionsOk:true});
f.run('delegate',{candidateId:f.order().authorityRoster.people[0].personId});
f.run('candidate-invalid');f.run('candidate-hold');recover(f);
f.run('candidate-invalid');f.run('candidate-replace',{candidateId:f.order().authorityRoster.people[1].personId});f.run('candidate-valid');
for(const action of ['delegation-create','delegation-accept','delegation-review','delegation-archive'])f.run(action);
assert.equal(f.order().delegation.document.status,'archived');
f.run('start-round');assert.equal(f.repo.state.tasks.length,3);
const first=f.order().executionRounds[0].id;
lanes(f,true);assert.throws(()=>f.run('round-clear'),/Penghentian aktif/);
f.run('round-danger');f.run('round-stop');f.run('round-secure');f.run('round-safety-review',{safe:false});
assert.throws(()=>f.run('round-resume'),/Evaluasi K3/);
f.run('round-hold');recover(f);assert.equal(f.order().nodeId,'Node_periksa_cuaca');
start(f);assert.throws(()=>f.run('lane-report',{roundId:first},'pelaksana_pdkb'),/Putaran/);
lanes(f);f.run('round-clear');f.run('round-repeat');lanes(f);f.run('round-clear');f.run('round-finished');f.run('physical-report');
assert.ok(f.order().physical_completed_at);assert.equal(f.order().operational_completed_at,undefined);
function normalize(applied){
  for(const action of ['normal-request','normal-area','normal-apd','normal-gi','normal-return-apd','normal-return-area'])f.run(action,{applied});
}
normalize(false);assert.throws(()=>f.run('normal-confirm'),/GI/);f.run('normal-retry');normalize(true);
assert.throws(()=>f.run('normal-confirm',{normalizationId:'OTHER-WO'}),/berbeda/);
f.run('normal-confirm');f.run('operational-complete');
assert.ok(f.order().operational_completed_at);assert.equal(f.order().nodeId,'Node_izin_tinggi_digunakan');
assert.equal(f.repo.state.operations.filter(event=>event.action==='operational-complete').length,1);
assert.notEqual(f.order().normalizationRequests[0].id,f.order().sokConfirmed.requestId);
graphCheck(f.repo);
console.log('PASS I14, I15, I17: delegasi, H10-H12, fork/join, SWA, selesai fisik dan penormalan ulang');

const w=setupField();start(w);
const rows=Array.from({length:22},(_,index)=>({no:index+1,answer:index===0?'Tidak':'Ya',note:index===0?'Perlu tindak lanjut':''}));
assert.throws(()=>w.run('wip-submit',{rows:[]},'pengawas_k3'),/22/);
w.run('wip-save',{rows},'pengawas_k3');
const draft=w.order().wipVersions.at(-1).id;
assert.throws(()=>w.run('wip-approve',{wipId:draft},'p2k3_k3l'),/diajukan/);
w.run('wip-submit',{rows},'pengawas_k3');
assert.throws(()=>w.run('wip-approve',{wipId:draft},'p2k3_k3l'),/diajukan/);
w.run('wip-approve',{wipId:w.order().wipVersions.at(-1).id},'p2k3_k3l');
assert.equal(new Repository(w.storage).state.orders[0].wipScore,95.5);
const other=setupField();start(other);
const combined=w.repo.snapshot();combined.orders.push(other.order());w.storage.setItem(w.repo.key,JSON.stringify(combined));w.repo.reload();
assert.equal(w.repo.orders(actor('pengawas_k3'))[1].wipVersions,undefined);
console.log('PASS I16: draf, versi usang, skor 95,5%, refresh dan pemisahan dua WO');
