/**
 * Single-series bar chart (enquiries per week) in plain SVG.
 * One hue, thin marks, rounded data-ends, recessive grid, per-bar hover title.
 */
export function WeeklyBars({ data, label }: { data: { week: string; count: number }[]; label: string }) {
  const w = 640, h = 220, padL = 32, padB = 28, padT = 12;
  const max = Math.max(1, ...data.map((d) => d.count));
  const bw = (w - padL) / data.length;
  const ticks = [0, Math.ceil(max / 2), max];
  return (
    <figure>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label={`${label}: ${data.map((d) => `${d.week} ${d.count}`).join(", ")}`}>
        {ticks.map((t) => {
          const y = padT + (1 - t / max) * (h - padB - padT);
          return (
            <g key={t}>
              <line x1={padL} x2={w} y1={y} y2={y} stroke="#0b1d33" strokeOpacity="0.08" />
              <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#51607a">{t}</text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const bh = (d.count / max) * (h - padB - padT);
          const x = padL + i * bw + bw * 0.25;
          const y = h - padB - bh;
          return (
            <g key={d.week}>
              <title>{`Week of ${new Date(d.week).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}: ${d.count}`}</title>
              <rect x={x} y={Math.min(y, h - padB - 2)} width={bw * 0.5} height={Math.max(2, bh)} rx="4" fill="#0b1d33" />
              <text x={x + bw * 0.25} y={h - 8} textAnchor="middle" fontSize="11" fill="#51607a">{new Date(d.week).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</text>
            </g>
          );
        })}
      </svg>
      <figcaption className="sr-only">{label}</figcaption>
    </figure>
  );
}
