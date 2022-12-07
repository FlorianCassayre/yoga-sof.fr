export const urlForLocation = ({ coordinates: { latitude, longitude } }: { coordinates: { latitude: number, longitude: number } }) =>
  `https://www.google.com/maps/place/${latitude},${longitude}`;
