import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Coins, Truck, KeyRound, ShieldCheck } from 'lucide-react';
import { api } from '../api';
import Timeline from '../components/Timeline';
import { StatusBadge, CATEGORY, fmtDate } from '../components/ui';
import { COLLECTOR_TYPES, RegBadge, Stars } from '../components/trust';

export default function PickupTracking() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [err, setErr] = useState('');
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [report, setReport] = useState(false);
  const [sending, setSending] = useState(false);
  const load = () => api.getPickup(id).then(setP).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, [id]);

  async function cancel() {
    if (!confirm('Cancel this pickup request?')) return;
    try { setP(await api.cancelPickup(id)); } catch (e) { setErr(e.message); }
  }

  async function sendFeedback(e) {
    e.preventDefault();
    if (!stars) return setErr('Please choose a star rating');
    setErr(''); setSending(true);
    try { setP(await api.submitFeedback(id, { rating: stars, comment, reportProblem: report })); }
    catch (x) { setErr(x.message); }
    finally { setSending(false); }
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
                    Earned once the collector records the receiving facility and receipt (RECYCLED){p.viaDeliveryPartner ? ', includes partner bonus' : ''}.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {p.status === 'RECYCLED' && p.facilityName && (
            <div className="rounded-xl p-3.5 text-sm border border-forest/15 flex gap-2 items-start">
              <ShieldCheck size={18} className="text-forest mt-0.5" />
              <div>
                <p className="font-semibold text-forest">Recycling record</p>
                <p className="text-xs text-muted">Received by <b className="text-ink">{p.facilityName}</b> · Receipt {p.receiptNumber}</p>
              </div>
            </div>
          )}

          {p.status === 'RECYCLED' && (
            p.rating ? (
              <div className="rounded-xl p-3.5 text-sm border border-black/10">
                <p className="font-semibold">Your feedback <Stars value={p.rating} /></p>
                {p.feedback && <p className="text-xs text-muted mt-1">"{p.feedback}"</p>}
                {p.flagged && <p className="text-xs text-amber-900 bg-amber-soft rounded px-2 py-1 mt-2">You reported a problem. An admin will review this pickup.</p>}
              </div>
            ) : (
              <form onSubmit={sendFeedback} className="rounded-xl p-4 border border-black/10 space-y-3">
                <p className="font-semibold text-sm">How was this pickup?</p>
                <div className="flex gap-1" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setStars(n)} aria-label={`${n} stars`}
                      className={`text-2xl leading-none ${n <= stars ? 'text-amber-700' : 'text-black/20'}`}>★</button>
                  ))}
                </div>
                <textarea className="input" rows={2} maxLength={500} placeholder="Anything we should know? (optional)"
                  value={comment} onChange={(e) => setComment(e.target.value)} />
                <label className="flex gap-2 text-xs items-start">
                  <input type="checkbox" className="mt-0.5" checked={report} onChange={(e) => setReport(e.target.checked)} />
                  Report a problem with this pickup (an admin will review it)
                </label>
                <button className="btn" disabled={sending}>{sending ? 'Sending…' : 'Submit feedback'}</button>
              </form>
            )
          )}

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
          {p.handoverCode && (
            <div className="rounded-2xl p-5 border-2 border-forest bg-white">
              <p className="text-[11px] font-bold tracking-wider text-forest flex items-center gap-1.5"><KeyRound size={14} /> YOUR HANDOVER CODE</p>
              <p className="font-mono text-4xl tracking-[0.25em] font-semibold mt-2">{p.handoverCode}</p>
              <p className="text-xs text-muted mt-2">Read this out only when the collector is at your door and their name matches. They need it to mark your device as picked up. Never share it by phone or message beforehand.</p>
            </div>
          )}
          {c ? (
            <div className="bg-mint rounded-2xl p-5">
              <p className="text-[11px] font-bold tracking-wider text-forest mb-2">
                {c.deliveryPartner ? 'DELIVERY PARTNER (PROPOSED PILOT)' : c.verified ? 'APPROVED COLLECTOR' : 'COLLECTOR'}
              </p>
              <p className="font-semibold text-lg">{c.name}</p>
              <p className="text-xs text-muted">{c.organization} · {c.code}</p>
              {c.collectorType && <p className="text-xs text-muted mt-1">{COLLECTOR_TYPES[c.collectorType] || c.collectorType}</p>}
              <RegBadge reg={c.registrationNumber} className="text-xs text-muted block mt-0.5" />
              {c.ratingCount > 0 && <p className="text-xs mt-1"><Stars value={c.averageRating} size="text-sm" /> <span className="text-muted">{c.averageRating} · {c.ratingCount} rating{c.ratingCount === 1 ? '' : 's'}</span></p>}
              <p className="font-semibold mt-3">{c.phone}</p>
              <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="btn block mt-3">Call collector</a>
              <p className="text-xs text-muted mt-3">Shared after acceptance.{p.status === 'ACCEPTED' && ' Cancellation is no longer available.'}</p>
            </div>
          ) : (
            p.status === 'REQUESTED' && (
              <div className="card p-5 text-sm text-muted">
                No collector assigned yet. {p.viaDeliveryPartner ? 'Approved delivery partners on route' : 'Approved collectors'} in your area can see this request.
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
              Keep the device off and dry. Don't charge or open it. Match the collector's name, and give them your handover code only at the door.
            </p>
          </div>
        </div>
      </div>
      <Link to="/citizen" className="btn btn-ghost mt-6">Back to overview</Link>
    </div>
  );
}
