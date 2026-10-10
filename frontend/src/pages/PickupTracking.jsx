import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import Timeline from '../components/Timeline';
import { StatusBadge, CATEGORY, fmtDate } from '../components/ui';

export default function PickupTracking() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [err, setErr] = useState('');
  const load = () => api.getPickup(id).then(setP).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, [id]);

  async function cancel() {
    if (!confirm('Cancel this pickup request?')) return;
    try { setP(await api.cancelPickup(id)); } catch (e) { setErr(e.message); }
  }

  if (!p) return err ? <p className="text-red-700">{err}</p> : <p className="text-muted">Loading…</p>;
  const c = p.collector;
  return (
    <div>
      <p className="text-[11px] font-bold tracking-wider text-forest">CITIZEN / {p.code}</p>
      <h1 className="text-3xl font-semibold text-forest mt-1">{p.status === 'CANCELLED' ? 'This pickup was cancelled.' : 'Your pickup is moving forward.'}</h1>
      <p className="text-muted text-sm mt-1 mb-6">Follow the handover, all the way to responsible recycling.</p>
      {err && <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2 mb-4">{err}</p>}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <div className="flex justify-between items-start mb-3"><h2 className="font-semibold">{p.code} · Pickup progress</h2><StatusBadge status={p.status} /></div>
          <p className="text-sm font-medium">{p.item.brand} {p.item.model}</p>
          <p className="text-xs text-muted mb-5 pb-5 border-b border-black/5">{p.item.code} · {CATEGORY[p.item.category].label} · {p.item.weightKg} kg</p>
          <Timeline entries={p.timeline} status={p.status} />
          {p.status !== 'RECYCLED' && p.status !== 'CANCELLED' && (
            <div className="bg-mint rounded-xl p-3 text-sm mt-6"><b>Not recycled yet.</b> <span className="text-muted">This {p.item.weightKg} kg device will count toward your impact only after the RECYCLED stage is recorded.</span></div>)}
          {p.status === 'REQUESTED' && <button onClick={cancel} className="btn btn-ghost mt-5">Cancel pickup request</button>}
        </div>
        <div className="space-y-4">
          {c ? (
            <div className="bg-mint rounded-2xl p-5">
              <p className="text-[11px] font-bold tracking-wider text-forest mb-3">VERIFIED COLLECTOR</p>
              <p className="font-semibold text-lg">{c.name}</p><p className="text-xs text-muted">{c.organization} · {c.code}</p>
              <p className="font-semibold mt-3">{c.phone}</p>
              <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="btn block mt-3">Call collector</a>
              <p className="text-xs text-muted mt-3">Shared after acceptance.{p.status === 'ACCEPTED' && ' Cancellation is no longer available.'}</p>
            </div>
          ) : p.status === 'REQUESTED' && <div className="card p-5 text-sm text-muted">No collector assigned yet. Verified collectors in your area can see this request.</div>}
          <div className="card p-5 text-sm">
            <p className="font-semibold mb-2">Preferred pickup</p>
            <p className="font-semibold">{fmtDate(p.preferredDate)} · {p.timeWindow}</p>
            <p className="text-muted mt-3">{p.address}, {p.city} {p.pincode}</p>
            {p.landmark && <p className="text-xs text-muted mt-1">Landmark: {p.landmark}</p>}
          </div>
          <div className="bg-amber-soft rounded-2xl p-4 text-sm"><p className="font-semibold">Keep it safe until handover</p>
            <p className="text-amber-900/80 mt-1">Keep the device off and dry. Don't charge or open it. Match the collector's name before handing it over.</p></div>
        </div>
      </div>
      <Link to="/citizen" className="btn btn-ghost mt-6">Back to overview</Link>
    </div>
  );
}
