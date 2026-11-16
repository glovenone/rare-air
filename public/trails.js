export const flightTrails = [
  { id: 'classic', days: 0, name: 'Original breeze', color: '#fff0ac', planes: ['#db8a62', '#72a9a6', '#d8b066'] },
  { id: 'gold', days: 3, name: 'Golden breeze', color: '#ffd36a', planes: ['#d59a30', '#efc46d', '#c77440'] },
  { id: 'cloud', days: 7, name: 'Cloud current', color: '#c0f5ff', planes: ['#4b9fb6', '#77ccca', '#a4dfe6'] },
  { id: 'aurora', days: 14, name: 'Aurora trail', color: '#f5b6e5', planes: ['#b676bc', '#82c6c3', '#e3a1bb'] },
  { id: 'star', days: 30, name: 'Starlight trail', color: '#e4ddff', planes: ['#7389cc', '#b3a5e2', '#d3bd89'] },
];

export function selectedTrail() {
  let id;
  try { id = localStorage.getItem('rare:flight-trail'); } catch {}
  return flightTrails.find(trail => trail.id === id) || flightTrails[0];
}

export function selectTrail(id) {
  if (!flightTrails.some(trail => trail.id === id)) return;
  try { localStorage.setItem('rare:flight-trail', id); } catch {}
  window.dispatchEvent(new CustomEvent('rare:trail', { detail: id }));
}
