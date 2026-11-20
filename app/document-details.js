(function (global) {
  'use strict';
  const detailFields = {
    survey: [['measurements','Hasil pengukuran','textarea'],['soil','Struktur tanah'],['roadDistance','Jarak lokasi ke jalan'],['crewSize','Jumlah pekerja'],['duration','Durasi'],['difficulty','Tingkat kesulitan'],['nearBuilding','Kondisi bangunan sekitar'],['trees','Kondisi pepohonan'],['serviceUnit','ULP']],
    HEIGHT_PERMIT: [['planEndDate','Tanggal akhir rencana','date'],['planEndTime','Jam akhir rencana','time'],['validFrom','Izin berlaku sejak','date'],['validFromTime','Jam mulai izin','time'],['validUntil','Izin berlaku sampai','date'],['validUntilTime','Jam akhir izin','time'],['delayDate','Tanggal penundaan','date'],['delayTime','Jam penundaan','time'],['delayDuration','Lama penundaan beserta satuannya'],['delayReason','Alasan penundaan'],['resumedDate','Tanggal mulai kembali','date'],['resumedTime','Jam mulai kembali','time'],['additionalPpe','APD tambahan','textarea'],['cpName','Nama CP pada hasil pemeriksaan'],['cpReviewedAt','Tanggal pemeriksaan CP','date']],
    SP3B: [['communication','Sarana komunikasi'],['operationConditions','Syarat operasi khusus','textarea'],['operationNotes','Keterangan tambahan','textarea'],['duration','Lama kewenangan']],
    WORK_RESULT: [['realization','Pekerjaan yang terealisasi','textarea'],['quantity','Volume realisasi','number'],['unit','Satuan'],['measurements','Hasil pengukuran','textarea'],['finalCondition','Kondisi akhir','textarea']],
    COMPLETION_NOTICE: [['realization','Ringkasan realisasi','textarea'],['remarks','Keterangan tambahan','textarea']],
    DAILY_REPORT: [['date','Tanggal pelaporan','date'],['realization','Realisasi pekerjaan','textarea'],['quantity','Volume','number'],['unit','Satuan'],['remarks','Catatan kinerja','textarea']],
  };
  const jsaChecks=[
    'Helm','Sepatu keselamatan','Kacamata','Earplug','Earmuff','Sarung tangan katun',
    'Sarung tangan karet','Sarung tangan 20 kV','Pelampung','Tabung pernapasan','Full body harness',
    'APAR','Rambu keselamatan','LOTO','Radio telekomunikasi',
  ];
  const workChecks={
    Node_selesai_penunjukan: [[265, "Check list peralatan, single line diagram"], [279, "Menandatangani SP2B/SP3B"], [292, "Memasukkan peralatan/material ke dalam mobil"], [305, "Sampai di lokasi melaksanakan job briefing dan berdoa"], [318, "Menempatkan mobil SL , tool rack dan tarpaulin"], [331, "Memasang rambu-rambu"], [345, "Memasang Out Trigger dan Grounding Kendaraan"], [358, "Melakukan pengamatan jaringan"], [371, "Persiapan/pemeriksaan peralatan kerja"], [384, "Persiapan/pemeriksaan kesehatan/kesiapan linesman"], [397, "Pemeriksaan kondisi dan kelengkapan APD"], [411, "Melapor kepada Piket Pengatur (Jaringan kondisi SOK)"], [424, "Memeriksa pemasangan grounding dan outtrigers mobil SL"], [437, "Memeriksa kondisi lengan isolasi, bucket dan controller"], [450, "Mengamankan hazard (JTR,pohon,bangunan,skur)"], [463, "Test tegangan"]],
    Node_pengawasan_k3: [[490, "Mengawasi jarak linesman dengan BKT"], [503, "Mengawasi pelaksanaan pekerjaan sesuai SOP"], [517, "Mengawasi linesman pada posisi yang tepat"], [530, "Mengawasi pergerakan bucket"], [543, "Mengawasi penggunaan APD/peralatan kerja"], [556, "Mengatur pengiriman/penurunan peralatan/material"], [569, "Memecahkan permasalahan yang dihadapi linesman"]],
    Node_laporan_hasil_kepala_regu: [[596, "Mengevaluasi hasil pekerjaan"], [609, "Melapor kepada Piket Pengatur (Jaringan kondisi Normal)"], [622, "Memasukkan peralatan/material ke dalam mobil"], [635, "Mengisi laporan penyelesaian pekerjaan PDKB"], [649, "Menutup pekerjaan dan memimpin Doa"]],
  };
  function storeWorkChecks(state,wo,node,data,actor,at,fail){
    if(data.fixedChecks==null)return;
    const fields=workChecks[node];
    const checklist=state.documents.findLast(doc=>doc.woId===wo.id && doc.type==='EQUIPMENT_CHECKLIST' && doc.status==='approved');
    if(!checklist || !fields || !Array.isArray(data.fixedChecks) || data.fixedChecks.length!==fields.length)fail('Butir pemeriksaan tidak cocok dengan checklist WO.');
    const checks=data.fixedChecks.flatMap((entry,index)=>{
      if(!entry?.answer && !entry?.note)return [];
      if(!['yes','no'].includes(entry?.answer) || typeof entry.note!=='string' || entry.note.length>500 || (entry.answer==='no'&&!entry.note.trim()))fail('Pilih Ada/Tidak dan isi keterangan untuk hasil Tidak.');
      return [{row:fields[index][0],label:fields[index][1],answer:entry.answer,note:entry.note.trim()}];
    });
    if(!checks.length)return;
    (wo.fixedChecklistChecks ||= []).push({documentVersionId:checklist.id,node,actorName:actor.name,at,checks});
  }
  const heightChecks=[
    ['Umum', [
      [568,'Pelatihan kerja ketinggian'],[617,'Metode kerja / instruksi kerja'],[646,'Inspeksi full body harness'],
      [690,'Pemeriksaan peralatan dan material'],[741,'Transfer barang di ketinggian'],[783,'Dampak terhadap pekerjaan lain'],
      [827,'Pembatas area dan rambu'],[856,'Prosedur tanggap darurat'],[886,'Kesiapan penyelamatan'],[928,'Kajian risiko jatuh'],
    ]],
    ['Tangga', [[1017,'Kondisi dan bahan tangga'],[1075,'Tinggi dan ujung tangga'],[1134,'Susunan tangga'],[1182,'Pengamanan puncak tangga'],[1213,'Kemiringan tangga']]],
    ['Perancah jembatan', [[1272,'Tumpuan keempat kaki'],[1302,'Tinggi platform'],[1342,'Dimensi pijakan']]],
    ['Alat angkat mekanik', [[590,'Penilaian bahaya'],[625,'Izin kelistrikan bila diperlukan'],[688,'Jarak aman'],[742,'Muatan kerja'],[770,'Kondisi tanah'],[800,'Pengikat ke platform']]],
    ['Forklift', [[858,'Pengikat ke kerangka'],[887,'Lintasan forklift'],[916,'Pengemudi siaga']]],
    ['Clamp & bolt scaffolding', [[979,'Kompetensi petugas'],[1007,'Sertifikat material'],[1043,'Gambar dan perhitungan'],[1093,'Stabilitas'],[1137,'Pegangan dan papan'],[1183,'Jarak pegangan dan papan'],[1218,'Pegangan ganda'],[1280,'Inspeksi perancah'],[1333,'Penyimpanan material'],[1371,'Tag hijau'],[1419,'Tag merah']]],
  ];
  function permitChecks(data,fail){
    if(data.heightCheckAnswers==null)return {};
    if(typeof data.heightCheckAnswers!=='object' || Array.isArray(data.heightCheckAnswers))fail('Jawaban pemeriksaan CP tidak valid.');
    const valid=new Set(heightChecks.flatMap(([_,rows])=>rows.map(([row])=>String(row))));
    const entries=Object.entries(data.heightCheckAnswers).filter(([,value])=>value);
    if(entries.some(([row,value])=>!valid.has(row) || !['yes','na'].includes(value)))fail('Jawaban pemeriksaan CP tidak valid.');
    if(entries.length && !String(data.cpName || '').trim())fail('Isi nama CP yang memberikan hasil pemeriksaan.');
    return Object.fromEntries(entries);
  }
  const rowFields={
    survey:[['category','Jenis'],['name','Nama item'],['quantity','Jumlah'],['unit','Satuan']],
    JSA:[['steps','Langkah pekerjaan'],['hazards','Bahaya'],['controls','Pengendalian'],['responsible','Penanggung jawab']],
    IBPPR:[['activity','Kegiatan'],['hazards','Bahaya'],['impact','Dampak'],['consequence','Konsekuensi awal'],['likelihood','Kemungkinan awal'],['riskAssessment','Tingkat risiko awal'],['controls','Pengendalian'],['residualConsequence','Konsekuensi sisa'],['residualLikelihood','Kemungkinan sisa'],['residualRisk','Tingkat risiko sisa'],['controlStatus','Status pengendalian'],['responsible','Penanggung jawab']],
    HEIGHT_PERMIT:[['name','Nama pekerja'],['position','Posisi pekerja']],
  };
  const ibpprMatrix={A:'MMHEE',B:'LMHEE',C:'LMHHE',D:'LLMHE',E:'LLMHH'};
  function riskLevel(likelihood,consequence){
    return /^[1-5]$/.test(consequence || '') ? ibpprMatrix[likelihood]?.[Number(consequence)-1] || '' : '';
  }
  function extras(type,data,fail){
    const result={};
    for(const [key,label,input] of detailFields[type] || []){
      if(data[key]==null || data[key]==='')continue;
      const value=String(data[key]).trim();
      if(value.length>4000)fail(label+' maksimal 4.000 karakter.');
      if(input==='date' && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0,10)!==value))fail(label+' tidak valid.');
      if(input==='time' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(value))fail(label+' tidak valid.');
      if(input==='number' && (!Number.isFinite(Number(value)) || Number(value)<0))fail(label+' tidak valid.');
      result[key]=value;
    }
    if(result.validFrom && result.validUntil && [result.validUntil,result.validUntilTime||'23:59'].join('T')<[result.validFrom,result.validFromTime||'00:00'].join('T'))fail('Masa berlaku izin terbalik.');
    return result;
  }
  function rows(type,data,fail){
    if(data.rows==null)return [];
    const fields=rowFields[type];
    if(!fields || !Array.isArray(data.rows) || data.rows.length>50)fail('Baris isian dokumen tidak valid.');
    if(type==='HEIGHT_PERMIT' && data.rows.length>8)fail('Template izin memuat maksimal delapan pekerja.');
    return data.rows.map(row=>{
      if(!row || typeof row!=='object')fail('Baris isian dokumen tidak valid.');
      if(type==='survey' && (!['equipment','apd','material'].includes(row.category) || !(Number(row.quantity)>0) || !Number.isFinite(Number(row.quantity))))fail('Pilih jenis item dan isi jumlah yang valid.');
      const computed=type==='IBPPR'?{
        riskAssessment:riskLevel(row.likelihood,row.consequence),
        residualRisk:riskLevel(row.residualLikelihood,row.residualConsequence),
      }:{};
      return Object.fromEntries(fields.map(([key,label])=>{
        const source=computed[key] ?? row[key];
        const value=typeof source==='string'?source.trim():'';
        if(!value || value.length>1000)fail('Lengkapi '+label+' pada setiap baris (maksimal 1.000 karakter).');
        return [key,value];
      }));
    });
  }
  function signature(data,fail){
    const value=data.signature;
    if(value==null)return {};
    if(typeof value.image!=='string' || value.image.length>174800 || !/^data:image\/png;base64,iVBORw0KGgo[A-Za-z0-9+/]+={0,2}$/.test(value.image))fail('Pilih gambar tanda tangan PNG maksimal 128 KB.');
    if(!Number.isFinite(value.x) || !Number.isFinite(value.y) || value.x<0 || value.x>.8 || value.y<0 || value.y>.88)fail('Posisi tanda tangan di luar halaman.');
    if(value.page!=null && ![0,1].includes(value.page))fail('Halaman tanda tangan tidak valid.');
    return {signature:{image:value.image,x:value.x,y:value.y,...(value.page===1?{page:1}:{})}};
  }
  function checklist(data,fail){
    if(data.jsaChecks==null)return [];
    if(!Array.isArray(data.jsaChecks) || data.jsaChecks.some(value=>!jsaChecks.includes(value)))fail('Perlengkapan JSA tidak valid.');
    return [...new Set(data.jsaChecks)];
  }
  const api={detailFields,rowFields,extras,rows,signature,riskLevel,jsaChecks,checklist,workChecks,storeWorkChecks,heightChecks,permitChecks};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else global.IwomsDocumentDetails=api;
})(globalThis);
