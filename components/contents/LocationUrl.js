import { urlForLocation } from '../../lib/common';

export function LocationUrl({ location, children }) {
  return (
    <a href={urlForLocation(location)} target="_blank" rel="noopener noreferrer">{children}</a>
  );
}
