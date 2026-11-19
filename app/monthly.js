(function(global){
  'use strict';
  const graph=typeof module!=='undefined'&&module.exports?require('./preparation-graph.js'):global.IwomsPreparationGraph;
  const supervisor='Node_periksa_bulanan_sup';
  const revise='Node_perbaiki_laporan_bulanan';
  const boundary='Node_kirim_laporan_bulanan';
  const distribution={
    [boundary]:['monthly-send','Node_terima_laporan_unit'],
    Node_terima_laporan_unit:['monthly-forward','Node_terima_laporan_pusat'],
    Node_terima_laporan_pusat:['monthly-receive','Node_end_bulanan']
  };
  const reviewers={
    [supervisor]:['Node_laporan_bulanan_sup_ok','Node_periksa_bulanan_asman'],
    Node_periksa_bulanan_asman:['Node_laporan_bulanan_asman_ok','Node_periksa_bulanan_mgr'],
    Node_periksa_bulanan_mgr:['Node_laporan_bulanan_mgr_ok',boundary]
  };
  function periodOf(at){
    const parts=new Intl.DateTimeFormat('id-ID',{year:'numeric',month:'2-digit',timeZone:'Asia/Jakarta'}).formatToParts(new Date(at));
    return parts.find(p=>p.type==='year').value+'-'+parts.find(p=>p.type==='month').value;
  }
  function handle(state,request,actor,at,fail){
    const data=request.data||{};
    if(data.note!==undefined&&typeof data.note!=='string')fail('Catatan rekap harus berupa teks.');
    const {action}=request;
    let report=state.reports.find(item=>item.id===data.reportId && item.unitId===actor.unitId);
    if(action==='monthly-create'){
      if(actor.role!=='preparator_pdkb')fail('Hanya Preparator dapat membuat rekap.');
      if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(data.period))fail('Pilih periode bulanan yang valid.');
      if(state.reports.some(item=>item.period===data.period&&item.unitId===actor.unitId))fail('Rekap periode ini sudah tersedia.');
      report={id:global.crypto.randomUUID(),period:data.period,unitId:actor.unitId,nodeId:'Node_start_bulanan',version:0,versions:[],audit:[]};
      state.reports.push(report);
    }else if(!report||report.version!==request.expectedVersion)fail('Rekap tidak ditemukan atau versinya berubah.');
    if(graph.nodes[report.nodeId]?.role!==actor.role||report.nodeId==='Node_end_bulanan')fail('Rekap bukan giliran Anda.');
    const origin=report.nodeId;
    const edgeIds=[];
    function follow(...targets){
      for(const target of targets){
        const edge=graph.edges.find(item=>item.source===report.nodeId&&item.target===target);
        if(!edge)fail('Transisi rekap tidak tersedia pada BPMN.');
        edgeIds.push(edge.id);report.nodeId=target;
      }
    }
    if(action==='monthly-create')follow('Node_susun_laporan_bulanan');
    else if(action==='monthly-submit'&&['Node_susun_laporan_bulanan',revise].includes(origin)){
      const snapshot=state.orders.filter(wo=>wo.unitId===actor.unitId && wo.operational_completed_at && Number.isFinite(Date.parse(wo.operational_completed_at)) && periodOf(wo.operational_completed_at)===report.period)
        .map(wo=>({woId:wo.id,name:wo.nama_wo,woVersion:wo.version,operationalCompletedAt:wo.operational_completed_at}));
      report.versions.push({number:report.versions.length+1,snapshot,note:data.note||'',at,actorId:actor.id,decisions:[],status:'submitted'});
      follow(supervisor);
    }else if(reviewers[origin]&&['monthly-approve','monthly-return'].includes(action)){
      const version=report.versions.at(-1);
      if(version?.status!=='submitted'||version.number!==data.documentVersion)fail('Periksa versi rekap aktif.');
      if(action==='monthly-return'&&!data.note?.trim())fail('Isi alasan pengembalian.');
      version.decisions.push({actorId:actor.id,actorName:actor.name,role:actor.role,at,action,note:data.note||''});
      const [gateway,approved]=reviewers[origin];
      follow(gateway,action==='monthly-return'?revise:approved);
      if(action==='monthly-return')version.status='returned';
      if(report.nodeId===boundary)version.status='approved';
    }else if(distribution[origin]?.[0]===action){
      const version=report.versions.at(-1);
      if(version?.status!=='approved'||version.number!==data.documentVersion)fail('Distribusi memerlukan versi final yang disetujui.');
      version.distribution ||= [];
      const index=Object.keys(distribution).indexOf(origin);
      if(version.distribution.length!==index)fail('Serah terima sebelumnya belum lengkap.');
      const destination=distribution[origin][1];
      version.distribution.push({action,actorId:actor.id,actorName:actor.name,role:actor.role,recipientRole:graph.nodes[destination].role,at,note:data.note||'',version:version.number});
      follow(destination);
      if(destination==='Node_end_bulanan')version.status='delivered';
    }else fail('Tindakan rekap tidak tersedia.');
    report.version++;
    report.audit.push({action,actorId:actor.id,at,origin,nodeId:report.nodeId,edgeIds});
    return {reportId:report.id,version:report.version,nodeId:report.nodeId,message:report.nodeId==='Node_end_bulanan'?'Laporan bulanan selesai. Penerimaan Pusat tercatat.':'Rekap tersimpan.'};
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={handle};
  else global.IwomsMonthly={handle};
})(typeof window!=='undefined'?window:globalThis);
