(function (global) {
  'use strict';

  const sourceForms = {
    'Form Survei': 'survey',
    JSA: 'jsa',
    IBPPR: 'ibppr',
    'Izin Kerja Ketinggian': 'izin-kerja-ketinggian',
    SP2B: 'sp2b',
    SP3B: 'sp3b',
    'Checklist peralatan dan material': 'checklist',
  };
  const demoForms = {
    'Tanda Terima SP2B': [['Nomor SP2B','sp2bNumber'],['Diserahkan oleh','handedBy'],['Waktu penyerahan','handedAt'],['Diterima oleh','receivedBy'],['Waktu penerimaan','receivedAt'],['Dicatat oleh','recordedBy'],['Waktu pencatatan','recordedAt']],
    'Surat Kewenangan personel': [['Pengawas pekerjaan','leader'],['Nomor surat / sertifikat','leaderCert'],['Pengawas K3','safety'],['Nomor surat / sertifikat','safetyCert'],['Masa berlaku','authorityValidity'],['Hasil pemeriksaan','authorityResult']],
    'Berita Acara Delegasi': [['Pemberi delegasi','leader'],['Penerima delegasi','delegate'],['Pihak mengetahui','supervisor'],['Lingkup delegasi','delegationScope'],['Tanggal arsip','delegationDate']],
    'Laporan Hasil Pekerjaan': [['Pelapor','leader'],['Selesai fisik','physicalDate'],['Selesai operasional','operationalDate'],['Tanggal penyerahan','reportDate'],['Hasil pekerjaan','workResult']],
    'Pemberitahuan Penyelesaian': [['Disusun oleh','preparator'],['Supervisor','supervisor'],['Pengawas pekerjaan','leader'],['Pengawas K3','safety'],['Isi pemberitahuan','workResult'],['Tanggal pengajuan','noticeSubmitted'],['Tanggal penyampaian','noticeSent'],['Diterima oleh','manager'],['Tanggal penerimaan','noticeDate']],
    'Laporan Kinerja Harian': [['Tanggal pelaporan','dailyDate'],['Preparator','preparator'],['Selesai operasional','operationalDate'],['Hasil pekerjaan','workResult']],
  };
  const workOrder = {
    id:'WO-DEMO-048', number:'048/WO/UP3 YOGYAKARTA.PREP/X/2026',
    job:'Pemeliharaan Insulator Penegang Fasa R', location:'Jl Tangkilan Godean',
    unit:'UP3 Sedayu', pole:'U2-20/56', feeder:'Godean 4', substation:'GI 20 kV Godean',
    poleType:'Beton, 12 m', conductor:'A3C, 240 mm2', method:'PDKB-TM Sentuh Langsung',
    planDate:'26 November 2026', planTime:'09:00', soil:'Kering', access:'Akses dari jalan umum',
    difficulty:'Sedang', crewSize:'6 orang', preparator:'Rian Demo',
    findings:'Lokasi dan data aset dicatat dalam survei demo.',
    crew1:'Sugeng Demo', crew2:'Ayu Demo', crew3:'Agus Demo',
    jsa0Step:'Verifikasi identitas aset', jsa0Hazard:'Aset salah diidentifikasi',
    jsa0Control:'Cocokkan lokasi dan nomor tiang dengan WO',
    risk00:'Verifikasi identitas aset', risk01:'Identitas aset keliru',
    risk02:'Pekerjaan salah lokasi', risk06:'Cocokkan identitas aset dengan WO',
    material0:'Insulator penegang',
  };
  const assets = new Map();
  async function read(url, format) {
    if (!assets.has(url)) {
      assets.set(url, fetch(url).then(response=>{
        if(!response.ok)throw Error('Berkas pratinjau tidak ditemukan.');
        return response[format]();
      }).catch(error=>{assets.delete(url);throw error;}));
    }
    return assets.get(url);
  }

  function dataFor(wo, events, version) {
    const date=pattern=>events.findLast(entry=>pattern.test(entry.name))?.date || '';
    const actor=pattern=>events.findLast(entry=>pattern.test(entry.name))?.actor || '';
    const sp2bDate=date(/^SP2B diterbitkan/);
    const sp3bDate=date(/^SP3B diterbitkan/);
    const manager=actor(/^(SP2B diterbitkan|Usulan disahkan|Pemberitahuan diterima)/);
    return {
      ...wo, version,
      surveyDate:date(/^Hasil survei/), jsaDate:date(/^JSA diajukan/), ibpprDate:date(/^IBPPR diajukan/),
      asmanDate:date(/^Usulan disetujui Asman/), supervisorDate:date(/^Pekerjaan dinyatakan layak/),
      surveyNumber:wo.id+'/SURVEI', ibpprNumber:wo.id+'/IBPPR',
      sp2bNumber:sp2bDate && wo.id+'/SP2B', sp3bNumber:sp3bDate && wo.id+'/SP3B', sp2bDate, sp3bDate,
      sp2bPlaceDate:sp2bDate && 'Yogyakarta, '+sp2bDate, sp3bPlaceDate:sp3bDate && 'Yogyakarta, '+sp3bDate,
      sp2bInstruction:sp2bDate && 'Kepala Operasi '+manager+' memerintahkan pelaksanaan pekerjaan sesuai WO '+wo.id+'.',
      sp3bInstruction:sp3bDate && 'Kepala Operasi '+manager+' menugaskan pengawasan pekerjaan sesuai WO '+wo.id+'.',
      manager, asman:actor(/^JSA disetujui/), k3:actor(/^JSA diperiksa/),
      supervisor:actor(/^(SP2B diperiksa|Prioritas dan rencana kerja)/),
      leader:actor(/^(Penugasan pengawasan diterima|Pekerjaan fisik)/),
      safety:actor(/^(Penugasan K3 diterima|Awasi K3)/),
      check0:date(/^Checklist diperiksa dan ditandatangani Kepala Regu/) && 'X',
      check1:sp2bDate && sp3bDate && 'X',
      check3:date(/^Job briefing dicatat/) && 'X',
      check8:date(/^Hasil cek alat/) && 'X',
      check9:date(/^Hasil pemeriksaan kesehatan/) && 'X',
      check10:date(/^Hasil pemeriksaan kesehatan/) && 'X',
      check11:date(/^SOK dinyatakan terkonfirmasi/) && 'X',
      check24:date(/^Pekerjaan dinyatakan selesai operasional/) && 'X',
      permitPurpose:date(/^Izin ketinggian diperlukan/) && 'Pekerjaan memerlukan izin ketinggian.',
      permitDate:date(/^Izin lengkap dicatat/), permitClosed:date(/^Penutupan izin dicatat/),
      related:actor(/^Izin ditandatangani Bagian Terkait/),
      authorityResult:date(/^Surat Kewenangan dan kompetensi/) && 'Masa berlaku dan kompetensi diverifikasi.',
      delegate:actor(/^BA delegasi diterima/), delegationDate:date(/^BA delegasi diarsipkan/),
      delegationScope:date(/^BA delegasi disiapkan/) && 'Pengawasan pekerjaan pada WO '+wo.id,
      physicalDate:date(/^Selesai fisik dilaporkan/), operationalDate:date(/^Pekerjaan dinyatakan selesai operasional/),
      workResult:date(/^Laporan hasil diserahkan/) && 'Laporan hasil diserahkan untuk WO '+wo.id+'.',
      noticeDate:date(/^Pemberitahuan diterima/), dailyDate:date(/^Laporan kinerja harian diinput/),
    };
  }

  function drawField(page, font, rect, value) {
    const text = String(value ?? '').normalize('NFC').replace(/[^\x20-\x7e\xa0-\xff]/g,' ').trim();
    if (!text) return;
    const [x,y,right,bottom]=rect;
    const naturalWidth=font.widthOfTextAtSize(text,1);
    const size=Math.min(10,(right-x-3)/naturalWidth,(bottom-y)*.7);
    if(size>0)page.drawText(text,{x:x+1,y:page.getHeight()-y-size-1,size,font});
  }

  function fillHeightPermit(page, font, data, events) {
    const scale=page.getWidth()/1769;
    const request=events.find(entry=>/^Izin ketinggian diperlukan dan diajukan/.test(entry.name));
    const fields=[
      [342,194,730,216,data.permitRequester || request?.actor || data.preparator],
      [334,222,730,245,data.job],
      [334,252,730,275,[data.location,data.unit].filter(Boolean).join(' / ')],
      [991,194,1140,216,data.planDate],
      [1201,194,1278,216,data.planTime],
      [1368,194,1528,216,data.planEndDate],
      [1588,194,1724,216,data.planEndTime],
      [949,222,1724,245,data.number || data.id],
      [949,252,1724,275,data.unit],
      [76,344,295,370,data.validFrom],[414,344,625,370,data.validFromTime],
      [76,432,295,457,data.validUntil],[414,432,625,457,data.validUntilTime],
      [854,441,1032,467,data.resumedDate],[1093,441,1185,467,data.resumedTime],
      [1284,344,1725,368,data.delayReason],
      [857,345,1160,371,data.delayDuration],[833,377,1008,399,data.delayDate],[1075,377,1160,399,data.delayTime],
      [880,1502,1725,1524,data.additionalPpe],
    ];
    const crew=data.permitWorkers ? data.permitWorkers.slice(0,8).map(worker=>typeof worker==='string'?[worker,'']:[worker.name,worker.position]) : [
      [data.crew1,'Kepala Regu PDKB'],
      [data.crew2,'Pengawas K3 PDKB'],
      [data.crew3,'Pelaksana PDKB'],
    ];
    crew.forEach(([name,role],index)=>{
      if(!name)return;
      const top=1724+24*(index%4);
      const rightSide=index>=4;
      fields.push(rightSide ? [913,top,1268,top+21,name] : [78,top,478,top+21,name]);
      fields.push(rightSide ? [1283,top,1725,top+21,role] : [494,top,837,top+21,role]);
    });
    for(const [row,answer] of Object.entries(data.heightCheckAnswers || {})){
      const y=Number(row);
      const left=global.IwomsDocumentDetails?.heightChecks.slice(0,3).some(([,checks])=>checks.some(([coord])=>coord===y));
      const x=left?(answer==='yes'?689:785):(answer==='yes'?1525:1660);
      fields.push([x,y,x+24,y+20,'X']);
    }
    for(const [x,y,right,bottom,value] of fields){
      drawField(page,font,[x,y,right,bottom].map(coordinate=>coordinate*scale),value);
    }
  }

  function drawDemoForm(pdf, font, name, data) {
    const page=pdf.addPage([595.28,841.89]);
    page.drawText('IWOMS / FORMULIR DEMO',{x:44,y:784,size:10,font});
    drawField(page,font,[43,72,552,94],name);
    const fields=[
      ['Nomor WO','number'],['Unit pekerjaan','unit'],['Jenis pekerjaan','job'],['Lokasi','location'],['Versi','version'],
      ...demoForms[name],
    ];
    fields.forEach(([label,key],index)=>{
      const y=118+index*37;
      page.drawText(label,{x:44,y:page.getHeight()-y,size:9,font});
      drawField(page,font,[44,y+4,551,y+20],data[key]);
      page.drawLine({start:{x:44,y:page.getHeight()-y-21},end:{x:551,y:page.getHeight()-y-21},thickness:.5});
    });
  }

  const liveDate=new Intl.DateTimeFormat('id-ID',{dateStyle:'long',timeZone:'Asia/Jakarta'});
  const liveTime=new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Jakarta'});
  function dateValue(value) {
    if(!value)return '';
    const date=new Date(value);
    return Number.isNaN(date.valueOf()) ? value : liveDate.format(date);
  }
  function timestamp(value){
    if(!value)return '';
    const date=new Date(value);
    return Number.isNaN(date.valueOf())?value:liveTime.format(date)+' WIB';
  }

  function liveData(wo,record,events) {
    const payload=record.payload || record.data || {};
    const actor=role=>record.decisions?.findLast(decision=>decision.role===role && decision.result==='approved')?.actorName;
    const eventActor=action=>events.findLast(event=>event.action===action)?.actor?.name;
    const roster=record.rosterSnapshot?.people || record.people || wo.authorityRoster?.people || [];
    const person=(id,pattern)=>roster.find(item=>id ? item.personId===id : pattern.test(item.duty));
    const leader=person(payload.workSupervisor,/kepala regu|pengawas pekerjaan/i);
    const safety=person(payload.safetySupervisor,/pengawas k3/i);
    const plan=record.planSnapshot || wo.plan || {};
    const approved=record.status==='issued';
    const recordedNumber=record.type==='SP2B'||record.type==='SP3B'?payload.number:'';
    const dated=dateValue(record.submittedAt || record.at);
    const issuedDate=approved?dateValue(record.issuedAt):'';
    const permitWorkers=payload.rows || (Array.isArray(payload.workers)?payload.workers.map(worker=>typeof worker==='string'?worker:worker.name):String(payload.workers || '').split(/[,;\n]+/).map(name=>name.trim()).filter(Boolean));
    const data={
      id:wo.id,number:wo.officialWoNumber||wo.id,job:payload.scope || wo.nama_wo || wo.nama_pekerjaan,
      location:payload.workLocation || payload.location || wo.lokasi,unit:wo.workUnit||wo.unitId,
      pole:wo.poleNumber,feeder:payload.circuit||wo.feeder,substation:wo.substation,
      poleType:[wo.poleType,wo.poleHeight && wo.poleHeight+' m'].filter(Boolean).join(' / '),
      conductor:[wo.conductorType,wo.conductorArea && wo.conductorArea+' mm2'].filter(Boolean).join(' / '),
      planDate:dateValue(plan.date),planTime:plan.time,method:plan.method,
      preparator:record.submittedByName || record.createdByName || wo.preparator || eventActor('survey'),
      surveyDate:dateValue(payload.surveyDate), findings:payload.findings,access:payload.roadDistance || payload.access,
      ...Object.fromEntries(['soil','roadDistance','crewSize','duration','difficulty','nearBuilding','trees','serviceUnit'].map(key=>[key,payload[key]])),
      planEndDate:dateValue(payload.planEndDate),planEndTime:payload.planEndTime,validFrom:dateValue(payload.validFrom),validUntil:dateValue(payload.validUntil),
      validFromTime:payload.validFromTime,validUntilTime:payload.validUntilTime,delayReason:payload.delayReason,
      delayDate:dateValue(payload.delayDate),delayTime:payload.delayTime,delayDuration:payload.delayDuration,resumedDate:dateValue(payload.resumedDate),resumedTime:payload.resumedTime,additionalPpe:payload.additionalPpe,
      jsaDate:dated,ibpprDate:dated,jsa0Step:payload.steps,jsa0Hazard:payload.hazards,jsa0Control:payload.controls,
      risk01:payload.hazards,risk06:payload.controls,risk05:payload.riskAssessment,risk09:payload.residualRisk,risk011:payload.responsible,
      supervisor:actor('supervisor_pdkb'),k3:actor('p2k3_k3l'),asman:actor('asman_jaringan'),manager:record.received?.actorName || actor('manajer_area'),
      sp2bNumber:record.type==='SP2B'?recordedNumber:'', sp3bNumber:record.type==='SP3B'?recordedNumber:'',
      sp2bDate:issuedDate,sp3bDate:issuedDate,
      sp2bPlaceDate:issuedDate && 'Yogyakarta, '+issuedDate,sp3bPlaceDate:issuedDate && 'Yogyakarta, '+issuedDate,
      leader:record.type==='COMPLETION_NOTICE'?actor('kepala_regu') || leader?.name:record.type==='WORK_RESULT'?record.createdByName || leader?.name:record.type==='DELEGATION'?record.decisions?.find(d=>d.role==='kepala_regu')?.actorName || leader?.name:leader?.name,leaderCert:leader?.certificateNo,safety:record.type==='COMPLETION_NOTICE'?actor('pengawas_k3') || safety?.name:safety?.name,safetyCert:safety?.certificateNo,
      communication:payload.communication,duration:payload.duration,operationConditions:payload.operationConditions,operationNotes:payload.operationNotes || payload.limits, delegate:payload.Penerima,delegationScope:payload.Lingkup,delegationDate:record.status==='archived'?dateValue(record.decisions?.findLast(d=>d.role==='preparator_pdkb')?.at || record.at):'',
      authorityValidity:leader && [leader.validFrom,leader.validUntil].filter(Boolean).join(' / '),
      authorityResult:record.kind,physicalDate:dateValue(wo.physical_completed_at),operationalDate:dateValue(wo.operational_completed_at),
      workResult:payload.Isi || payload.result,noticeDate:dateValue(record.received?.at),noticeSent:dateValue(record.sent?.at),noticeSubmitted:dated,reportDate:timestamp(record.at),dailyDate:dateValue(payload.date),
      heightCheckAnswers:payload.heightCheckAnswers,cpName:payload.cpName,cpReviewedAt:dateValue(payload.cpReviewedAt),
      permitWorkers,permitRequester:record.submittedByName || eventActor('height-needed'),
      version:record.version,
    };
    if(record.type==='JSA')payload.rows?.slice(0,10).forEach((row,i)=>{
      data['jsa'+i+'Step']=row.steps;
      data['jsa'+i+'Hazard']=row.hazards;
      data['jsa'+i+'Control']=row.controls;
    });
    if(record.type==='IBPPR')payload.rows?.slice(0,8).forEach((row,i)=>{
      ['activity','hazards','impact','consequence','likelihood','riskAssessment','controls','residualConsequence','residualLikelihood','residualRisk','controlStatus','responsible'].forEach((key,j)=>{data['risk'+i+j]=row[key];});
    });
    roster.slice(0,7).forEach((entry,index)=>{data['crew'+(index+1)]=entry.name;});
    (record.items || []).filter(item=>item.category==='material').slice(0,6).forEach((item,index)=>{
      data['material'+index]=[item.name,item.quantity,item.unit].filter(Boolean).join(' ');
    });
    return data;
  }

  function appendRecordDetails(pdf,font,item,record,data,related){
    const payload=record.payload || record.data || {};
    const lines=[];
    for(const file of related?.files || [])if(file.caption)lines.push(['Lampiran '+file.name,file.caption]);
    const labels={equipment:'Kebutuhan peralatan / APD',material:'Kebutuhan material',inspection:'Catatan pemeriksaan',limits:'Batas pekerjaan',
      operationConditions:'Syarat operasi khusus',duration:'Lama kewenangan',realization:'Realisasi pekerjaan',quantity:'Volume',unit:'Satuan',
      measurements:'Hasil pengukuran',finalCondition:'Kondisi akhir',remarks:'Keterangan tambahan',Kewenangan:'Nomor kewenangan penerima'};
    for(const [key,label] of Object.entries(labels)){
      if(payload[key] && (key!=='equipment' && key!=='material' || record.type!=='EQUIPMENT_CHECKLIST'))lines.push([label,payload[key]]);
    }
    if(record.type==='DAILY_REPORT')lines.push(['Waktu input',timestamp(record.at)]);
    if(record.type==='survey'){
      if(payload.surveyDate)lines.push(['Tanggal survei',dateValue(payload.surveyDate)]);
      if(payload.access)lines.push(['Akses lokasi dan lingkungan',payload.access]);
      for(const row of payload.rows || [])lines.push([{'equipment':'Peralatan','apd':'APD','material':'Material'}[row.category],[row.name,row.quantity,row.unit].join(' ')]);

    }
    if(record.type==='JSA' || record.type==='IBPPR'){
      if(record.type==='JSA' && payload.jsaChecks?.length)lines.push(['APD dan perlengkapan darurat',payload.jsaChecks.join(', ')]);
      for(const [index,row] of (payload.rows || []).entries())lines.push(['Baris '+(index+1),Object.values(row).join(' / ')]);
      if(!payload.rows?.length && payload.responsible)lines.push(['Penanggung jawab',payload.responsible]);
    }
    if(related?.authorityReview){
      lines.push(['Verifikasi kewenangan',[related.actorNames?.[related.authorityReview.actorId],timestamp(related.authorityReview.at),dateValue(related.authorityReview.planDate)].filter(Boolean).join(' / ')]);
      for(const item of related.authorityReview.results || [])lines.push([item.name,item.reason]);
    }
    for(const receipt of related?.receipts || []){
      const moments=[['Diserahkan',receipt.handedAt,receipt.handedBy],['Diterima',receipt.receivedAt,receipt.receivedBy],['Dicatat',receipt.recordedAt,receipt.recordedBy]];
      for(const [label,at,id] of moments)if(at)lines.push([label+' '+item.name,[related.actorNames?.[id] || id,timestamp(at)].filter(Boolean).join(' / ')]);
    }
    if(related?.closure){
      const closure=related.closure;
      lines.push(['Penutupan izin',closure.payload?.Isi]);
      if(closure.recorded?.at)lines.push(['Penutupan dicatat',[closure.recorded.actorName,timestamp(closure.recorded.at)].filter(Boolean).join(' / ')]);
      for(const decision of closure.decisions || [])lines.push(['Pemeriksa penutupan',[decision.actorName,timestamp(decision.at),decision.note].filter(Boolean).join(' / ')]);
    }
    if(record.type==='EQUIPMENT_CHECKLIST'){
      for(const entry of record.items || []){
        lines.push([entry.category==='material'?'Material':'Peralatan',
          [entry.name,[entry.quantity,entry.unit].filter(Boolean).join(' '),entry.condition].filter(Boolean).join(' / ')]);
      }
      for(const check of related?.readiness || []){
        lines.push(['Pemeriksaan ulang',[check.actorName,dateValue(check.at),check.data.reason].filter(Boolean).join(' / ')]);
        for(const [index,result] of (check.data.itemChecks || []).entries()){
          lines.push([record.items[index]?.name || 'Item '+(index+1),[result.answer==='yes'?'Ada':'Tidak',result.note].filter(Boolean).join(' / ')]);
        }
      }
    }
    if(record.type==='AUTHORITY_ROSTER'){
      for(const entry of record.people || []){
        lines.push([entry.name,[entry.duty,entry.certificateNo,entry.requiredCompetence && 'Diperlukan: '+entry.requiredCompetence,entry.competence && 'Pada surat: '+entry.competence,entry.evidence && 'Bukti: '+entry.evidence,[entry.validFrom,entry.validUntil].filter(Boolean).join(' s.d. ')].filter(Boolean).join(' / ')]);
      }
    }
    if(record.type==='HEIGHT_PERMIT'){
      if(data.cpName)lines.push(['CP pada bukti pemeriksaan',[data.cpName,data.cpReviewedAt].filter(Boolean).join(' / ')]);
      if(payload.hazards)lines.push(['Bahaya yang dicatat',payload.hazards]);
      if(payload.precautions)lines.push(['Tindakan pencegahan yang dicatat',payload.precautions]);
    }
    for(const decision of record.decisions || []){
      const result=decision.result==='approved'?'Disetujui':decision.result==='rejected'?'Dikembalikan':decision.result;
      lines.push([result,[decision.actorName,timestamp(decision.at),decision.reason || decision.note].filter(Boolean).join(' / ')]);
    }
    if(!lines.length)return;
    const wrap=global.PDFLib.breakTextIntoLines;
    let page,y;
    function appendPage(){
      page=pdf.addPage([595.28,841.89]);
      page.drawText('Catatan versi dokumen WO',{x:44,y:788,size:15,font});
      drawField(page,font,[43,62,551,84],item.name+' / Versi '+item.version+' / '+data.number);
      y=730;
    }
    appendPage();
    for(const [label,value] of lines){
      if(y<88)appendPage();
      drawField(page,font,[43,page.getHeight()-y-10,551,page.getHeight()-y+3],label);
      y-=16;
      for(const line of wrap(String(value??'').replace(/[^\x20-\x7e\xa0-\xff]/g,' '),[' '],505,text=>font.widthOfTextAtSize(text,10))){
        if(y<50)appendPage();
        drawField(page,font,[43,page.getHeight()-y-10,551,page.getHeight()-y+3],line);
        y-=15;
      }
      y-=9;
    }
  }

  async function create(item, mode, wo, events, record, related) {
    const {PDFDocument, StandardFonts}=global.PDFLib;
    const key=sourceForms[item.name];
    const data=mode==='filled'?(record ? liveData(wo,record,events) : dataFor(wo,events,item.version)):{};
    if(mode==='filled' && item.name==='Tanda Terima SP2B'){
      const receipt=related?.receipts?.[0];
      for(const action of ['handed','received','recorded']){
        data[action+'At']=timestamp(receipt?.[action+'At']);
        const id=receipt?.[action+'By'];
        data[action+'By']=related?.actorNames?.[id] || id;
      }
    }
    if(mode==='filled' && record?.type==='EQUIPMENT_CHECKLIST')data.sp3bNumber=related?.sourceSp3b?.payload?.number;
    const pdf=key ? await PDFDocument.load(await read('assets/wo-preview/'+key+'.pdf','arrayBuffer')) : await PDFDocument.create();
    const font=await pdf.embedFont(StandardFonts.Helvetica);
    if(key==='izin-kerja-ketinggian'){
      if(mode==='filled')fillHeightPermit(pdf.getPage(0),font,data,events);
    } else if(key){
      const fields=await read('app/preview-wo-pdf-fields.json','json');
      const pages=pdf.getPages();
      const documentData=key==='ibppr' && mode==='filled' && !record?{
        ...data,
        asman:events.findLast(entry=>/^IBPPR disetujui/.test(entry.name))?.actor,
        k3:events.findLast(entry=>/^IBPPR diperiksa/.test(entry.name))?.actor,
      }:data;
      const rows=record?.payload?.rows || [];
      if(key==='ibppr' && mode==='filled' && rows.length>8){
        const source=await PDFDocument.load(await read('assets/wo-preview/ibppr.pdf','arrayBuffer'));
        for(let offset=8;offset<rows.length;offset+=8){
          const [page]=await pdf.copyPages(source,[0]);
          pdf.addPage(page);
          const sheet={...documentData};
          for(const field of Object.keys(sheet))if(/^risk\d/.test(field))delete sheet[field];
          rows.slice(offset,offset+8).forEach((row,i)=>{
            ['activity','hazards','impact','consequence','likelihood','riskAssessment','controls','residualConsequence','residualLikelihood','residualRisk','controlStatus','responsible'].forEach((name,j)=>{sheet['risk'+i+j]=row[name];});
          });
          for(const [,field,...rect] of fields[key])drawField(page,font,rect,sheet[field]);
        }
      }
      for(const [index,field,...rect] of fields[key])drawField(pages[index],font,rect,documentData[field]);
      if(mode==='filled' && record?.type==='EQUIPMENT_CHECKLIST'){
        const checks=new Map();
        for(const entry of related?.fixedChecks || [])for(const check of entry.checks)checks.set(check.row,check);
        for(const check of checks.values()){
          const {row,answer,note}=check;
          const x=answer==='yes'?397:453;
          drawField(pages[0],font,[x,row,x+14,row+10],'X');
          drawField(pages[0],font,[485,row,547,row+10],note);
        }
      }
      if(mode==='filled' && record?.type==='SP2B'){
        drawField(pages[0],font,[45,472,545,486],[data.leader,data.leaderCert].filter(Boolean).length?'Pengawas pekerjaan: '+[data.leader,data.leaderCert].filter(Boolean).join(' / '):'');
        drawField(pages[0],font,[45,488,545,502],[data.safety,data.safetyCert].filter(Boolean).length?'Pengawas K3: '+[data.safety,data.safetyCert].filter(Boolean).join(' / '):'');
      }
      if(mode==='filled' && record?.type==='SP3B')drawField(pages[0],font,[280,361,548,374],data.operationConditions);
      if(mode==='filled' && record?.type==='JSA'){
        const checks=record.payload?.jsaChecks || [];
        const boxes=[['Helm',206,505],['Sepatu keselamatan',206,523],['Kacamata',206,542],['Earplug',206,560],['Earmuff',206,578],['Sarung tangan katun',206,596],
          ['Sarung tangan karet',349,505],['Sarung tangan 20 kV',349,523],['Pelampung',349,542],['Tabung pernapasan',349,560],['Full body harness',349,578],
          ['APAR',206,628],['Rambu keselamatan',206,646],['LOTO',206,664],['Radio telekomunikasi',206,682]];
        for(const [name,x,y] of boxes)if(checks.includes(name))drawField(pages[0],font,[x,y,x+10,y+11],'X');
      }

    } else drawDemoForm(pdf,font,item.name,data);
    if(record && mode==='filled'){
      const page=pdf.getPage(0);
      if(item.name==='Tanda Terima SP2B'){
        const receipt=related?.receipts?.[0];
        if(receipt?.signature){
          const image=await pdf.embedPng(receipt.signature.image);
          const size=image.scaleToFit(112,52);
          drawField(page,font,[44,570,267,586],'Tanda tangan penerima');
          page.drawImage(image,{...size,x:44,y:page.getHeight()-594-size.height});
        }
      }
      if(record.type==='survey'){
        for(const file of related?.files || []){
          const image=file.mime==='image/png'?await pdf.embedPng(file.content):await pdf.embedJpg(file.content);
          const size=image.scaleToFit(238,110);
          page.drawImage(image,{...size,x:(file.slot==='GAMBAR-LOKASI'?39:286)+(238-size.width)/2,y:page.getHeight()-793+(110-size.height)/2});
        }
      }
      const decisions=item.name==='Tanda Terima SP2B' ? [] : [...(record.decisions || []),...(related?.closure?.decisions || []),...(related?.receipts || [])];
      for(const {signature} of decisions){
        if(!signature)continue;
        const image=await pdf.embedPng(signature.image);
        const target=pdf.getPage(signature.page===1 && record.type==='JSA'?1:0);
        const size=image.scaleToFit(target.getWidth()*.17,target.getHeight()*(signature.page===1?.05:.1));
        target.drawImage(image,{...size,x:target.getWidth()*signature.x,y:target.getHeight()*(1-signature.y)-size.height});
      }
      if(item.name!=='Tanda Terima SP2B')appendRecordDetails(pdf,font,item,record,data,related);
    }
    pdf.setTitle(item.name+(mode==='filled'?' / '+wo.id:' / Blangko'));
    return {
      blob:new Blob([await pdf.save()],{type:'application/pdf'}),
      filename:item.name.replace(/[^\w -]+/g,'')+(record?' - v'+item.version:'')+(mode==='filled'?' - '+wo.id:' - Blangko')+'.pdf',
      isDemoForm:!key,
    };
  }

  global.PreviewWoPdf={create,workOrder};
})(globalThis);
