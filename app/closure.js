(function(global){
  'use strict';
  const routes = {
    Node_izin_tinggi_digunakan:['Periksa penggunaan izin', 'Node_gabung_penutupan_izin'],
    Node_lengkapi_izin_selesai:['Siapkan penutupan izin','Node_ttd_penutupan_izin_k3'],
    Node_ttd_penutupan_izin_k3:['Tanda tangani penutupan izin','Node_ttd_penutupan_izin_asman'],
    Node_ttd_penutupan_izin_asman:['Tanda tangani penutupan izin','Node_ttd_penutupan_izin_p2k3'],
    Node_ttd_penutupan_izin_p2k3:['Tanda tangani penutupan izin','Node_ttd_penutupan_izin_bagian'],
    Node_ttd_penutupan_izin_bagian:['Tanda tangani penutupan izin','Node_arsip_izin_ketinggian'],
    Node_arsip_izin_ketinggian:['Catat izin lengkap','Node_gabung_penutupan_izin','Node_laporan_hasil_kepala_regu'],
    Node_laporan_hasil_kepala_regu:['Serahkan laporan hasil','Node_susun_pemberitahuan'],
    Node_susun_pemberitahuan:['Ajukan pemberitahuan','Node_setuju_pemberitahuan_sup'],
    Node_revisi_pemberitahuan:['Ajukan versi perbaikan','Node_setuju_pemberitahuan_sup'],
    Node_setuju_pemberitahuan_sup:['Setujui pemberitahuan','Node_pemberitahuan_sup_sesuai','Node_setuju_pemberitahuan_reg'],
    Node_setuju_pemberitahuan_reg:['Setujui pemberitahuan','Node_pemberitahuan_reg_sesuai','Node_setuju_pemberitahuan_k3'],
    Node_setuju_pemberitahuan_k3:['Setujui pemberitahuan','Node_pemberitahuan_k3_sesuai','Node_kirim_pemberitahuan_mgr'],
    Node_kirim_pemberitahuan_mgr:['Sampaikan ke Manajer','Node_terima_pemberitahuan_mgr'],
    Node_terima_pemberitahuan_mgr:['Terima pemberitahuan','Node_laporan_harian'],
    Node_laporan_harian:['Simpan laporan harian','Node_kumpulkan_berkas'],
    Node_kumpulkan_berkas:['Catat pengumpulan berkas','Node_periksa_kelengkapan'],
    Node_periksa_kelengkapan:['Nyatakan berkas lengkap','Node_berkas_lengkap','Node_arsipkan_pekerjaan'],
    Node_minta_dokumen_kurang:['Catat permintaan kelengkapan','Node_periksa_ulang_dokumen'],
    Node_periksa_ulang_dokumen:['Catat hasil pemenuhan','Node_periksa_kelengkapan'],
    Node_arsipkan_pekerjaan:['Arsipkan paket dokumen','Node_tutup_wo'],
    Node_tutup_wo:['Tutup administrasi WO','Node_end_wo']
  };
  const review = node => node.startsWith('Node_setuju_pemberitahuan_');
  const permitSignature = node => node.startsWith('Node_ttd_penutupan_izin_');
  const forms = new Set(['Node_lengkapi_izin_selesai','Node_laporan_hasil_kepala_regu','Node_susun_pemberitahuan','Node_revisi_pemberitahuan','Node_laporan_harian','Node_kumpulkan_berkas','Node_periksa_kelengkapan','Node_minta_dokumen_kurang','Node_periksa_ulang_dokumen']);
  const uploads = {Node_laporan_hasil_kepala_regu:'WORK_RESULT',Node_lengkapi_izin_selesai:'HEIGHT_CLOSURE',Node_kumpulkan_berkas:'FILE_EVIDENCE',Node_periksa_ulang_dokumen:'FILE_EVIDENCE'};
  function configuration(wo){
    const node=wo?.nodeId;
    const route=routes[node];
    if(!route)return null;
    const fields=forms.has(node)||review(node)||permitSignature(node)?[['reason','Isi dokumen atau catatan pemeriksaan','textarea']]:[];
    if(node==='Node_periksa_kelengkapan') fields.push(['checked','Dokumen dan tanda tangan telah diperiksa','checkbox']);
    if(node==='Node_izin_tinggi_digunakan') fields.push(['used','Izin kerja ketinggian digunakan','checkbox']);
    const alternatives=permitSignature(node)?[['permit-close-objection','Catat kendala penutupan']]:review(node)?[['closure-return','Kembalikan untuk revisi']]:node==='Node_periksa_kelengkapan'?[['closure-return','Minta kelengkapan berkas']]:[];
    return {screen:['Node_terima_pemberitahuan_mgr','Node_laporan_harian','Node_kumpulkan_berkas','Node_periksa_kelengkapan','Node_minta_dokumen_kurang','Node_periksa_ulang_dokumen','Node_arsipkan_pekerjaan','Node_tutup_wo'].includes(node)?'R03':'R01',fields,primary:['closure-next',route[0]],alternatives,upload:!!uploads[node]};
  }
  function handle({state,wo,actor,now,action,data,follow,fail,requireText}){
    const node=wo.nodeId, route=routes[node];
    if(!route || !['closure-next','closure-return','document-file','permit-close-objection'].includes(action))return false;
    if(!wo.operational_completed_at)fail('Selesai operasional belum tercatat.');
    if(action==='closure-return' && !review(node) && node!=='Node_periksa_kelengkapan')fail('Pengembalian tidak tersedia.');
    const record={actorId:actor.id,actorName:actor.name,role:actor.role,at:now,note:data.reason||''};
    const latest=type=>state.documents.findLast(doc=>doc.woId===wo.id && doc.type===type);
    if(action==='document-file'){
      const type=uploads[node];
      if(!type)fail('Unggahan tidak tersedia pada tahap ini.');
      requireText('name','nama berkas');
      if(typeof data.content!=='string'||data.content.length>2800000||!/^data:(application\/pdf|image\/(png|jpeg|webp));base64,[A-Za-z0-9+/=]+$/.test(data.content))fail('Pilih PDF atau gambar maksimal 2 MB.');
      const file={id:global.crypto.randomUUID(),woId:wo.id,type:'support-file',documentType:type,forVersion:(latest(type)?.version||0)+1,name:data.name,content:data.content,at:now,createdBy:actor.id};
      state.documents.push(file);wo.documentIds.push(file.id);return true;
    }
    function add(type,extra={}){
      const doc={id:global.crypto.randomUUID(),woId:wo.id,type,version:(latest(type)?.version||0)+1,payload:{Isi:data.reason||''},createdBy:actor.id,at:now,decisions:[],...extra};
      doc.fileIds=state.documents.filter(file=>file.woId===wo.id&&file.type==='support-file'&&file.documentType===type&&file.forVersion===doc.version).map(file=>file.id);
      state.documents.push(doc);wo.documentIds.push(doc.id);return doc;
    }
    const notice=latest('COMPLETION_NOTICE');
    const permitClose=latest('HEIGHT_CLOSURE');
    if(action==='permit-close-objection'){
      if(!permitSignature(node)||!permitClose||permitClose.id!==data.documentVersionId)fail('Tugas atau versi penutupan izin berubah.');
      requireText('reason','kendala penutupan');
      permitClose.objections ||= [];
      permitClose.objections.push(record);
      return true;
    }
    const target=route.slice(1);
    if((forms.has(node)&&node!=='Node_periksa_kelengkapan')||action==='closure-return')requireText('reason','isi dokumen atau alasan pengembalian');
    if(node==='Node_izin_tinggi_digunakan'){
      if(data.used && !state.documents.some(doc=>doc.id===wo.heightPermitId&&doc.woId===wo.id&&doc.type==='HEIGHT_PERMIT'&&doc.status==='issued'))fail('Izin awal terbit diperlukan.');
      wo.heightPermitUsed=data.used===true;
      if(wo.heightPermitUsed)follow('Node_lengkapi_izin_selesai');
      else follow('Node_gabung_penutupan_izin','Node_laporan_hasil_kepala_regu');
      return true;
    }
    if(node==='Node_lengkapi_izin_selesai')add('HEIGHT_CLOSURE',{sourcePermitId:wo.heightPermitId,status:'submitted'});
    if(node.startsWith('Node_ttd_penutupan_izin_')){
      if(!permitClose || data.documentVersionId!==permitClose.id)fail('Versi penutupan izin berubah.');
      permitClose.decisions.push({...record,id:global.crypto.randomUUID(),result:'approved'});
    }
    if(node==='Node_arsip_izin_ketinggian'){
      if(permitClose?.decisions.length!==4 || data.documentVersionId!==permitClose.id)fail('Empat tanda tangan pada versi izin diperlukan.');
      permitClose.status='recorded';permitClose.recorded=record;
    }
    if(node==='Node_laporan_hasil_kepala_regu')add('WORK_RESULT');
    if(['Node_susun_pemberitahuan','Node_revisi_pemberitahuan'].includes(node)){
      const result=latest('WORK_RESULT');
      if(!result)fail('Laporan hasil belum tersedia.');
      add('COMPLETION_NOTICE',{sourceResultId:result.id,status:'submitted'});
    }
    if(review(node)||['Node_kirim_pemberitahuan_mgr','Node_terima_pemberitahuan_mgr'].includes(node)){
      if(!notice || data.documentVersionId!==notice.id)fail('Versi pemberitahuan berubah.');
      if(review(node)){
        if(notice.status!=='submitted')fail('Versi ini tidak sedang diperiksa.');
        notice.decisions.push({...record,id:global.crypto.randomUUID(),result:action==='closure-return'?'rejected':'approved'});
        if(action==='closure-return'){notice.status='rejected';follow(target[0],'Node_revisi_pemberitahuan');return true;}
      }
      if(node==='Node_kirim_pemberitahuan_mgr'){
        if(notice.decisions.length!==3||notice.decisions.some(item=>item.result!=='approved'))fail('Tiga persetujuan diperlukan.');
        notice.sent=record;notice.status='sent';
      }
      if(node==='Node_terima_pemberitahuan_mgr'){
        if(notice.status!=='sent')fail('Pemberitahuan belum disampaikan.');
        notice.received=record;notice.status='received';
      }
    }
    if(node==='Node_laporan_harian'){
      if(notice?.status!=='received')fail('Manajer belum menerima pemberitahuan.');
      add('DAILY_REPORT',{noticeId:notice.id});
    }
    if(node==='Node_kumpulkan_berkas'||node==='Node_periksa_ulang_dokumen')add('FILE_EVIDENCE');
    if(node==='Node_minta_dokumen_kurang')add('MISSING_FILE_REQUEST');
    if(node==='Node_periksa_kelengkapan'){
      if(action==='closure-return'){wo.fileCheck=null;follow(target[0],'Node_minta_dokumen_kurang');return true;}
      const required=['SP2B','SP3B','EQUIPMENT_CHECKLIST','JSA','IBPPR','WORK_RESULT','COMPLETION_NOTICE','DAILY_REPORT','FILE_EVIDENCE'];
      if(wo.heightPermitUsed)required.push('HEIGHT_CLOSURE');
      const signed={SP2B:'issued',SP3B:'issued',EQUIPMENT_CHECKLIST:'approved',JSA:'approved',IBPPR:'approved',COMPLETION_NOTICE:'received',HEIGHT_CLOSURE:'recorded'};
      if(!data.checked || !required.every(type=>latest(type)&&(!signed[type]||latest(type).status===signed[type])))fail('Periksa seluruh berkas wajib dan tanda tangannya.');
      const evidence=state.documents.filter(doc=>doc.woId===wo.id&&doc.type==='FILE_EVIDENCE');
      wo.fileCheck={...record,documentIds:[...new Set([...required.map(type=>latest(type).id),...evidence.map(item=>item.id),...(wo.heightPermitUsed?[wo.heightPermitId]:[])])]};
    }
    if(node==='Node_arsipkan_pekerjaan'){
      if(!wo.fileCheck)fail('Pemeriksaan kelengkapan belum selesai.');
      const archive=add('WO_ARCHIVE',{documentIds:[...wo.fileCheck.documentIds]});
      wo.archiveId=archive.id;
    }
    if(node==='Node_tutup_wo'){
      if(!wo.archiveId||latest('WO_ARCHIVE')?.id!==wo.archiveId)fail('Paket arsip belum tercatat.');
      wo.administrative_completed_at=now;
    }
    follow(...target);
    wo.status=wo.administrative_completed_at?'WO Completed':'Operationally Completed';
    return true;
  }
  function documentType(node){
    if(uploads[node])return uploads[node];
    if(node?.startsWith('Node_ttd_penutupan_izin_')||node==='Node_arsip_izin_ketinggian')return 'HEIGHT_CLOSURE';
    if(node&&(review(node)||['Node_kirim_pemberitahuan_mgr','Node_terima_pemberitahuan_mgr'].includes(node)))return 'COMPLETION_NOTICE';
  }
  const api={handle,configuration,documentType};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else global.IwomsClosure=api;
})(typeof window!=='undefined'?window:globalThis);
