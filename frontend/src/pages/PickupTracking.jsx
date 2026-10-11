import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Coins, Truck } from 'lucide-react';
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
      <h1 className="text-3xl font-semibold text-forest mt-1">
        {p.status === 'CANCELLED' ? 'This pickup was cancelled.' : 'Your pickup is moving forward.'}
      </h1>
      <p className="text-muted text-sm mt-1 mb-6">Follow the handover, all the way to responsible recycling.</p>
      {err && <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2 mb-4">{err}</p>}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-semibold">{p.code} · Pickup progress</h2>
              {p.viaDeliveryPartner && (
                <span className="inline-flex items-center gap-1 mt-1 bg-amber-soft text-amber-900 text-xs px-2.5 py-0.5 rounded-full font-medium">
                  <Truck size={12} /> Delivery Partner Handover
                </span>
              )}
            </div>
            <StatusBadge status={p.status} />
          </div>
          <p className="text-sm font-medium">{p.item.brand} {p.item.model}</p>
          <p className="text-xs text-muted pb-4 border-b border-black/5">
            {p.item.code} · {CATEGORY[p.item.category].label} · {p.item.weightKg} kg
          </p>
          <Timeline entries={p.timeline} status={p.status} />

          {/* Credit status */}
          {p.status === 'RECYCLED' ? (
            <div className="bg-mint rounded-xl p-3.5 text-sm flex justify-between items-center border border-forest/15">
              <div className="flex items-center gap-2">
                <Coins size={18} className="text-forest" />
                <div>
                  <p className="font-semibold text-forest">+{p.creditsAwarded} ReLoop Credits Earned</p>
                  <p className="text-xs text-muted">
                    {p.viaDeliveryPartner ? 'Includes +25 delivery-handover bonus.' : 'Awarded for completed recycling.'}
                  </p>
                </div>
              </div>
              <Link to="/citizen/rewards" className="text-xs font-semibold text-forest underline hover:text-ink">
                View Rewards →
              </Link>
            </div>
          ) : p.status !== 'CANCELLED' ? (
            <div className="bg-mint/60 rounded-xl p-3.5 text-sm flex justify-between items-center border border-forest/10">
              <div className="flex items-center gap-2">
                <Coins size={16} className="text-forest" />
                <div>
                  <p className="font-semibold text-forest">Estimated Reward: ~{p.estimatedCredits} credits</p>
                  <p className="text-xs text-muted">
                    Earned once collector records RECYCLED status{p.viaDeliveryPartner ? ' (includes partner bonus)' : ''}.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {p.status !== 'RECYCLED' && p.status !== 'CANCELLED' && (
            <div className="bg-mint rounded-xl p-3 text-sm">
              <b>Not recycled yet.</b>{' '}
              <span className="text-muted">
                This {p.item.weightKg} kg device will count toward your impact and credit ledger only after the RECYCLED stage is recorded.
              </span>
            </div>
          )}

          {p.status === 'REQUESTED' && (
            <button onClick={cancel} className="btn btn-ghost mt-2">
              Cancel pickup request
            </button>
          )}
        </div>
        <div className="space-y-4">
          {c ? (
            <div className="bg-mint rounded-2xl p-5">
              <p className="text-[11px] font-bold tracking-wider text-forest mb-2">
                {c.deliveryPartner ? 'DELIVERY PARTNER (PROPOSED PILOT)' : 'VERIFIED COLLECTOR'}
              </p>
              <p className="font-semibold text-lg">{c.name}</p>
              <p className="text-xs text-muted">{c.organization} · {c.code}</p>
              <p className="font-semibold mt-3">{c.phone}</p>
              <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="btn block mt-3">Call collector</a>
              <p className="text-xs text-muted mt-3">Shared after acceptance.{p.status === 'ACCEPTED' && ' Cancellation is no longer available.'}</p>
            </div>
          ) : (
            p.status === 'REQUESTED' && (
              <div className="card p-5 text-sm text-muted">
                No collector assigned yet. {p.viaDeliveryPartner ? 'Delivery partners on route' : 'Verified collectors'} in your area can see this request.
              </div>
            )
          )}
          <div className="card p-5 text-sm">
            <p className="font-semibold mb-2">Preferred pickup</p>
            <p className="font-semibold">{fmtDate(p.preferredDate)} · {p.timeWindow}</p>
            <p className="text-muted mt-3">{p.address}, {p.city} {p.pincode}</p>
            {p.landmark && <p className="text-xs text-muted mt-1">Landmark: {p.landmark}</p>}
          </div>
          <div className="bg-amber-soft rounded-2xl p-4 text-sm">
            <p className="font-semibold">Keep it safe until handover</p>
            <p className="text-amber-900/80 mt-1">
              Keep the device off and dry. Don't charge or open it. Match the collector's name before handing it over.
            </p>
          </div>
        </div>
      </div>
      <Link to="/citizen" className="btn btn-ghost mt-6">Back to overview</Link>
    </div>
  );
}
