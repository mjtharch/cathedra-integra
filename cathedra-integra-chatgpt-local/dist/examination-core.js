export function selectedItems(data, answers = {}) {
 return data.groups.flatMap(group => group.items.filter(item => answers[item.id]?.selected).map(item => ({...item, group: group.title, note: String(answers[item.id]?.note || ''), frequency: String(answers[item.id]?.frequency || '')})));
}
export function buildExaminationText(data, state = {}, full = false) {
 const lines = ['CAT H E D R A  I N T E G R A', 'Exame de consciência — preparação pessoal para a confissão', '', 'Documento privado. Auxílio de memória; não constitui confissão nem absolvição.', 'Perguntas editoriais baseadas nas fontes tradicionais indicadas ao final.', ''];
 if (full) {
  lines.push('PREPARAÇÃO', ...data.instructions.map(x => x.title + ': ' + x.text), '', 'ORAÇÕES');
  for (const prayer of data.prayers) lines.push(prayer.title, prayer.pt, prayer.la || '', '');
 }
 if (state.last) lines.push('Desde a última confissão: ' + state.last, '');
 for (const group of data.groups) {
  const items = group.items.filter(item => full || state.answers?.[item.id]?.selected);
  if (!items.length) continue;
  lines.push(group.title.toUpperCase(), group.description || '');
  for (const item of items) {
   const answer = state.answers?.[item.id];
   lines.push((answer?.selected ? '[Marcado para levar à confissão] ' : '') + item.text);
   if (answer?.selected && answer.frequency) lines.push('Número ou frequência aproximada: ' + answer.frequency);
   if (answer?.selected && answer.note) lines.push('Anotação: ' + answer.note);
  }
  lines.push('');
 }
 for (const [key, title] of [['notes','Outras anotações'], ['purpose','Propósito de emenda'], ['repair','Reparação e penitência']]) if (state[key]) lines.push(title.toUpperCase(), state[key], '');
 if (!full && !selectedItems(data, state.answers).length && !state.notes && !state.purpose && !state.repair && !state.last) lines.push('Nenhuma anotação ou ponto marcado neste exame.', '');
 lines.push('DEPOIS DA CONFISSÃO', ...data.after, '', 'FONTES E EDIÇÃO', ...data.sources.map(x => x.title + ' — ' + x.detail + '\n' + x.url), '', data.edition, '', 'Guarde este arquivo com cuidado. Ele contém apenas o que você decidiu exportar.');
 return lines.join('\n');
}
