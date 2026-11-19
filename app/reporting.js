(function(global){
  'use strict';
  const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'});
  function day(at){
    if(!at||!Number.isFinite(Date.parse(at)))return '';
    return date.format(new Date(at));
  }
  function rows(orders,tasks,{period='',search='',status='',category='all'}={}){
    const assigned=new Set(tasks.filter(task=>task.actionable).map(task=>task.woId));
    const needle=search.trim().toLowerCase();
    return orders.filter(wo=>{
      if(status&&wo.status!==status)return false;
      if(needle&&![wo.id,wo.nama_wo,wo.lokasi].some(value=>String(value||'').toLowerCase().includes(needle)))return false;
      if(category==='tasks'&&!assigned.has(wo.id))return false;
      if(category==='hold'&&!['On Hold','Hold Review','Work Stopped'].includes(wo.status))return false;
      if(category==='operational'&&!day(wo.operational_completed_at))return false;
      const event=category==='operational'?wo.operational_completed_at:wo.createdAt;
      return !period||day(event).startsWith(period);
    });
  }
  function csv(report,version){
    if(!version||!Array.isArray(version.snapshot))throw new Error('Pilih versi rekap yang sudah memiliki snapshot.');
    const quote=value=>{
      let cell=String(value??'');
      if(/^[\s]*[=+\-@]|^[\t\r\n]/.test(cell))cell="'"+cell;
      return '"'+cell.replaceAll('"','""')+'"';
    };
    const entries=[['Periode WIB','Unit','Versi','ID WO','Nama WO','Versi WO','Tanggal selesai WIB','Waktu selesai UTC']];
    for(const wo of version.snapshot)entries.push([report.period,report.unitId,version.number,wo.woId,wo.name,wo.woVersion,day(wo.operationalCompletedAt),wo.operationalCompletedAt]);
    return '\uFEFF'+entries.map(entry=>entry.map(quote).join(',')).join('\r\n')+'\r\n';
  }
  function download(report,version){
    const url=URL.createObjectURL(new Blob([csv(report,version)],{type:'text/csv;charset=utf-8'}));
    try{
      const anchor=document.createElement('a');
      anchor.href=url;anchor.download='rekap-pdkb-'+report.period+'-v'+version.number+'.csv';
      document.body.appendChild(anchor);
      try{anchor.click();}finally{anchor.remove();}
    }finally{setTimeout(()=>URL.revokeObjectURL(url),30000);}
  }
  const api={rows,csv,download,day};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else global.IwomsReporting=api;
})(typeof window!=='undefined'?window:globalThis);
