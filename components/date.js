export const formatTime = time => { // Input is HH:mm
  const split = parseTime(time);
  return `${split[0].toString().padStart(2, '0')}h${split[1].toString().padStart(2, '0')}`;
};

export const parseTime = time => {
  if(/[0-9]{2}:[0-9]{2}/.test(time)) {
    const parts = time.split(':').map(s => parseInt(s));
    return parts.every(n => n >= 0 && n < 60) ? parts : null;
  }
  return null;
};

export const parsedTimeToMinutes = ([hours, minutes]) => hours * 60 + minutes;

export const WEEKDAYS = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];

export const dateFormat = 'dd/MM/yyyy';


const locale = 'fr-FR';
const dateFormatter = new Intl.DateTimeFormat(locale, {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});
const timeFormatter = new Intl.DateTimeFormat(locale, {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
});

export const formatTimestamp = timestamp => {
  const dt = new Date(timestamp);
  return [timeFormatter, dateFormatter].map(formatter => formatter.format(dt)).join(' le ');
};
