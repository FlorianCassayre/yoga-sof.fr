import { intervalToDuration } from "date-fns";

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
export const formatTimeHHhMM = (date: Date | string) => timeFormatterHHhMM.format(new Date(date));

const dateFormatter = new Intl.DateTimeFormat(locale, {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  timeZone,
});

const timeFormatterHHhMMmSSs = new Intl.DateTimeFormat(locale, {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  timeZone,
});

export const formatDateDDsMMsYYYY = (date: Date | string): string => dateFormatter.format(new Date(date));

export const formatDateDDsMMsYYYsHHhMMmSSs = (date: Date | string): string => {
  return 'Le ' + [dateFormatter, timeFormatterHHhMMmSSs].map(formatter => formatter.format(new Date(date))).join(' à ');
};

export const formatTimestampRelative = (date: Date | string) => {
  const duration = intervalToDuration({
    start: new Date(date),
    end: new Date(),
  })

  let suffix;
  if (duration.years) {
    suffix = `${duration.years} année${duration.years > 1 ? 's' : ''}`;
  } else if (duration.months) {
    suffix = `${duration.months} mois`;
  } else if (duration.days) {
    suffix = `${duration.days} jour${duration.days > 1 ? 's' : ''}`;
  } else if (duration.hours) {
    suffix = `${duration.hours} heure${duration.hours > 1 ? 's' : ''}`;
  } else if (duration.minutes) {
    suffix = `${duration.minutes} minute${duration.minutes > 1 ? 's' : ''}`;
  } else {
    suffix = `quelques instants`;
  }
  return `Il y a ${suffix}`;
}

export const formatDayRange = (start: Date | string, end: Date | string, capitalize = true): string => {
  //const dateString = dateLiteralFormatter.format(new Date(start));
  //return [capitalize ? capitalizeFirst(dateString) : dateString, 'de', formatTimeRange(start, end)].join(' ');
  return '';
};
