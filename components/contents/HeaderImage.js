export function HeaderImage({ title, subtitle }) {
  return (
    <div className="shadow header-image" style={{ width: '100%', height: '50vh', position: 'relative' }}>
      <div
        className="text-white text-center p-4"
        style={{ position: 'absolute', bottom: 0, width: '100%', textShadow: '2px 2px 4px #000000', zIndex: 100 }}
      >
        <h1 className="display-1">{title}</h1>
        <br />
        <span className="fs-2">{subtitle}</span>
      </div>
    </div>
  );
}
