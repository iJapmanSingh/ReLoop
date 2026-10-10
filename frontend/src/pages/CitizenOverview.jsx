import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { DeviceIcon, StatusBadge, StatCard, CATEGORY, fmtDate } from '../components/ui';

const CO2_PER_KG = 3; // matches the backend factor

export default function CitizenOverview() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [pickups, setPickups] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    Promise.all([api.myItems(), api.myPickups()])
      .then(([i, p]) => { setItems(i); setPickups(p); })
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <p className="text-red-700">{err}</p>;
  if (!items || !pickups) return <p className="text-muted">Loading…</p>;

  const done = pickups.filter((p) => p.status === 'RECYCLED');
  const kg = done.reduce((s, p) => s + p.item.weightKg, 0);
  const active = pickups.find((p) => p.status === 'ACCEPTED');

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-wider text-forest">{user.name.toUpperCase()}'S OVERVIEW · {user.city.toUpperCase()}</p>
          <h1 className="text-3xl font-semibold text-forest mt-1">A little less waste. A lot more possibility.</h1>
        </div>
        <Link to="/citizen/items/new" className="btn whitespace-nowrap">Add an item</Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="E-waste diverted" value={`${kg.toFixed(1)} kg`} note={`From ${done.length} completed recycling records`} />
        <StatCard label="Estimated emissions saved" value={`${Math.round(kg * CO2_PER_KG)} kg CO2e`} note={`Illustrative estimate · ${CO2_PER_KG} kg CO2e / kg`} />
        <StatCard label="Items recycled" value={`${done.length} items`} note="Only RECYCLED items contribute" />
      </div>

      {active && (
        <div className="bg-forest text-white rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-lg">Your {active.item.brand} {active.item.model} is in good hands.</p>
            <p className="text-sm text-white/70">{active.collector?.name} accepted {active.code}. Preferred pickup: {fmtDate(active.preferredDate)}, {active.timeWindow}.</p>
          </div>
          <Link to={`/citizen/pickups/${active.id}`} className="btn btn-ghost whitespace-nowrap">Track pickup</Link>
        </div>
      )}

      <section className="card p-5">
        <h2 className="font-semibold mb-3">My items <span className="text-xs text-muted font-normal">· {items.length}</span></h2>
        {items.length === 0 ? <p className="text-sm text-muted py-4">No items yet. Add your first device to get a safer next step.</p> : (
          <div className="divide-y divide-black/5">
            {items.map((i) => (
              <div key={i.id} className="py-3 flex items-center gap-4">
                <DeviceIcon category={i.category} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{i.brand} {i.model}</p>
                  <p className="text-xs text-muted">{i.code} · {CATEGORY[i.category].label} · {i.weightKg} kg</p>
                </div>
                <span className="hidden sm:block text-xs text-muted">{i.recommendation ? i.recommendation[0] + i.recommendation.slice(1).toLowerCase() : 'No advice yet'}{i.pickupCode ? ` · ${i.pickupCode}` : ''}</span>
                <StatusBadge status={i.status} />
                <Link className="text-xs font-semibold text-forest whitespace-nowrap" to={i.pickupId ? `/citizen/pickups/${i.pickupId}` : `/citizen/items/${i.id}`}>
                  {i.pickupId ? 'Track pickup →' : 'Next step →'}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card p-5">
        <h2 className="font-semibold mb-3">My pickups</h2>
        {pickups.length === 0 ? <p className="text-sm text-muted py-4">No pickups yet.</p> : (
          <div className="divide-y divide-black/5">
            {pickups.map((p) => (
              <Link key={p.id} to={`/citizen/pickups/${p.id}`} className="py-3 flex items-center justify-between gap-4 hover:bg-mint/40 -mx-2 px-2 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{p.code} · {p.item.brand} {p.item.model}</p>
                  <p className="text-xs text-muted">{p.collector ? `${p.collector.name} · ${p.collector.organization}` : p.status === 'REQUESTED' ? 'Awaiting collector · Cancellation available' : ''}</p>
                </div>
                <span className="text-xs text-muted">{fmtDate(p.preferredDate)} · {p.timeWindow}</span>
                <StatusBadge status={p.status} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
