const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { fixture, reachAuthority, person, graphCheck, actor } = require('./test-i06-i09.cjs');
const preparation = require('../app/preparation.js');
const { Repository } = require('../app/workflow.js');
const results = [];
function test(name, fn) { fn(); results.push({name,status:'PASS'}); console.log('PASS',name); }
function setup(prefix='Tim') {
  const f = fixture(); reachAuthority(f);
  f.run('authority-collect',{people:[{...person(prefix+'-A'),name:prefix+' pengawas pekerjaan',duty:'Pengawas pekerjaan'},{...person(prefix+'-B'),name:prefix+' pengawas K3',duty:'Pengawas K3'}]}); f.run('authority-verify');
  const run = f.run;
  f.run = (action,data={},role,overrides={}) => run(action,{requestId:f.repo.state.orders[0].sokRequests?.at(-1)?.id,...data},role,overrides);
  f.latest = type => preparation.latestDocument(f.repo.state,f.repo.state.orders[0],type);
  return f;
}
function body(f,type) {
  if(type === 'EQUIPMENT_CHECKLIST') return {inspection:'Diperiksa sesuai kebutuhan pekerjaan',items:[{category:'equipment',name:'Peralatan isolasi',quantity:2,unit:'set',condition:'Sesuai spesifikasi'},{category:'material',name:'Jumper',quantity:1,unit:'buah',condition:'Sesuai spesifikasi'}]};
  const people=f.repo.state.orders[0].authorityRoster.people;
  return {number:type+'/'+f.repo.state.orders[0].id,scope:'Pemeliharaan jumper',circuit:'Penyulang uji',workLocation:'Tiang uji',limits:'Batas sesuai survei',workSupervisor:people[0].personId,safetySupervisor:people[1].personId};
}
function issue(f,type) { f.run('document-submit',body(f,type));f.run('document-approve');f.run('document-approve'); }
function documents(f) { issue(f,'SP2B');issue(f,'SP3B');issue(f,'EQUIPMENT_CHECKLIST'); }
function distribute(f) {
  f.run('sp2b-deliver',{recipientId:'demo:pelaksana_pdkb'}); f.run('sp2b-receive',{acknowledged:true}); f.run('sp2b-record');
  f.run('sp3b-deliver',{reguRecipientId:'demo:kepala_regu',k3RecipientId:'demo:pengawas_k3'});f.run('sp3b-receive-regu',{acknowledged:true});f.run('sp3b-receive-k3',{acknowledged:true});
}
function ready(f) {
  f.run('readiness-instruct');f.run('readiness-check',{equipmentReady:true,materialReady:true,apdReady:true});
  f.run('job-briefing',{participants:'Regu A B',instructions:'Pembagian tugas dan bahaya'});
  f.run('safety-briefing',{participants:'Regu A B',healthOk:true,apdOk:true,briefing:'Pengamanan sesuai SOP'});
  f.run('start-coordinate',{counterpart:'Kepala Operasi uji'});
}
function sokRound(f,applied=true) {
  f.run('sok-request',{circuit:'Penyulang uji',boundary:'Batas uji'});f.run('sok-area');f.run('sok-apd');
  f.run('sok-gi',{applied,settings:'Pengaturan sesuai instruksi operasi'});f.run('sok-confirm-apd');f.run('sok-confirm-area');
}
function recover(f) { f.run('hold-establish');f.run('hold-fulfill');f.run('hold-resolved');f.run('hold-resume'); }
if (require.main === module) {
test('SP2B and SP3B issue separately, checklist and six handoffs precede readiness',()=>{
  const f=setup();issue(f,'SP2B');assert.equal(f.latest('SP2B').status,'issued');assert.ok(!f.latest('SP3B'));
  issue(f,'SP3B');assert.equal(f.latest('SP3B').sourceSp2bId,f.latest('SP2B').id);
  issue(f,'EQUIPMENT_CHECKLIST');assert.equal(f.latest('EQUIPMENT_CHECKLIST').status,'approved');
  distribute(f);assert.equal(f.repo.state.orders[0].nodeId,'Node_instruksi_periksa_ulang');
  assert.equal(f.repo.state.orders[0].handoffs.length,6);graphCheck(f.repo);
});
for(const type of ['SP2B','SP3B','EQUIPMENT_CHECKLIST']) for(const reviewer of [0,1]) {
  test(type+' reviewer '+(reviewer+1)+' rejects, hold restores exact task and old version stays',()=>{
    const f=setup();if(type!=='SP2B')issue(f,'SP2B');if(type==='EQUIPMENT_CHECKLIST')issue(f,'SP3B');
    f.run('document-submit',body(f,type));if(reviewer)f.run('document-approve');f.run('document-reject');
    const old=JSON.parse(JSON.stringify(f.latest(type)));f.run('document-unrepairable');recover(f);
    assert.equal(f.repo.state.orders[0].nodeId,preparation.documents[type].submit);
    issue(f,type);assert.equal(f.latest(type).version,2);assert.deepEqual(f.repo.state.documents.find(d=>d.id===old.id),old);graphCheck(f.repo);
  });
}
test('wrong receiver and missing acknowledgment cannot complete SP2B receipt',()=>{
  const f=setup();documents(f);f.run('sp2b-deliver',{recipientId:'demo:pelaksana_pdkb'});
  const wo=f.repo.state.orders[0];
  assert.throws(()=>f.repo.command({action:'sp2b-receive',woId:wo.id,expectedVersion:wo.version,idempotencyKey:crypto.randomUUID(),data:{documentVersionId:f.latest('SP2B').id,acknowledged:true}},{...actor('pelaksana_pdkb'),id:'another-person'}),/giliran/);
  assert.throws(()=>f.run('sp2b-receive',{acknowledged:false}),/konfirmasi pemahaman/);
  assert.throws(()=>f.run('sp2b-receive',{documentVersionId:'OTHER',acknowledged:true}),/Versi dokumen/);
});
test('SP3B is not receivable by K3 before Kepala Regu and references issued version',()=>{
  const f=setup();documents(f);f.run('sp2b-deliver',{recipientId:'demo:pelaksana_pdkb'});f.run('sp2b-receive',{acknowledged:true});f.run('sp2b-record');
  f.run('sp3b-deliver',{reguRecipientId:'demo:kepala_regu',k3RecipientId:'demo:pengawas_k3'});
  assert.throws(()=>f.run('sp3b-receive-k3',{acknowledged:true},'pengawas_k3'),/giliran/);
  assert.equal(f.repo.state.orders[0].deliveries['sp3b-k3'].documentVersionId,f.latest('SP3B').id);
});
test('H08 restores recheck instruction, then health and APD failures stay in own task',()=>{
  const f=setup();documents(f);distribute(f);f.run('readiness-instruct');f.run('readiness-check',{equipmentReady:false,materialReady:true,apdReady:true});
  assert.equal(f.repo.state.orders[0].nodeId,'Node_hold_kesiapan_lapangan');recover(f);
  assert.equal(f.repo.state.orders[0].nodeId,'Node_instruksi_periksa_ulang');f.run('readiness-instruct');
  f.run('readiness-check',{equipmentReady:true,materialReady:true,apdReady:false});assert.equal(f.repo.state.orders[0].nodeId,'Node_periksa_kesiapan_lapangan');
  f.run('readiness-check',{equipmentReady:true,materialReady:true,apdReady:true});f.run('job-briefing',{participants:'Regu A',instructions:'Instruksi'});
  f.run('safety-briefing',{participants:'Regu A',healthOk:false,apdOk:true,briefing:'Materi'});
  assert.equal(f.repo.state.orders[0].briefing_k3_selesai,false);assert.equal(f.repo.state.orders[0].nodeId,'Node_safety_briefing');
  f.run('safety-briefing',{participants:'Regu A',healthOk:true,apdOk:true,briefing:'Materi'});f.run('start-coordinate',{counterpart:'Kepala Operasi'});
  assert.equal(f.repo.state.orders[0].nodeId,'Node_minta_sok');graphCheck(f.repo);
});
test('SOK request and six role actions confirm only this WO and stop at I14 boundary',()=>{
  const f=setup();documents(f);distribute(f);ready(f);sokRound(f);f.run('sok-confirmed');
  const wo=f.repo.state.orders[0];assert.equal(wo.nodeId,'Node_periksa_cuaca');assert.equal(f.repo.state.tasks[0].actionable,true);
  assert.equal(f.repo.state.operations.length,7);assert.ok(f.repo.state.operations.every(event=>event.woId===wo.id&&event.requestId===wo.sokConfirmed.requestId));
  assert.ok(!wo.waktu_mulai_aktual);graphCheck(f.repo);
});
test('SOK failed application, retry and H09 demand a full new round',()=>{
  const f=setup();documents(f);distribute(f);ready(f);sokRound(f,false);
  assert.throws(()=>f.run('sok-confirmed'),/belum lengkap/);
  const first=f.repo.state.orders[0].sokRequests[0].id;f.run('sok-retry');sokRound(f,false);f.run('sok-hold');
  assert.equal(f.repo.state.orders[0].nodeId,'Node_hold_sok_awal');recover(f);assert.equal(f.repo.state.orders[0].nodeId,'Node_minta_sok');
  sokRound(f,true);assert.throws(()=>f.run('sok-confirmed',{requestId:first}),/tidak cocok/);f.run('sok-confirmed');
  assert.equal(f.repo.state.orders[0].sokRequests.length,3);graphCheck(f.repo);
});
test('SOK wrong role, wrong request and failed save preserve state, retries are idempotent',()=>{
  const f=setup();documents(f);distribute(f);ready(f);f.run('sok-request',{circuit:'Uji',boundary:'Batas'});
  assert.throws(()=>f.run('sok-gi',{applied:true,settings:'Uji'},'petugas_gi'),/giliran/);
  assert.throws(()=>f.run('sok-area',{requestId:'OTHER-WO-REQUEST'}),/tidak cocok/);
  const before=f.repo.snapshot();f.storage.fail=true;assert.throws(()=>f.run('sok-area'),/Storage full/);assert.deepEqual(f.repo.snapshot(),before);f.storage.fail=false;
  const wo=f.repo.state.orders[0];const request={action:'sok-area',data:{reason:'Teruskan',requestId:wo.sokRequests.at(-1).id},woId:wo.id,expectedVersion:wo.version,idempotencyKey:'SOK-RETRY'};
  const result=f.repo.command(request,actor('piket_area'));assert.deepEqual(f.repo.command(request,actor('piket_area')),result);assert.equal(f.repo.state.operations.length,2);
  assert.equal(new Repository(f.storage).state.orders[0].nodeId,'Node_sok_piket_apd');
});
test('two WOs preserve separate document numbers, teams, permits and SOK events',()=>{
  const one=setup('Tim satu');const two=setup('Tim dua');documents(one);documents(two);distribute(one);distribute(two);ready(one);ready(two);sokRound(one);sokRound(two);
  const state=one.repo.snapshot();const second=two.repo.snapshot();
  for(const key of ['orders','tasks','documents','audits','operations'])state[key].push(...second[key]);
  one.storage.setItem(one.repo.key,JSON.stringify(state));one.repo.reload();
  const wo=one.repo.state.orders[0];const foreign=second.orders[0].sokRequests.at(-1).id;
  assert.notEqual(one.latest('SP2B').payload.number,preparation.latestDocument(one.repo.state,second.orders[0],'SP2B').payload.number);
  assert.notEqual(one.latest('SP2B').rosterSnapshot.people[0].name,preparation.latestDocument(one.repo.state,second.orders[0],'SP2B').rosterSnapshot.people[0].name);
  assert.throws(()=>one.run('sok-confirmed',{requestId:foreign}),/tidak cocok/);
  one.run('sok-confirmed');assert.ok(!one.repo.state.orders[1].sokConfirmed);
});
test('letters cannot skip authority verification, readiness or sequential issuance',()=>{
  const f=setup();assert.throws(()=>f.run('sok-request',{circuit:'Uji',boundary:'Batas'}),/Tindakan/);
  const wo=f.repo.state.orders[0];wo.authorityValid=false;f.storage.setItem(f.repo.key,JSON.stringify(f.repo.state));f.repo.reload();
  assert.throws(()=>f.run('document-submit',body(f,'SP2B')),/Kewenangan/);
});
test('incomplete SP3B distribution rolls back both recipients',()=>{
  const f=setup();documents(f);f.run('sp2b-deliver',{recipientId:'demo:pelaksana_pdkb'});f.run('sp2b-receive',{acknowledged:true});f.run('sp2b-record');
  const before=f.repo.snapshot();assert.throws(()=>f.run('sp3b-deliver',{reguRecipientId:'demo:kepala_regu'}),/Penerima/);assert.deepEqual(f.repo.snapshot(),before);
});
test('issuance retry signs once and stores actual reviewer and issuer',()=>{
  const f=setup();f.run('document-submit',body(f,'SP2B'));f.run('document-approve');
  const wo=f.repo.state.orders[0];const request={action:'document-approve',woId:wo.id,expectedVersion:wo.version,idempotencyKey:'ISSUE-ONCE',data:{documentVersionId:f.latest('SP2B').id}};
  const result=f.repo.command(request,actor('manajer_area'));assert.deepEqual(f.repo.command(request,actor('manajer_area')),result);
  assert.equal(f.latest('SP2B').decisions.length,2);assert.equal(f.latest('SP2B').issuedBy,'demo:manajer_area');assert.ok(f.latest('SP2B').issuedAt);
});
const output=path.join(__dirname,'../docs/execution-i10-i13');fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(path.join(output,'domain-results.json'),JSON.stringify({count:results.length,results},null,2));
console.log(results.length+' I10-I13 scenarios passed.');
}
module.exports={setup,body,issue,documents,distribute,ready,sokRound};
