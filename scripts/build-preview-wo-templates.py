from pathlib import Path
import json
import pymupdf as pdf

assets = Path('assets')
output = assets / 'wo-preview'
output.mkdir(exist_ok=True)
# Field rectangles use the source PDF's top-left coordinate system.
templates = {
 'survey': ('DOC-02_SOP_01_Survey_Lokasi.pdf', [
  (0,'surveyNumber',368,113,550,138),(0,'surveyDate',368,140,550,154),
  *[(0,k,137,y,550,y+12) for k,y in zip(['job','number','location','unit','serviceUnit','pole','feeder','substation'],[205,219,232,246,260,273,287,301])],
  *[(0,k,225,y,549,y+12) for k,y in zip(['soil','access','crewSize','duration','difficulty','nearBuilding','trees','poleType','conductor','method','findings'],range(346,489,13))],
  (0,'preparator',90,524,265,536),(0,'surveyDate',136,538,265,550),(0,'planDate',136,552,265,564),
  (0,'asmanDate',223,600,294,615),(0,'supervisorDate',223,626,294,639),
 ]),
 'sp2b': ('DOC-04_SOP_04_1_SP2B.pdf', [
  (0,'sp2bNumber',211,191,548,204),(0,'sp2bDate',211,205,548,218),
  (0,'sp2bInstruction',44,247,546,273),
  *[(0,k,157,y,548,y+13) for k,y in zip(['pole','feeder','substation','job','method','location'],[310,330,351,392,412,449])],
  (0,'sp2bPlaceDate',386,586,550,599),(0,'manager',402,676,548,689),
 ]),
 'sp3b': ('DOC-06_SOP_05_SP3B.pdf', [
  (0,'sp3bNumber',211,160,548,174),(0,'sp3bDate',211,174,548,187),(0,'sp3bInstruction',44,212,549,227),
  *[(0,k,369,y,548,y+13) for k,y in zip(['leader','leaderCert','safety','safetyCert','job','method','communication','operationNotes','duration'],[231,244,257,270,309,335,374,387,400])],
  (0,'sp3bPlaceDate',381,443,550,456),(0,'manager',86,520,220,534),
  (0,'supervisor',385,520,550,534),(0,'leader',399,637,550,651),(0,'safety',390,760,550,774),
 ]),
 'jsa': ('DOC-08_JSA_K3_PDKB.pdf', [
  *[(0,k,263,y,545,y+12) for k,y in zip(['jsaDate','job','location','unit','leader'],[166,184,202,221,239])],
  *[(0,'crew'+str(i+1),283,y,437,y+12) for i,y in enumerate([282,302,323,343,364,384,405])],
  *[(1,'jsa'+str(i)+key,x,y,x1,y1) for i,(y,y1) in enumerate(zip([76,105,124,143,162,181,200,219,238,257],[103,122,141,160,179,198,217,236,255,275])) for key,x,x1 in [('Step',63,208),('Hazard',212,364),('Control',368,548)]],
  *[(1,k,x,764,x1,776) for k,x,x1 in [('asman',60,146),('supervisor',163,265),('k3',312,409),('preparator',462,547)]],
 ]),
 'ibppr': ('preview-ibppr.pdf', [
  (0,'unit',143,71,560,79),(0,'job',142,88,560,99),(0,'ibpprNumber',663,103,720,111),(0,'ibpprDate',663,110,720,118),
  *[(0,'risk'+str(i)+str(j),x+1,y+1,x1-1,y1-1) for i,(y,y1) in enumerate(zip([154.9,176.5,198.5,222,245.5,266.5,289,326.5],[176,198,221.5,245,266,288.5,326,354])) for j,(x,x1) in enumerate(zip([75.5,142,204,266,301,345,389,485,522,566,610,660],[141.5,203.5,265.5,300.5,344.5,388.5,484.5,521.5,565.5,609.5,659.5,720]))],
  *[(0,k,x,467,x1,477) for k,x,x1 in [('asman',133,185),('supervisor',282,346),('k3',454,510),('preparator',615,676)]],
 ]),
 'checklist': ('preview-checklist-peralatan-material.pdf', [
  *[(0,k,x,y,x1,y+11) for k,x,y,x1 in [('sp3bNumber',141,101,381),('planDate',445,101,555),('job',141,121,381),('location',445,121,555),('feeder',141,144,380),('substation',445,145,555),('method',141,162,550),('leader',141,198,263),('leaderCert',276,198,553),('safety',141,214,263),('safetyCert',276,214,553),('supervisor',126,729,250),('safety',413,729,551)]],
  *[(0,'check'+str(i),392,y-1,420,y+10) for i,y in enumerate([265,278,291,305,318,331,344,357,371,384,397,410,424,437,450,463,490,503,516,529,542,556,569,595,608,622,635,648])],
  *[(1,'material'+str(i),x,y,x+92,y+11) for i,(x,y) in enumerate([(240,387),(240,399),(240,412),(344,387),(344,399),(344,412)])],
 ]),
}
remove_images = {'survey':[(268,523,303,564),(316,594,335,620),(322,620,328,646),(38,681,280,794),(285,681,555,794)],'sp2b':[(411,624,482,676)],'sp3b':[(106,481,159,520),(419,468,466,520),(378,586,506,636),(395,708,489,760)],'jsa':[(458,274,510,294),(466,294,502,314),(471,314,496,335),(472,335,496,355),(466,355,502,375),(475,376,493,396)]}

for key,(name,fields) in templates.items():
    doc=pdf.open(assets/name)
    for i,page in enumerate(doc):
        for pg,field,x0,y0,x1,y1 in fields:
            if pg==i and not (key=='checklist' and pg==1):
                page.add_redact_annot(pdf.Rect(x0,y0,x1,y1),fill=False)
        for word in page.get_text('words'):
            x0,y0,x1,y1,value,*_=word
            if value=='#UNKNOWN!' or key=='survey' and value=='0' and y0>670:
                page.add_redact_annot(pdf.Rect(x0,y0,x1,y1),fill=False)
            if key=='jsa' and i==0 and 500<=y0<=712 and value.startswith('['):
                page.add_redact_annot(pdf.Rect(x0,y0,x1,y1),fill=False)
        if key=='checklist' and i==0:
            page.add_redact_annot(pdf.Rect(395,668,552,682),fill=False)
        page.apply_redactions(images=0,graphics=0)
        marks=remove_images.get(key,[]) if i==0 else ([(59,710,130,762),(185,710,232,762),(305,710,398,762),(444,716,548,756)] if key=='jsa' else [])
        for rect in marks:
            page.add_redact_annot(pdf.Rect(rect),fill=None)
        if marks: page.apply_redactions(images=1,graphics=0,text=1)
    doc.save(output/(key+'.pdf'),garbage=4,deflate=True)
    doc.close()

Path('app/preview-wo-pdf-fields.json').write_text(json.dumps({key:fields for key,(_,fields) in templates.items()},separators=(',',':')),encoding='utf-8')
