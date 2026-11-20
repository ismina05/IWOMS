(function (global) {
  'use strict';
  const {computed,ref,watch,nextTick,onUnmounted}=Vue;
  const catalog=[
    ['survey','Form Survei'],
    ['JSA','JSA'],
    ['IBPPR','IBPPR'],
    ['HEIGHT_PERMIT','Izin Kerja Ketinggian','Jika pekerjaan memerlukan izin ketinggian'],
    ['AUTHORITY_ROSTER','Surat Kewenangan personel'],
    ['SP2B','SP2B'],
    ['SP3B','SP3B'],
    ['EQUIPMENT_CHECKLIST','Checklist peralatan dan material'],
    ['DELEGATION','Berita Acara Delegasi','Jika pengawasan didelegasikan'],
    ['WORK_RESULT','Laporan Hasil Pekerjaan'],
    ['COMPLETION_NOTICE','Pemberitahuan Penyelesaian'],
    ['DAILY_REPORT','Laporan Kinerja Harian'],
  ];

  global.IwomsDetailRecords={
    props:['w'],
    setup(props){
      const mode=ref('filled');
      const selectedId=ref('');
      const url=ref('');
      const filename=ref('');
      const note=ref('');
      const error=ref('');
      const pending=ref(false);
      let request=0;
      const rows=computed(()=>{
        const w=props.w;
        const records=[...w.detailDocuments];
        const delegation=w.detail?.delegation?.document;
        if(delegation && !records.some(doc=>doc.id===delegation.id))records.push(delegation);
        return catalog.flatMap(([type,name,condition])=>{
          const versions=records.filter(doc=>doc.type===type);
          return versions.length
            ? versions.map(doc=>({id:doc.id,name,condition,version:doc.version,doc}))
            : condition ? [{id:type,name,condition}] : [];
        });
      });
      const available=computed(()=>rows.value.filter(item=>item.doc));
      const index=computed(()=>available.value.findIndex(item=>item.id===selectedId.value));
      const selected=computed(()=>available.value[index.value]);
      const receiptAvailable=computed(()=>selected.value?.doc.type==='SP2B' && Object.values(props.w.detail.deliveries || {}).some(item=>item.documentVersionId===selected.value.id && item.receivedAt));
      const attachments=computed(()=>{
        const w=props.w;
        const record=selected.value?.doc;
        if(!record)return [];
        const closure=w.detailDocuments.findLast(doc=>doc.type==='HEIGHT_CLOSURE' && doc.sourcePermitId===record.id);
        const ids=new Set([...(record.fileIds || []),...(closure?.fileIds || [])]);
        return w.detailSupportingFiles.filter(file=>ids.has(file.id));
      });
      const archive=computed(()=>props.w.detailDocuments.findLast(doc=>doc.type==='WO_ARCHIVE'));
      const archivedDocuments=computed(()=>available.value.filter(item=>archive.value?.documentIds?.includes(item.id)));
      const archivedFiles=computed(()=>{
        const ids=new Set(archive.value?.documentIds || []);
        for(const record of props.w.detailDocuments){
          if(ids.has(record.id))for(const fileId of record.fileIds || [])ids.add(fileId);
        }
        return props.w.detailSupportingFiles.filter(file=>ids.has(file.id));
      });
      const eventCount=computed(()=>props.w.historyGroups.reduce((count,group)=>count+group.events.length,0));
      const formatName=item=>item.name+' v'+item.version;
      const generated=new Map();
      function relatedRecords(item){
        const w=props.w;
        const wo=w.detail;
        return {
          closure:w.detailDocuments.findLast(doc=>doc.type==='HEIGHT_CLOSURE' && doc.sourcePermitId===item.id),
          receipts:Object.values(wo.deliveries || {}).filter(delivery=>delivery.documentVersionId===item.doc.id),
          authorityReview:item.doc.type==='AUTHORITY_ROSTER' ? wo.authorityReviews?.findLast(review=>review.rosterVersion===item.version) : null,
          readiness:item.doc.type==='EQUIPMENT_CHECKLIST' ? wo.readiness?.filter(check=>check.data.documentVersionId===item.id && check.nodeId==='Node_periksa_kesiapan_lapangan') : [],
          files:w.detailSupportingFiles.filter(file=>item.doc.fileIds?.includes(file.id)),
          fixedChecks:wo.fixedChecklistChecks?.filter(entry=>entry.documentVersionId===item.doc.id),
          sourceSp3b:item.doc.type==='EQUIPMENT_CHECKLIST' ? w.detailDocuments.find(doc=>doc.id===item.doc.sourceSp3bId)
            || w.detailDocuments.findLast(doc=>doc.type==='SP3B' && doc.issuedAt && doc.issuedAt<=item.doc.submittedAt) : null,
          actorNames:Object.fromEntries(w.detailEvents.map(event=>[event.actor.id,event.actor.name])),
        };
      }

      function releaseUrl(){
        if(url.value)URL.revokeObjectURL(url.value);
        url.value='';
        filename.value='';
      }
      function getPdf(item){
        const currentMode=mode.value;
        const key=currentMode+':'+item.id;
        if(!generated.has(key)){
          const pdf=PreviewWoPdf.create(item,currentMode,props.w.detail,props.w.detailEvents,item.doc,relatedRecords(item));
          generated.set(key,pdf);
          pdf.catch(()=>{if(generated.get(key)===pdf)generated.delete(key);});
        }
        return generated.get(key);
      }
      function close(){
        request++;
        selectedId.value='';
        pending.value=false;
        note.value='';
        releaseUrl();
      }
      function recordedNote(item){
        if(item.doc.type!=='HEIGHT_PERMIT')return '';
        const closure=props.w.detailDocuments.findLast(doc=>doc.type==='HEIGHT_CLOSURE' && doc.sourcePermitId===item.id && doc.status==='recorded');
        return closure?.recorded?.at?' Penyelesaian izin dicatat '+props.w.formatTime(closure.recorded.at)+'.':'';
      }
      async function open(item,focusHeading=false){
        if(!item?.doc)return;
        const current=++request;
        selectedId.value=item.id;
        pending.value=true;
        releaseUrl();
        note.value='Menyiapkan PDF...';
        if(focusHeading)nextTick(()=>document.querySelector('.wo-preview-records .document-viewer h3')?.focus());
        try{
          const result=await getPdf(item);
          if(current!==request)return;
          url.value=URL.createObjectURL(result.blob);
          filename.value=result.filename;
          note.value=(result.isDemoForm?'Formulir demo BPMN. Template sumber belum tersedia.':'Pratinjau berdasarkan formulir sumber.')+(mode.value==='filled'?recordedNote(item):'');
        }catch(cause){
          if(current===request)note.value=cause.message || 'Pratinjau tidak dapat dimuat.';
        }finally{
          if(current===request)pending.value=false;
        }
      }
      async function download(item){
        if(!item?.doc)return;
        error.value='';
        try{
          const result=await getPdf(item);
          const href=URL.createObjectURL(result.blob);
          const anchor=document.createElement('a');
          anchor.href=href;
          anchor.download=result.filename;
          document.body.append(anchor);
          anchor.click();
          anchor.remove();
          setTimeout(()=>URL.revokeObjectURL(href),30000);
        }catch(cause){error.value=cause.message || 'Unduhan tidak dapat dibuat.';}
      }
      watch(mode,()=>{if(selected.value)open(selected.value);});
      watch(()=>[props.w.detail?.version,props.w.detail?.id],()=>{
        generated.clear();
        if(selected.value)open(selected.value);
        else close();
      });
      onUnmounted(close);
      function downloadReceipt(){
        if(receiptAvailable.value)download({...selected.value,name:'Tanda Terima SP2B',id:selected.value.id+':receipt'});
      }
      return {rows,available,index,selected,mode,url,filename,note,error,pending,eventCount,open,close,download,formatName,attachments,archive,archivedDocuments,archivedFiles,receiptAvailable,downloadReceipt};
    },
    template:`
      <section class="wo-preview-records box" aria-label="Dokumen dan riwayat">
        <nav class="tabs" aria-label="Bagian detail WO">
          <button type="button" :aria-pressed="w.detailPanel==='dokumen'" aria-controls="detail-record-documents" @click="w.detailPanel='dokumen'">Dokumen <span class="badge">{{ available.length }}</span></button>
          <button type="button" :aria-pressed="w.detailPanel==='riwayat'" aria-controls="detail-record-history" @click="w.detailPanel='riwayat'">Riwayat</button>
        </nav>
        <div v-show="w.detailPanel==='dokumen'" id="detail-record-documents">
          <p class="muted" role="status">{{ error }}</p>
          <p v-if="!available.length" class="muted">Belum ada dokumen pada tahap yang ditampilkan.</p>
          <div v-if="rows.length" class="doc-head"><span>Dokumen</span><span>Versi</span></div>
          <div v-for="item in rows" :key="item.id" class="doc">
            <div><strong>{{ item.name }}</strong>
              <div v-if="item.condition" class="doc-condition"><span class="badge">Bersyarat</span><p class="muted">{{ item.condition }}</p></div>
            </div>
            <span v-if="item.doc">Versi {{ item.version }}</span>
            <span v-else class="muted">Belum tersedia</span>
            <div v-if="item.doc" class="actions">
              <button type="button" class="button" aria-controls="detail-record-viewer" :aria-expanded="selected?.id===item.id" @click="selected?.id===item.id ? close() : open(item,true)">{{ selected?.id===item.id ? 'Tutup pratinjau' : 'Lihat pratinjau' }}</button>
              <button type="button" class="button" :aria-label="'Unduh '+item.name+' (PDF)'" @click="download(item)">Unduh</button>
            </div>
          </div>
          <div class="actions doc-modes" aria-label="Mode dokumen">
            <label for="detail-record-mode">Mode dokumen</label>
            <select id="detail-record-mode" v-model="mode">
              <option value="filled">Terisi data WO</option><option value="blank">Blangko kosong</option>
            </select>
            <span class="muted">Mode ini berlaku untuk pratinjau dan unduhan.</span>
          </div>
          <section v-show="selected" id="detail-record-viewer" class="document-viewer" aria-label="Pratinjau dokumen" :aria-busy="pending">
            <nav class="actions" aria-label="Pilih dokumen">
              <button v-for="item in available" :key="item.id" type="button" class="button" :aria-pressed="item.id===selected?.id" @click="open(item)">{{ formatName(item) }}</button>
            </nav>
            <div class="viewer-controls">
              <button type="button" class="button" aria-label="Dokumen sebelumnya" :disabled="index<=0" @click="open(available[index-1])">&lt;</button>
              <span>{{ index+1 }} / {{ available.length }}</span>
              <button type="button" class="button" aria-label="Dokumen berikutnya" :disabled="index>=available.length-1" @click="open(available[index+1])">&gt;</button>
            </div>
            <h3 tabindex="-1">{{ selected?.name }}</h3>
            <p class="muted" role="status">{{ note }}</p>
            <button type="button" class="button" :disabled="!filename" @click="download(selected)">Unduh PDF</button>
            <button v-if="receiptAvailable" type="button" class="button" @click="downloadReceipt">Unduh Tanda Terima SP2B</button>
            <iframe v-if="url" :src="url" :title="'Pratinjau '+selected?.name"></iframe>
            <ul v-if="selected?.doc.people?.some(person=>person.certificateFile)" class="mt-3 space-y-1 text-sm">
              <li v-for="person in selected.doc.people.filter(person=>person.certificateFile)" :key="person.personId">
                <a class="underline" :href="person.certificateFile.content" :download="person.certificateFile.name">Unduh surat asli {{ person.name }}</a>
              </li>
            </ul>
            <ul v-if="attachments.length" class="mt-3 space-y-1 text-sm">
              <li v-for="file in attachments" :key="file.id"><a class="underline" :href="file.content" :download="file.name">{{ file.name }}</a><p v-if="file.caption" class="muted">{{ file.caption }}</p></li>
            </ul>
          </section>
          <details v-if="archive" class="mt-3">
            <summary>Paket arsip WO</summary>
            <p class="muted">Diarsipkan {{ w.formatTime(archive.at) }}. {{ archive.documentIds.length }} rekaman pada paket ini.</p>
            <ul class="mt-2 space-y-1 text-sm">
              <li v-for="item in archivedDocuments" :key="item.id"><button type="button" class="text-pln-blue underline" @click="open(item,true)">{{ formatName(item) }}</button></li>
            </ul>
            <ul class="mt-2 space-y-1 text-sm">
              <li v-for="file in archivedFiles" :key="file.id"><a class="underline" :href="file.content" :download="file.name">{{ file.name }}</a></li>
            </ul>
          </details>
        </div>
        <div v-show="w.detailPanel==='riwayat'" id="detail-record-history">
          <p class="muted" aria-live="polite">{{ w.historyGroups.length }} kelompok tahap, {{ eventCount }} kejadian pada WO ini.</p>
          <div class="group-list">
            <details v-for="group in w.historyGroups" :key="group.title" class="box" :open="group.focus">
              <summary><span>{{ group.title }}</span><span class="badge" :class="{ok:group.status==='Selesai'}">{{ group.status }}</span></summary>
              <p v-if="!group.events.length" class="muted">Belum ada kejadian tercatat.</p>
              <ol v-else class="timeline iwoms-stepper">
                <li v-for="event in group.events" :key="event.id">
                  <div class="event-line wo-modal-event"><strong>{{ w.historyTitle(event) }}</strong><time :datetime="event.at">{{ w.formatTime(event.at) }}</time></div>
                  <p class="muted">{{ event.actor.name }} &middot; {{ w.roleTitle(event.actor.role) }}</p>
                  <p v-if="event.data?.reason || event.data?.workPlan" class="event-note">{{ event.data.reason || event.data.workPlan }}</p>
                </li>
              </ol>
            </details>
          </div>
        </div>
      </section>`,
  };
})(globalThis);
