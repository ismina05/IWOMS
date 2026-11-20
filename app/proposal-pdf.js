(function (global) {
  'use strict';
  const {ref,watch,onUnmounted}=Vue;
  const dateLabel = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value.split('-').reverse().join('-') : value;
  const pair = (...values) => values.filter(value=>value != null && value !== '').join(' | ');
  const clean = value => String(value ?? '').normalize('NFC').replace(/[^\x20-\x7e\xa0-\xff]/g,' ').trim();
  let source;
  function getSource(){
    if(!source)source=fetch('assets/wo-preview/pengajuan-wo.pdf').then(response=>{
      if(!response.ok)throw Error('Template PDF pengajuan tidak tersedia.');
      return response.arrayBuffer();
    }).catch(error=>{source=null;throw error;});
    return source;
  }

  async function create(form, order, applicant){
    const {PDFDocument,StandardFonts,breakTextIntoLines}=global.PDFLib;
    const pdf=await PDFDocument.load(await getSource());
    const page=pdf.getPage(0);
    const font=await pdf.embedFont(StandardFonts.Helvetica);
    const number=form.officialWoNumber || order.id;
    const date=dateLabel(order.tanggal_pengajuan);
    const job=[form.catalogCode,form.nama_pekerjaan || form.nama_wo].filter(Boolean).join(' ');
    const rows=[
      [384,85,174,number],[430,97,115,date && '('+date+')'],
      ...[
        number,form.workUnit,job,form.lokasi,form.poleNumber,pair(form.substation,form.feeder),
        pair(form.poleType,form.poleHeight && form.poleHeight+' Meter'),
        pair(form.conductorType,form.conductorArea && form.conductorArea+' mm2'),applicant,
      ].map((value,index)=>[201,[165,182,199,227,244,261,278,295,311][index],356,value]),
    ];
    for(const [x,top,width,value] of rows){
      const text=clean(value);
      if(!text)continue;
      const size=Math.min(9,width/font.widthOfTextAtSize(text,1));
      page.drawText(text,{x,y:page.getHeight()-top-size,size,font});
    }

    const detail=[
      ['Nama WO aktual',form.nama_wo],['Proses bisnis',form.proses_bisnis],
      ['Kategori kebutuhan',form.kategori],['Preferensi tanggal pelaksanaan',dateLabel(form.preferensi_tanggal)],
      ['Uraian kebutuhan lapangan',form.uraian],
    ].filter(([,value])=>value);
    if(detail.length){
      let additional;
      let y;
      const addPage=()=>{
        additional=pdf.addPage([page.getWidth(),page.getHeight()]);
        y=additional.getHeight()-54;
        additional.drawText('Informasi tambahan pengajuan WO',{x:36,y,size:15,font});
        y-=26;
        additional.drawText(clean(number),{x:36,y,size:10,font});
        y-=28;
      };
      addPage();
      for(const [label,value] of detail){
        if(y<82)addPage();
        additional.drawText(label,{x:36,y,size:10,font});
        y-=17;
        for(const paragraph of String(value).split(/\r?\n/)){
          const text=clean(paragraph);
          const lines=breakTextIntoLines(text,[' '],520,line=>font.widthOfTextAtSize(line,10));
          for(const line of lines){
            if(y<54)addPage();
            const size=Math.min(10,520/font.widthOfTextAtSize(line,1));
            additional.drawText(line,{x:36,y,size,font});
            y-=15;
          }
        }
        y-=13;
      }
    }
    pdf.setTitle('Pengajuan WO '+number);
    return new Blob([await pdf.save()],{type:'application/pdf'});
  }

  global.IwomsProposalPdf={
    props:['form','order','applicant'],
    setup(props){
      const url=ref('');
      const pending=ref(true);
      const error=ref('');
      let timer;
      let generation=0;
      function refresh(){
        clearTimeout(timer);
        const request=++generation;
        const {form,order,applicant}=props;
        if(!order)return;
        const formSnapshot={...form};
        const orderSnapshot={id:order.id,tanggal_pengajuan:order.tanggal_pengajuan};
        error.value='';
        pending.value=true;
        timer=setTimeout(async()=>{
          try{
            const blob=await create(formSnapshot,orderSnapshot,applicant);
            if(request!==generation)return;
            const previous=url.value;
            url.value=URL.createObjectURL(blob);
            if(previous)URL.revokeObjectURL(previous);
          }catch(cause){
            if(request===generation)error.value=cause.message || 'Pratinjau PDF gagal dimuat.';
          }finally{
            if(request===generation)pending.value=false;
          }
        },250);
      }
      watch(()=>[props.form,props.order?.id,props.order?.tanggal_pengajuan,props.applicant],refresh,{deep:true,immediate:true});
      onUnmounted(()=>{
        generation++;
        clearTimeout(timer);
        if(url.value)URL.revokeObjectURL(url.value);
      });
      return {url,pending,error,refresh};
    },
    template: `
      <div :aria-busy="pending">
        <p v-if="pending" class="mb-2 text-xs text-slate-600" role="status">Memperbarui PDF...</p>
        <div v-if="error" class="mb-2 text-xs text-red-700" role="alert">{{ error }} <button type="button" class="underline" @click="refresh">Coba lagi</button></div>
        <a v-if="url && !pending && !error" :href="url" target="_blank" rel="noopener" class="mb-2 inline-block text-xs font-semibold text-pln-blue underline">Buka PDF di tab baru</a>
        <iframe v-if="url && !error" :src="url" title="PDF Pengajuan Work Order PDKB" class="block h-[60vh] min-h-80 w-full rounded-md border border-slate-200 bg-white"></iframe>
      </div>`,
  };
})(globalThis);
