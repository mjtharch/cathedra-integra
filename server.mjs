import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createAuth,same} from './local/auth.mjs';
import {loadOffice} from './local/offices.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.pdf':'application/pdf'};
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));}
async function body(req){if(!String(req.headers['content-type']).startsWith('application/json'))throw Error('Envie dados em formato JSON.');let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>750000)throw Error('Mensagem muito grande. Reduza o contexto.');chunks.push(chunk);}return JSON.parse(Buffer.concat(chunks).toString('utf8'));}
export async function startServer({port=4173,directory=path.join(here,'.local'),fetcher=fetch}={}){
 const server=http.createServer();await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});const actualPort=server.address().port,origin='http://127.0.0.1:'+actualPort;
 let auth;try{auth=await createAuth({directory,origin,fetcher});}catch(e){await new Promise(resolve=>server.close(resolve));throw e;}let activeRequests=new Set();
 server.on('request',async(req,res)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');
 try{
  if(req.headers.host!=='127.0.0.1:'+actualPort){res.writeHead(403);res.end('Abra o app pelo endereço 127.0.0.1 exibido na janela.');return;}
  const u=new URL(req.url,origin),isApi=u.pathname.startsWith('/api/'),isCallback=u.pathname==='/auth/callback';
  if(isApi){if((req.headers.origin&&req.headers.origin!==origin)||req.headers['sec-fetch-site']==='cross-site'){json(res,403,{error:'Origem não autorizada.'});return;}const session=auth.getSession(req,res);
   if(req.method==='GET'&&u.pathname==='/api/oratorio/office'){json(res,200,await loadOffice(Object.fromEntries(u.searchParams)));return;}
   if(req.method==='GET'&&u.pathname==='/api/chatgpt/status'){json(res,200,auth.snapshot(session));return;}
   if(req.method!=='POST'||req.headers.origin!==origin||!same(req.headers['x-ci-csrf'],session.csrf)){json(res,403,{error:'Reabra o aplicativo antes de continuar.'});return;}
   const data=await body(req);
   if(u.pathname==='/api/chatgpt/login'){json(res,200,{url:auth.start(session,data.accountId||null)});return;}
   if(u.pathname==='/api/chatgpt/logout'){json(res,200,await auth.signout(session));return;}
   if(u.pathname==='/api/chatgpt/select'){json(res,200,auth.select(session,data.accountId));return;}
   if(u.pathname==='/api/chatgpt/models'){json(res,200,{models:await auth.models(session)});return;}
   if(u.pathname==='/api/chatgpt/complete'){
    if(typeof data.model!=='string'||typeof data.instructions!=='string'||data.instructions.length>200000||!Array.isArray(data.messages)||data.messages.length>30||!data.messages.length||data.messages.some(m=>!['user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>150000))throw Error('Contexto de conversa inválido.');
    const abort=new AbortController();activeRequests.add(abort);const timeout=setTimeout(()=>abort.abort(),180000);const closed=()=>{if(!res.writableEnded)abort.abort();};res.once('close',closed);
    try{const content=await auth.complete(session,{model:data.model,instructions:data.instructions,messages:data.messages.map(m=>({role:m.role,content:m.content}))},abort.signal);if(!res.destroyed)json(res,200,{content});}finally{clearTimeout(timeout);res.off('close',closed);activeRequests.delete(abort);}return;
   }
   json(res,404,{error:'Recurso não encontrado.'});return;
  }
  if(isCallback){if(req.method!=='GET'){res.writeHead(405);res.end();return;}const session=auth.getSession(req,res);try{await auth.callback(session,u.searchParams);res.writeHead(303,{Location:'/?login=success#configuracoes'});}catch(e){res.writeHead(303,{Location:'/?login_error='+encodeURIComponent(e.message)+'#configuracoes'});}res.end();return;}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  const root=path.join(here,'dist'),file=path.resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}let bytes;try{bytes=await readFile(file);}catch{res.writeHead(404);res.end('Não encontrado');return;}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(req.method==='HEAD'?undefined:bytes);
 }catch(e){if(!res.headersSent&&!res.destroyed)json(res,400,{error:e.name==='AbortError'?'Solicitação interrompida ou tempo de espera esgotado.':e.message==='fetch failed'?'Sem conexão com o ChatGPT. Confira a internet e tente novamente.':e instanceof SyntaxError?'Dados inválidos.':e.message});else if(!res.destroyed)res.end();}
 });
 return {server,origin,close:async()=>{activeRequests.forEach(c=>c.abort());auth.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(Number(process.versions.node.split('.')[0])<22){console.error('Instale Node.js 22 ou superior.');process.exit(1);}
 try{const app=await startServer({port:Number(process.env.PORT)||4173});console.log('Cathedra Integra — edição local\nAbra '+app.origin+'/#configuracoes\nMantenha esta janela aberta. Ctrl+C encerra o app e limpa as credenciais da memória.');for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>app.close().then(()=>process.exit()));}catch(e){console.error(e.code==='EADDRINUSE'?'A porta 4173 já está em uso. Feche a outra edição do app ou defina PORT com outra porta.':e.message);process.exitCode=1;}
}
