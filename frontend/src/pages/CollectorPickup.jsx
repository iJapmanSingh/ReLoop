import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { api } from '../api';
import Timeline from '../components/Timeline';
import { StatusBadge, CATEGORY, CONDITION, fmtDate } from '../components/ui';

export default function CollectorPickup() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.getPickup(id).then(setP).catch((e) => setErr(e.message)); }, [id]);

  const run = (fn) => async () => {
    setBusy(true); setErr('');
    try { setP(await fn()); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  if (!p) return err ? <p className="text-red-700">{err}</p> : <p className="text-muted">Loading…</p>;
  const mine = !!p.collector; // collector details only come back for the assigned collector
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.address}, ${p.city} ${p.pincode}`)}`;

  return (
    <div>
      <p className="text-[11px] font-bold tracking-wider text-forest">COLLECTOR / {p.code}</p>
      <div className="flex justify-between items-start mt-1">
        <h1 className="text-3xl font-semibold text-forest">One handover. Every step recorded.</h1><StatusBadge status={p.status} />
      </div>
      {err && <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2 mt-4">{err}</p>}
      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <p className="font-semibold">{p.item.brand} {p.item.model}</p>
            <p className="text-xs text-muted">{p.item.code} · {CATEGORY[p.item.category].label} · {p.item.weightKg} kg · {CONDITION[p.item.condition]}</p>
            <p className="text-sm text-muted mt-2">{p.item.description}</p>
            {p.item.recommendation && <span className="inline-block mt-3 bg-mint text-forest text-[11px] font-bold rounded-full px-2.5 py-1">AI SUGGESTS {p.item.recommendation} · GUIDANCE ONLY</span>}
            <div className="border-t border-black/5 mt-4 pt-4 text-sm">
              <p className="text-lg font-semibold">{p.citizenName}</p>
              {mine ? (<>
                <p className="mt-1">{p.address}</p>
                <p className="text-xs text-muted">{p.landmark} · {p.contactNumber}</p>
                <div className="flex gap-2 mt-3"><a className="btn btn-ghost" href={`tel:${p.contactNumber.replace(/\s/g, '')}`}>Call citizen</a>
                  <a className="btn btn-ghost" href={maps} target="_blank" rel="noreferrer">View directions</a></div>
              </>) : <p className="text-xs text-muted mt-1">{p.city} {p.pincode}. Full address and contact are shared after you accept.</p>}
              <p className="font-semibold mt-3">Preferred: {fmtDate(p.preferredDate)} · {p.timeWindow}</p>
            </div>
          </div>

          {p.status === 'REQUESTED' && <button className="btn w-full" disabled={busy} onClick={run(() => api.acceptPickup(id))}>Accept pickup</button>}

          {mine && p.status !== 'REQUESTED' && (
            <div className="bg-mint border border-forest/20 rounded-2xl p-6">
              {p.status === 'ACCEPTED' && (<>
                <h2 className="font-semibold text-lg">Next: confirm the handover</h2>
                <p className="text-sm text-muted mt-1">Mark PICKED_UP only after receiving the device from {p.citizenName}. This step does not count as completed recycling.</p>
                {['Match the device and pickup ID.', 'Check for battery damage without opening the casing.', 'Confirm safe receipt with the citizen.'].map((t) => <p key={t} className="flex gap-2 text-sm mt-2"><Check size={16} className="text-forest mt-0.5" />{t}</p>)}
                <button className="btn w-full mt-4" disabled={busy} onClick={run(() => api.setStatus(id, 'PICKED_UP'))}>Mark picked up</button>
              </>)}
              <h2 className="font-semibold mt-5">{p.status === 'ACCEPTED' ? 'Then: record recycling completion' : p.status === 'PICKED_UP' ? 'Record recycling completion' : 'Completed'}</h2>
              {p.status === 'RECYCLED'
                ? <p className="text-sm text-muted mt-1">Recycling recorded. This device now counts toward the citizen's impact.</p>
                : <>
                    <button className="btn w-full mt-3" disabled={busy || p.status !== 'PICKED_UP'} onClick={run(() => api.setStatus(id, 'RECYCLED'))}>Mark recycled</button>
                    <p className="text-xs text-muted mt-2">{p.status === 'PICKED_UP' ? 'Record RECYCLED only after authorised processing is completed, never at collection.' : 'Unavailable until status is PICKED_UP.'}</p>
                  </>}
            </div>
          )}
          <div className="bg-amber-soft rounded-2xl p-4 text-sm"><p className="font-semibold">Battery and circuit-board precautions</p>
            <p className="text-amber-900/80 mt-1">Possible lithium-ion battery and lead-bearing solder. Keep the device dry and unpowered. Don't puncture, crush or dismantle it.</p></div>
        </div>
        <div className="space-y-4">
          <div className="card p-5"><p className="font-semibold mb-4">Pickup record</p><Timeline entries={p.timeline} status={p.status} /></div>
          <div className="bg-mint rounded-2xl p-4 text-xs text-muted"><b className="text-ink">No skipped stages.</b> REQUESTED → ACCEPTED → PICKED_UP → RECYCLED. Citizen cancellation is unavailable after acceptance.</div>
        </div>
      </div>
      <Link to="/collector/assigned" className="btn btn-ghost mt-6">Back to assigned pickups</Link>
    </div>
  );
}
