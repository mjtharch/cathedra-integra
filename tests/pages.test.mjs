import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {publicOfficeUrl} from '../dist/office-links.js';
import {officeUrl} from '../local/offices.mjs';
test('links públicos dos ofícios preservam data, hora e rubricas da edição local',()=>{
 for(const hour of ['Matutinum','Laudes','Prima','Tertia','Sexta','Nona','Vesperae','Completorium'])for(const version of ['1954','1960'])assert.equal(publicOfficeUrl('2026-10-29',hour,version),officeUrl({date:'2026-10-29',hour,version,votive:'Hodie'}));
 for(const date of ['2026-02-30','1899-12-31','2101-01-01','javascript:alert(1)'])assert.throws(()=>publicOfficeUrl(date,'Laudes','1954'));
 assert.throws(()=>publicOfficeUrl('2026-10-29','evil','1954'));assert.throws(()=>publicOfficeUrl('2026-10-29','Laudes','evil'));
});
test('preparação Pages publica apenas arquivos públicos e mantém edição local separada',async()=>{
 execFileSync(process.execPath,[fileURLToPath(new URL('../scripts/build-pages.mjs',import.meta.url))]);
 const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
 assert.match(await read('site/deployment.js'),/STATIC_EDITION = true/);assert.match(await read('dist/deployment.js'),/STATIC_EDITION = false/);
 const html=await read('site/index.html');assert.match(html,/GITHUB PAGES/);assert.doesNotMatch(html,/<option value="chatgpt">/);assert.match(html,/<div id="gpt-settings" hidden>/);assert.match(html,/na fonte original/);assert.match(html,/\.\/examination.js/);
 const entries=await readdir(new URL('../site/',import.meta.url));for(const privateName of ['.local','local','server.mjs','tests','registrations.json','.env'])assert.ok(!entries.includes(privateName));
 for(const name of ['index.html','app.js','deployment.js','examination.json','prayers.json','corpus.json'])assert.ok(entries.includes(name));
 assert.match(await read('.github/workflows/pages.yml'),/path: site/);
});
