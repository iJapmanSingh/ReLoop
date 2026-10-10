export default function Stepper({ step }) {
  const labels = ['List item', 'AI advice', 'Book pickup'];
  return (
    <ol className="flex flex-wrap gap-x-8 gap-y-2 text-sm my-6">
      {labels.map((l, i) => {
        const n = i + 1;
        const s = n < step ? 'done' : n === step ? 'now' : 'todo';
        return (
          <li key={l} className="flex items-center gap-2">
            <span className={`grid place-items-center w-6 h-6 rounded-full text-xs font-bold ${s === 'todo' ? 'bg-mint text-muted' : 'bg-forest text-white'}`}>
              {s === 'done' ? '✓' : n}
            </span>
            <span className={s === 'todo' ? 'text-muted' : 'font-semibold'}>{l}</span>
          </li>
        );
      })}
    </ol>
  );
}
