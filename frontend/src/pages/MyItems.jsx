import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { DeviceIcon, StatusBadge, CATEGORY, CONDITION, fmtDate } from '../components/ui';

const FILTERS = [
  ['ALL', 'All', () => true],
  ['LISTED', 'Not requested', (i) => !i.status || i.status === 'CANCELLED'],
  ['ACTIVE', 'In progress', (i) => ['REQUESTED', 'ACCEPTED', 'PICKED_UP'].includes(i.status)],
  ['RECYCLED', 'Recycled', (i) => i.status === 'RECYCLED'],
];

export default function MyItems() {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('ALL');
  useEffect(() => { api.myItems().then(setItems).catch((e) => setErr(e.message)); }, []);
  if (err) return <p className="text-red-700">{err}</p>;
  if (!items) return <p className="text-muted">Loading…</p>;
  const test = FILTERS.find((f) => f[0] === filter)[2];
  const shown = items.filter(test);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-[11px] font-bold tracking-wider text-forest">CITIZEN / MY ITEMS</p>
          <h1 className="text-3xl font-semibold text-forest mt-1">Every device, and its next step.</h1>
          <p className="text-muted text-sm mt-1">Everything you've listed, and where each item is on its journey.</p></div>
        <Link to="/citizen/items/new" className="btn whitespace-nowrap">Add an item</Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(([k, label, fn]) => (
          <button key={k} onClick={() => setFilter(k)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${filter === k ? 'bg-forest text-white' : 'bg-mint text-forest'}`}>
            {label} {items.filter(fn).length}</button>))}
      </div>
      {shown.length === 0 ? <div className="card p-8 text-sm text-muted">{items.length === 0 ? 'No items yet. Add your first device to get a safer next step.' : 'No items in this view.'}</div> : (
        <div className="grid md:grid-cols-2 gap-4">
          {shown.map((i) => (
            <div key={i.id} className="card p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex gap-3"><DeviceIcon category={i.category} />
                  <div><p className="font-semibold text-sm">{i.brand} {i.model}</p><p className="text-xs text-muted">{i.code} · {CATEGORY[i.category].label} · {i.weightKg} kg</p></div></div>
                <StatusBadge status={i.status} />
              </div>
              <p className="text-xs text-muted">{CONDITION[i.condition]} · Added {fmtDate(i.createdAt)}</p>
              <p className="text-sm">{i.recommendation ? <>AI suggests <b>{i.recommendation[0] + i.recommendation.slice(1).toLowerCase()}</b></> : 'No advice yet'}{i.pickupCode && <span className="text-muted"> · {i.pickupCode}</span>}</p>
              <div className="flex gap-2 pt-1">
                {i.pickupId && i.status !== 'CANCELLED'
                  ? <Link to={`/citizen/pickups/${i.pickupId}`} className="btn btn-ghost">Track pickup</Link>
                  : <><Link to={`/citizen/items/${i.id}`} className="btn btn-ghost">View advice</Link><Link to={`/citizen/items/${i.id}/pickup`} className="btn">Request pickup</Link></>}
              </div>
            </div>))}
        </div>)}
    </div>
  );
}
