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
    poster: '/assets/field.jpg',
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
