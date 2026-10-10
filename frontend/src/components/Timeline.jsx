const STAGES = [
  ['REQUESTED', 'Request received', 'Request shared with verified local collectors.'],
  ['ACCEPTED', 'Collector assigned', 'Waiting for a collector to accept.'],
  ['PICKED_UP', 'Device handed over', 'Awaiting pickup confirmation.'],
  ['RECYCLED', 'Materials responsibly processed', 'Impact updates only after completion.'],
];
const fmt = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function Timeline({ entries, status }) {
  const at = Object.fromEntries((entries || []).map((e) => [e.status, e.at]));
  return (
    <ol className="space-y-5">
      {STAGES.map(([key, title, hint], i) => {
        const done = !!at[key];
        const current = key === status;
        return (
          <li key={key} className="flex gap-3">
            <span className={`mt-0.5 grid place-items-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${done ? 'bg-forest text-white' : 'bg-mint text-muted'}`}>
              {done && !current ? '✓' : i + 1}
            </span>
            <div>
              <p className="text-[11px] font-bold tracking-wider text-muted">
                {key} {current && <span className="ml-1 bg-mint text-forest rounded px-1.5 py-0.5">CURRENT</span>}
              </p>
              <p className={`text-sm ${done ? 'font-semibold' : 'text-muted'}`}>{title}</p>
              <p className="text-xs text-muted">{done ? fmt(at[key]) : hint}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
