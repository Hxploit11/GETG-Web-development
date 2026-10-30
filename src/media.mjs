// Keep each clip independent: these are not verified translations of the same content.
// Until their spoken languages are confirmed, both clips appear in EN and ES.
// Set language to 'en' or 'es' later. Shared/unknown clips stay visible in both locales.
export const videos = [
  {
    id: 'field-01',
    source: '/assets/video/field-demonstration-01.mp4',
    poster: '/assets/real-tanker.jpg',
    language: 'und',
    title: { en: 'A closer look in the field', es: 'Una mirada al trabajo en campo' },
    description: { en: 'Explore the first field demonstration shared by GETG.', es: 'Explore la primera demostración de campo compartida por GETG.' },
    date: '2026-10-14',
    captions: [],
  },
  {
    id: 'field-02',
    source: '/assets/video/field-demonstration-02.mp4',
    poster: '/assets/field-demo-02.png',
    language: 'und',
    title: { en: 'The work, up close', es: 'El trabajo, de cerca' },
    description: { en: 'Watch the second demonstration and discuss your application with the team.', es: 'Vea la segunda demostración y converse con el equipo sobre su aplicación.' },
    date: '2026-10-30',
    captions: [],
  },
];

export function videosForLocale(locale, entries = videos) {
  return entries.filter(video => video.language === locale || video.language === 'und' || video.language === 'shared');
}

export const conceptImages = [
  { id:'oilfield-inspection', title:{en:'Understanding the field',es:'Comprender el campo'}, alt:{en:'AI concept of technicians inspecting a pumpjack and oilfield piping',es:'Concepto con IA de técnicos inspeccionando una bomba petrolera y tuberías'} },
  { id:'fluid-transfer', title:{en:'Connecting the operation',es:'Conectar la operación'}, alt:{en:'AI concept of a tanker connected to a closed transfer system',es:'Concepto con IA de una cisterna conectada a un sistema de transferencia cerrado'} },
  { id:'equipment-care', title:{en:'Care at every connection',es:'Cuidado en cada conexión'}, alt:{en:'AI concept of a technician inspecting a pump assembly in a workshop',es:'Concepto con IA de un técnico inspeccionando una bomba en un taller'} },
  { id:'drum-logistics', title:{en:'Ready for the next step',es:'Listos para el próximo paso'}, alt:{en:'AI concept of sealed green industrial drums in a loading bay',es:'Concepto con IA de barriles industriales verdes cerrados en una zona de carga'} },
  { id:'water-management', title:{en:'A considered approach to water',es:'Un enfoque cuidadoso del agua'}, alt:{en:'AI concept of water tanks and filtration equipment in a contained service area',es:'Concepto con IA de tanques de agua y equipos de filtración en una zona de servicio'} },
  { id:'site-planning', title:{en:'See the bigger picture',es:'Ver el panorama completo'}, alt:{en:'AI concept of two technicians reviewing a field site from a walkway',es:'Concepto con IA de dos técnicos revisando un sitio desde una pasarela'} },
].map(image=>({...image,source:`/assets/concepts/${image.id}.png`,generated:true}));

const selectImages = ids => ids.map(id=>conceptImages.find(image=>image.id===id));
export const solutionImages = {
  hero: selectImages(['oilfield-inspection','equipment-care','water-management']),
  oilfield: selectImages(['oilfield-inspection','fluid-transfer','site-planning']),
  industrial: selectImages(['equipment-care','drum-logistics','fluid-transfer']),
  environmental: selectImages(['water-management','site-planning','oilfield-inspection']),
};

export const fieldImages = [
  {id:'tanker',source:'/assets/real-tanker.jpg',title:{en:'Tanker on location',es:'Cisterna en el lugar'},alt:{en:'Silver tanker at a field location',es:'Cisterna plateada en una ubicación de campo'}},
  {id:'truck',source:'/assets/real-truck.jpg',rotate:true,title:{en:'Equipment in the field',es:'Equipo en campo'},alt:{en:'Field service truck',es:'Camión de servicio en campo'}},
  ...conceptImages,
];

export const animatedVideos = [
  { title:{en:'Keep the flow moving',es:'Mantener el flujo'}, description:{en:'Explore the idea of flow assurance through a simplified pipe cutaway, from a restriction to a possible path forward.',es:'Explore el concepto de aseguramiento de flujo en una tubería simplificada, desde una restricción hasta un posible camino a seguir.'}, steps:{en:['Locate','Evaluate','Move forward'],es:['Localizar','Evaluar','Avanzar']} },
  { title:{en:'Every drop deserves a plan',es:'Cada gota merece un plan'}, description:{en:'An illustrated look at water handling: contain the flow, consider separation, and review the collection process.',es:'Una mirada ilustrada al manejo del agua: contener el flujo, considerar la separación y revisar el proceso de recolección.'}, steps:{en:['Contain','Separate','Collect'],es:['Contener','Separar','Recoger']} },
].map((video,i)=>({...video,id:`solution-${String(i+3).padStart(2,'0')}`,language:'shared',source:`/assets/video/solution-${String(i+3).padStart(2,'0')}.mp4`,poster:`/assets/concepts/solution-${String(i+3).padStart(2,'0')}.png`,captions:['en','es'].map(language=>({language,label:language==='en'?'English':'Español',src:`/assets/video/solution-${String(i+3).padStart(2,'0')}.${language}.vtt`}))}));

export const solutionVideos = [...videos, ...animatedVideos];
