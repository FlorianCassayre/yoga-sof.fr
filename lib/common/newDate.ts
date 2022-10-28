export const WeekdayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const locale = 'fr-FR';
const timeZone = 'Europe/Paris';

const timeFormatterHHhMM = new Intl.DateTimeFormat(locale, {
  hour: 'numeric',
  minute: 'numeric',
  timeZone,
});

export const colonTimeToParts = (time: string): [number, number] => {
  if (/[0-9]{2}:[0-9]{2}/.test(time)) {
    const parts = time.split(':').map(s => parseInt(s));
    if(parts.every(n => n >= 0 && n < 60)) {
      return parts as [number, number];
    }
  }
  throw new Error();
};

export const timePartsToTotalMinutes = (parts: [number, number]): number => parts[0] * 60 + parts[1];

export const formatColonTimeHHhMM = (time: string): string => colonTimeToParts(time).map(n => n.toString().padStart(2, '0')).join('h');
export const formatTimeHHhMM = (date: Date) => timeFormatterHHhMM.format(date);
