import {mkdir,readFile,writeFile,cp,readdir,lstat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.join(root,'dist'),output=path.join(root,'site');
// Copia somente arquivos públicos; nunca a raiz, .local, cadastros ou segredos.
async function validate(dir){for(const item of await readdir(dir,{withFileTypes:true})){const full=path.join(dir,item.name);if((await lstat(full)).isSymbolicLink())throw Error('Link simbólico não permitido na publicação.');if(item.name.startsWith('.')||/^(?:node_modules|server\.mjs)$/i.test(item.name)||/\.(?:env|log|tmp)$/i.test(item.name))throw Error('Arquivo privado ou inesperado em dist: '+item.name);if(item.isDirectory())await validate(full);}}
await validate(source);await mkdir(output,{recursive:true});
// A área gerada deve estar vazia ou conter apenas arquivos públicos desta construção.
const allowed=new Set((await readdir(source)).concat(['.nojekyll','DIVINUM-OFFICIUM-LICENSE.txt']));
for(const item of await readdir(output))if(!allowed.has(item))throw Error('Arquivo inesperado em site/: use uma pasta de construção limpa.');
await cp(source,output,{recursive:true});
await writeFile(path.join(output,'deployment.js'),'export const STATIC_EDITION = true;\n');
let html=await readFile(path.join(output,'index.html'),'utf8');
html=html.replace('content="Um espaço de estudo, oração e investigação documental. Cathedra Integra com OpenRouter."','content="Cathedra Integra: estudo, orações e exame de consciência. Converse usando sua própria chave OpenRouter."')
 .replace('<title>Cathedra Integra — Estudo, fé e tradição</title>','<title>Cathedra Integra — OpenRouter, oração e estudo</title>')
 .replace('Conectar ChatGPT</span>','Configurar OpenRouter</span>')
 .replace('EDIÇÃO LOCAL <span>02 / CHATGPT</span>','EDIÇÃO ONLINE <span>GITHUB PAGES</span>')
 .replace('EDIÇÃO LOCAL · PARA ASSINANTES','EDIÇÃO ONLINE · OPENROUTER')
 .replace(/Executado neste computador · v[\d.]+/,'GitHub Pages · v2.4.0')
 .replace('Seu plano ChatGPT, no Cathedra.','Seu espaço de fé, com OpenRouter.')
 .replace('Entre pelo serviço oficial da OpenAI e autorize o uso do seu plano. A disponibilidade depende da conta, do workspace e dos limites do ChatGPT. O login do site hospedado é separado desta conexão.','Use sua própria chave OpenRouter para conversar. Orações, biblioteca e exame de consciência podem ser acessados sem uma chave. Para usar seu plano ChatGPT, baixe a edição local na página Releases deste projeto.')
 .replace('<option value="chatgpt">Plano ChatGPT — recomendado para assinantes</option>','')
 .replace('<div id="gpt-settings">','<div id="gpt-settings" hidden>')
 .replace(/Edição local [\d.]+ baseada no Cathedra Integra 1\.4\.0\./,'Edição online 2.4.0 baseada no Cathedra Integra 1.4.0.')
 .replace('Escolha uma oração ou uma hora canônica no menu ao lado.','Escolha uma oração para ler aqui. Os ofícios abrem na fonte original.')
 .replace('Ofício romano tradicional do dia, com as rubricas escolhidas. Os textos completos são consultados online.','Escolha a data e as rubricas. Cada hora abre em uma nova aba na fonte original, em português e latim. Nesta edição online, os ofícios não são carregados no leitor nem na leitura por voz do app.');
await writeFile(path.join(output,'index.html'),html);await writeFile(path.join(output,'.nojekyll'),'');
await cp(path.join(root,'DIVINUM-OFFICIUM-LICENSE.txt'),path.join(output,'DIVINUM-OFFICIUM-LICENSE.txt'));
console.log('Versão para GitHub Pages preparada em site/. Nenhum servidor, cadastro ou chave pessoal foi incluído.');
