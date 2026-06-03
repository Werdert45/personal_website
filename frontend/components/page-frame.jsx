export function PageFrame({ children }) {
  return (
    <div className="page-frame">
      <div className="coords" aria-hidden="true">
        <span>52°22'15"N</span>
        <span>AMSTERDAM · NL</span>
        <span>IR · 2026</span>
      </div>
      <div className="coords coords-r" aria-hidden="true">
        <span>04°53'42"E</span>
        <span>GEODATA · ML · SPATIAL</span>
      </div>
      {children}
    </div>
  );
}
