import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { StatusBadge, CATEGORY, fmtDate } from '../components/ui';

const FILTERS = [
  ['ALL', 'All', () => true],
  ['ACTIVE', 'Active', (p) => ['REQUESTED', 'ACCEPTED', 'PICKED_UP'].includes(p.status)],
  ['DONE', 'Completed', (p) => p.status === 'RECYCLED'],
  ['CANCELLED', 'Cancelled', (p) => p.status === 'CANCELLED'],
];

export default function MyPickups() {
  const [pickups, setPickups] = useState(null);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('ALL');
  useEffect(() => { api.myPickups().then(setPickups).catch((e) => setErr(e.message)); }, []);
  if (err) return <p className="text-red-700">{err}</p>;
  if (!pickups) return <p className="text-muted">Loading…</p>;
  const test = FILTERS.find((f) => f[0] === filter)[2];
  const shown = pickups.filter(test);

  return (
    <div className="space-y-6">
      <div><p className="text-[11px] font-bold tracking-wider text-forest">CITIZEN / MY PICKUPS</p>
        <h1 className="text-3xl font-semibold text-forest mt-1">Every handover, tracked.</h1>
        <p className="text-muted text-sm mt-1">Follow each pickup from request to completed recycling.</p></div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(([k, label, fn]) => (
          <button key={k} onClick={() => setFilter(k)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${filter === k ? 'bg-forest text-white' : 'bg-mint text-forest'}`}>
            {label} {pickups.filter(fn).length}</button>))}
      </div>
      {shown.length === 0 ? <div className="card p-8 text-sm text-muted">{pickups.length === 0 ? <>No pickups yet. <Link to="/citizen/items" className="text-forest font-semibold">List an item</Link> to request one.</> : 'No pickups in this view.'}</div> : (
        <div className="space-y-3">
          {shown.map((p) => (
            <Link key={p.id} to={`/citizen/pickups/${p.id}`} className="card p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-mint/40">
              <div><p className="font-semibold text-sm">{p.code} · {p.item.brand} {p.item.model}</p>
                <p className="text-xs text-muted">{p.item.code} · {CATEGORY[p.item.category].label} · {p.item.weightKg} kg</p>
                <p className="text-xs text-muted mt-1">{p.collector ? `${p.collector.name} · ${p.collector.organization}` : p.status === 'REQUESTED' ? 'Awaiting a collector · cancellation available' : ''}</p></div>
              <div className="text-xs text-muted text-right"><p>Preferred</p><p className="text-ink font-semibold">{fmtDate(p.preferredDate)} · {p.timeWindow}</p></div>
              <StatusBadge status={p.status} />
            </Link>))}
        </div>)}
    </div>
  );
}
