import { RiDoubleQuotesL, RiDoubleQuotesR } from 'react-icons/ri';

export function Quoted({ children }) {
  return (
    <p>
      <RiDoubleQuotesL className="icon me-2" />
      {children}
      <RiDoubleQuotesR className="icon ms-2" />
    </p>
  );
}
