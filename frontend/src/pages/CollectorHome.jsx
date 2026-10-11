import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { DeviceIcon, StatusBadge, StatCard, CATEGORY, CONDITION, fmtDate } from '../components/ui';

export default function CollectorHome({ tab }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const isPartner = !!user.deliveryPartner;

  const [filters, setFilters] = useState({
    city: user.city || '',
    pincode: isPartner ? (user.pincode || '') : '',
  });
  const [available, setAvailable] = useState([]);
  const [mine, setMine] = useState([]);
  const [err, setErr] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async (f = filters) => {
    setErr('');
    try {
      // Delivery partners always query their own pincode
      const pinToQuery = isPartner ? (user.pincode || '') : f.pincode;
      const [a, m] = await Promise.all([
        user.verified ? api.availablePickups(f.city, pinToQuery) : [],
        api.assignedPickups(),
      ]);
      setAvailable(a);
      setMine(m);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function accept(id) {
    setBusyId(id);
    try {
      await api.acceptPickup(id);
      nav(`/collector/pickups/${id}`);
    } catch (e) {
      setErr(e.message);
      setBusyId(null);
      load();
    }
  }

  const active = mine.filter((p) => p.status !== 'RECYCLED');
  const done = mine.filter((p) => p.status === 'RECYCLED');
  const list = tab === 'assigned' ? active : tab === 'completed' ? done : available;
  const tabs = [
    ['/collector', 'available', 'Available', available.length],
    ['/collector/assigned', 'assigned', 'Assigned', active.length],
    ['/collector/completed', 'completed', 'Completed', done.length],
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold tracking-wider text-forest">
          {isPartner ? 'DELIVERY PARTNER (PROPOSED PILOT)' : user.name.toUpperCase()} · {user.city?.toUpperCase()}
        </p>
        <h1 className="text-3xl font-semibold text-forest mt-1">
          {isPartner ? 'Same route. Zero extra miles.' : 'Good routes start with good handovers.'}
        </h1>
        <p className="text-muted text-sm mt-1">
          {isPartner
            ? `Pick up e-waste on your daily delivery rounds in pincode ${user.pincode}.`
            : 'Find local requests and keep your assigned pickups moving.'}
        </p>
      </div>

      {isPartner && (
        <div className="bg-amber-soft/80 border border-amber-900/15 rounded-xl p-4 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Truck size={20} className="text-amber-900" />
            <div>
              <p className="font-semibold text-amber-950">Active Route: Pincode {user.pincode}</p>
              <p className="text-xs text-amber-900/80">
                You are assigned to {user.organization || 'Amazon Delivery Partner (proposed pilot)'}. Pickups outside this route are blocked.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold bg-white text-amber-900 px-2.5 py-1 rounded border border-amber-900/15">
            Delivery Partner Mode
          </span>
        </div>
      )}

      {!user.verified && (
        <div className="bg-amber-soft rounded-xl p-4 text-sm">
          <b>Verification pending.</b> You can browse after an admin verifies your identity and service area.
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label={isPartner ? 'Requests on your route' : 'Available near you'}
          value={available.length}
          note={`REQUESTED · ${isPartner ? `Pincode ${user.pincode}` : filters.city}`}
        />
        <StatCard label="Assigned pickups" value={active.length} note="ACCEPTED or PICKED_UP" />
        <StatCard label="Completed pickups" value={done.length} note="Your RECYCLED records" />
      </div>

      {tab === 'available' && user.verified && !isPartner && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
          className="card p-4 flex flex-wrap gap-3 items-end"
        >
          <div className="flex-1 min-w-32">
            <label className="label">City</label>
            <input className="input" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
          </div>
          <div className="flex-1 min-w-32">
            <label className="label">Pincode</label>
            <input className="input" maxLength={6} value={filters.pincode} onChange={(e) => setFilters({ ...filters, pincode: e.target.value })} />
          </div>
          <button className="btn">Apply filters</button>
        </form>
      )}

      <div className="flex gap-2">
        {tabs.map(([to, key, label, n]) => (
          <Link
            key={key}
            to={to}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              tab === key ? 'bg-forest text-white' : 'bg-mint text-forest'
            }`}
          >
            {label} {n}
          </Link>
        ))}
      </div>

      {err && <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{err}</p>}

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : list.length === 0 ? (
        <div className="card p-8 text-sm text-muted">
          {tab === 'available' ? 'No open requests in this route right now.' : 'Nothing here yet.'}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {list.map((p) => {
            const isOutsideRoute = isPartner && user.pincode && p.pincode !== user.pincode;
            return (
              <div
                key={p.id}
                className={`card p-5 space-y-3 ${
                  p.viaDeliveryPartner ? 'border-2 border-forest/30 bg-mint/15' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{p.code}</span>
                    {p.viaDeliveryPartner && (
                      <span className="inline-flex items-center gap-1 bg-amber-soft text-amber-900 text-[11px] font-bold px-2 py-0.5 rounded-full">
                        <Truck size={12} /> Delivery Handover
                      </span>
                    )}
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                <div className="flex items-center gap-3">
                  <DeviceIcon category={p.item.category} />
                  <div>
                    <p className="font-semibold text-sm">
                      {p.item.brand} {p.item.model}
                    </p>
                    <p className="text-xs text-muted">
                      {p.item.code} · {CATEGORY[p.item.category].label} · {p.item.weightKg} kg
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted">
                  {CONDITION[p.item.condition]} ·{' '}
                  {p.item.recommendation
                    ? p.item.recommendation[0] + p.item.recommendation.slice(1).toLowerCase()
                    : 'No advice'}{' '}
                  suggested
                </p>

                <div className="text-sm border-t border-black/5 pt-3">
                  <p className="font-semibold">{p.citizenName}</p>
                  <p className="text-xs text-muted">
                    {p.city} {p.pincode} · Preferred: {fmtDate(p.preferredDate)}, {p.timeWindow}
                  </p>
                </div>

                {p.status === 'REQUESTED' ? (
                  <button
                    className="btn w-full"
                    disabled={busyId === p.id || isOutsideRoute}
                    onClick={() => accept(p.id)}
                  >
                    {isOutsideRoute
                      ? 'Outside your delivery route'
                      : busyId === p.id
                      ? 'Accepting…'
                      : p.viaDeliveryPartner
                      ? 'Accept delivery pickup'
                      : 'Accept pickup'}
                  </button>
                ) : (
                  <Link to={`/collector/pickups/${p.id}`} className="btn btn-ghost block">
                    Open pickup
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-mint rounded-xl p-4 text-sm">
        <b>Accept only what you can safely collect.</b>{' '}
        <span className="text-muted">
          Acceptance moves a request to ACCEPTED and shares the citizen's address and contact with you. AI advice is guidance, not certification.
        </span>
      </div>
    </div>
  );
}
