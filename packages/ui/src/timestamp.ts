import { intervalToDuration } from 'date-fns';

export const formatRelativeTimestamp = (date: Date, reference: Date = new Date()): string => {
  const past = date.getTime() <= reference.getTime();
  const { years, months, days, hours, minutes } = intervalToDuration(
    past ? { start: date, end: reference } : { start: reference, end: date },
  );

  let suffix: string;
  if (years) {
    suffix = `${years} année${years > 1 ? 's' : ''}`;
  } else if (months) {
    suffix = `${months} mois`;
  } else if (days) {
    if (past && days === 1) {
      return 'Hier';
    }
    if (past && days === 2) {
      return 'Avant-hier';
    }
    suffix = `${days} jour${days > 1 ? 's' : ''}`;
  } else if (hours) {
    suffix = `${hours} heure${hours > 1 ? 's' : ''}`;
  } else if (minutes) {
    suffix = `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    suffix = 'quelques instants';
  }

  return past ? `Il y a ${suffix}` : `Dans ${suffix}`;
};

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  timeZone: 'Europe/Paris',
});

const timeFormatter = new Intl.DateTimeFormat('fr-FR', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  timeZone: 'Europe/Paris',
});

export const formatTimestamp = (date: Date): string =>
  `Le ${dateFormatter.format(date)} à ${timeFormatter.format(date)}`;
