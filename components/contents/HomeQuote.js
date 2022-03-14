import { Quoted } from './Quoted';

export function HomeQuote({ author, children }) {
  return (
    <div className="shadow quote-image" style={{ width: '100%' }}>
      <div className="text-white p-4 text-center" style={{ width: '100%', textShadow: '1px 1px 4px black' }}>
        <blockquote className="blockquote">
          <Quoted>{children}</Quoted>
        </blockquote>
        <em>{author}</em>
      </div>
    </div>
  );
}
