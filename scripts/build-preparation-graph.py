"""Extract the BPMN nodes and edges used by the preparation workflow."""
import hashlib
import json
from pathlib import Path
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
source = root.parent / 'pdkb-vue/sources/Draft BPMN PDKB FINAL.bpmn'
raw = source.read_bytes()
digest = hashlib.sha256(raw).hexdigest()
assert digest == '6aa0861fac3f0467905b234ce25f8e33f8cebd2519029fc9de3a66c931b64cfb'
process = ET.fromstring(raw).find('{http://www.omg.org/spec/BPMN/20100524/MODEL}process')
ns = {'b': 'http://www.omg.org/spec/BPMN/20100524/MODEL'}
role_keys = ['komisi_pusat', 'komisi_unit', 'petugas_gi', 'piket_apd', 'piket_area', 'pelaksana_pdkb', 'kepala_regu', 'pengawas_k3', 'manajer_area', 'bagian_terkait', 'p2k3_k3l', 'preparator_pdkb', 'supervisor_pdkb', 'asman_jaringan', 'tl_konstruksi', 'tl_har', 'tl_op']
lanes = process.findall('b:laneSet/b:lane', ns)
assert len(lanes) == len(role_keys)
roles = {ref.text: role for lane, role in zip(lanes, role_keys) for ref in lane.findall('b:flowNodeRef', ns)}
nodes = {node.get('id'): {'title': node.get('name'), 'type': node.tag.split('}')[-1], 'role': roles.get(node.get('id'))} for node in process if node.get('id') in roles}
edges = [{'id': node.get('id'), 'source': node.get('sourceRef'), 'target': node.get('targetRef'), 'label': node.get('name')} for node in process.findall('b:sequenceFlow', ns)]
graph = {'hash': digest, 'nodes': nodes, 'edges': edges}
payload = json.dumps(graph, ensure_ascii=False, indent=2)
(root / 'app/preparation-graph.js').write_text('(function (global) {\n  const graph = ' + payload + ';\n  if (typeof module !== "undefined" && module.exports) module.exports = graph;\n  else global.IwomsPreparationGraph = graph;\n})(typeof window !== "undefined" ? window : globalThis);\n', encoding='utf-8')
print(f'Verified graph {len(nodes)} nodes, {len(edges)} edges, SHA-256 {digest}')
