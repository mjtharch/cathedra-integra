import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildExaminationText,selectedItems} from '../dist/examination-core.js';
const data=JSON.parse(await readFile(new URL('../dist/examination.json',import.meta.url),'utf8'));
test('roteiro cobre os dez mandamentos e todos os temas pedidos com fontes',()=>{
 assert.equal(data.groups.filter(g=>g.id.startsWith('mandamento-')).length,10);
 for(const id of ['igreja','capitais','estado','misericordia','espirito','clamam'])assert.ok(data.groups.find(g=>g.id===id));
 assert.equal(data.groups.find(g=>g.id==='capitais').items.length,7);
 const ids=data.groups.flatMap(g=>g.items.map(i=>i.id));assert.equal(new Set(ids).size,ids.length);
 for(const g of data.groups){assert.ok(data.sources.find(s=>s.id===g.source));for(const i of g.items)assert.ok(i.text.length>30);}
 for(const p of data.prayers){assert.ok(p.pt&&p.la&&data.sources.find(s=>s.id===p.source));}
 assert.match(JSON.stringify(data.instructions),/consentimento deliberado/);
});
test('exportação pessoal inclui somente marcações ativas e notas escolhidas',()=>{
 const first=data.groups[0].items[0],second=data.groups[0].items[1];
 const state={answers:{[first.id]:{selected:true,note:'<script>nota literal</script>',frequency:'cerca de 2 vezes'},[second.id]:{selected:false,note:'NÃO EXPORTAR'}},purpose:'Reparar o dano'};
 const text=buildExaminationText(data,state);
 assert.match(text,/cerca de 2 vezes/);assert.ok(text.includes(first.text));assert.ok(!text.includes(second.text));assert.ok(!text.includes('NÃO EXPORTAR'));assert.match(text,/Reparar o dano/);assert.equal(selectedItems(data,state.answers).length,1);
});
test('roteiro completo exporta orações e perguntas, sem recuperar notas desmarcadas',()=>{
 const id=data.groups[0].items[0].id;const text=buildExaminationText(data,{answers:{[id]:{selected:false,note:'SEGREDO DESMARCADO'}}},true);
 for(const g of data.groups)for(const i of g.items)assert.ok(text.includes(i.text));
 for(const p of data.prayers)assert.ok(text.includes(p.la));assert.ok(!text.includes('SEGREDO DESMARCADO'));assert.match(text,/FONTES E EDIÇÃO/);
});
test('exame não possui envio de respostas nem armazenamento persistente e impressão escapa texto',async()=>{
 const js=await readFile(new URL('../dist/examination.js',import.meta.url),'utf8');
 assert.doesNotMatch(js,/localStorage|sessionStorage|indexedDB|sendBeacon|requestCompletion|localApi/);
 assert.equal((js.match(/fetch\(/g)||[]).length,1);assert.match(js,/fetch\('\.\/examination.json'\)/);
 assert.match(js,/esc\(exportText\(\)\)/);assert.match(js,/beforeunload/);
});
