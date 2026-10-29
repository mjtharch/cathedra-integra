const editions={'1954':'Divino Afflatu - 1954','1960':'Rubrics 1960 - 1960'};
const hours=['Matutinum','Laudes','Prima','Tertia','Sexta','Nona','Vesperae','Completorium'];
export function publicOfficeUrl(date,hour,version){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))throw Error('Escolha uma data válida.');
 const d=new Date(date+'T12:00:00Z');
 if(Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==date||+date.slice(0,4)<1900||+date.slice(0,4)>2100)throw Error('Escolha uma data entre 1900 e 2100.');
 if(!hours.includes(hour)||!Object.hasOwn(editions,version))throw Error('Hora ou edição não reconhecida.');
 const [y,m,day]=date.split('-'),url=new URL('https://texts.livemass.net/cgi-bin/horas/Pofficium.pl');
 url.search=new URLSearchParams({command:'pray'+hour,date1:m+'-'+day+'-'+y,lang2:'Portugues',version:editions[version],votive:'Hodie'}).toString();return url.href;
}
