export const formatTime = (time, compact = false) => { // Input is HH:mm
  const split = parseTime(time);
  const suffix = split[1].toString().padStart(2, '0');
  return `${compact ? split[0] : split[0].toString().padStart(2, '0')}h` + (compact && split[1] === 0 ? '' : suffix);
};

export const parseTime = time => {
  if(/[0-9]{2}:[0-9]{2}/.test(time)) {
    const parts = time.split(':').map(s => parseInt(s));
    return parts.every(n => n >= 0 && n < 60) ? parts : null;
  }
  return null;
};

export const parsedTimeToMinutes = ([hours, minutes]) => hours * 60 + minutes;

export const parsedTimeToTime = ([hours, minutes]) => `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

export const minutesToParsedTime = minutes => [Math.floor(minutes / 60), minutes % 60];

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
const timeMinutesFormatter = new Intl.DateTimeFormat(locale, {
  hour: 'numeric',
  minute: 'numeric',
});

export const formatTimestamp = timestamp => {
  const dt = new Date(timestamp);
  return [timeFormatter, dateFormatter].map(formatter => formatter.format(dt)).join(' le ');
};

export const formatTimeRange = (start, end) => {
  return [timeMinutesFormatter.format(new Date(start)).replace(':', 'h'), 'à', timeMinutesFormatter.format(new Date(end)).replace(':', 'h')].join(' ');
};

export const formatDayRange = (start, end) => {
  return [dateFormatter.format(new Date(start)), 'de', formatTimeRange(start, end)].join(' ');
};
