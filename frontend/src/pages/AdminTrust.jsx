import { useEffect, useState } from 'react';
import { api } from '../api';
import { COLLECTOR_TYPES, RegBadge, Stars } from '../components/trust';
import { fmtDate } from '../components/ui';

const statusOf = (c) => c.status || (c.verified ? 'APPROVED' : 'PENDING');

function Meta({ c }) {
  return (
    <div className="text-xs text-muted space-y-0.5">
      <p>{COLLECTOR_TYPES[c.collectorType] || 'Collector'} · {c.organization || 'No organization'}</p>
      <p><RegBadge reg={c.registrationNumber} />{!c.registrationNumber && 'No registration number'}</p>
      <p>{c.city}{c.pincode ? ` ${c.pincode}` : ''} · {c.email} · {c.phone}</p>
    </div>
  );
}

export default function AdminTrust() {
  const [collectors, setCollectors] = useState(null);
  const [flagged, setFlagged] = useState([]);
  const [notes, setNotes] = useState({});
  const [err, setErr] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = () =>
    Promise.all([api.adminCollectors(), api.adminFlagged()])
      .then(([c, f]) => { setCollectors(c); setFlagged(f); })
      .catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  async function review(c, action) {
    setErr(''); setBusyId(c.id);
    try {
      await api.reviewCollector(c.id, { action, note: notes[c.id] || '' });
      setNotes({ ...notes, [c.id]: '' });
      await load();
    } catch (e) { setErr(e.message); }
    finally { setBusyId(null); }
  }

  if (!collectors) return err ? <p className="text-red-700">{err}</p> : <p className="text-muted">Loading…</p>;

  const pending = collectors.filter((c) => statusOf(c) === 'PENDING');
  const approved = collectors.filter((c) => statusOf(c) === 'APPROVED');
  const blocked = collectors.filter((c) => ['REJECTED', 'SUSPENDED'].includes(statusOf(c)));

  const NoteBox = ({ c, placeholder }) => (
    <input className="input mt-3" placeholder={placeholder} value={notes[c.id] || ''}
      onChange={(e) => setNotes({ ...notes, [c.id]: e.target.value })} />
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-bold tracking-wider text-forest">ADMIN / TRUST AND SAFETY</p>
        <h1 className="text-3xl font-semibold text-forest mt-1">Only approved collectors. Every problem visible.</h1>
        <p className="text-muted text-sm mt-1">Review collector applications, watch collector quality, and follow up on flagged pickups.</p>
      </div>

      {err && <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{err}</p>}

      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Applications waiting for review <span className="text-muted font-normal">({pending.length})</span></h2>
        <div className="bg-mint rounded-xl p-3 text-xs text-muted">
          <b className="text-ink">Before you approve:</b> check the registration number against the official register (in India, the{' '}
          <a className="underline text-forest" href="https://cpcb.nic.in/" target="_blank" rel="noreferrer">CPCB e-waste portal</a>).
          ReLoop does not check it automatically. Numbers starting with DEMO- are sample data, not real registrations.
        </div>
        {pending.length === 0 && <div className="card p-6 text-sm text-muted">No applications waiting.</div>}
        {pending.map((c) => (
          <div key={c.id} className="card p-5">
            <div className="flex justify-between items-start gap-4">
              <div><p className="font-semibold">{c.name}</p><Meta c={c} /></div>
              <span className="bg-amber-soft text-amber-900 text-[11px] font-bold rounded-full px-2.5 py-1">PENDING</span>
            </div>
            <NoteBox c={c} placeholder="Note (needed if you reject)" />
            <div className="flex gap-2 mt-3">
              <button className="btn" disabled={busyId === c.id} onClick={() => review(c, 'APPROVE')}>Approve</button>
              <button className="btn btn-ghost" disabled={busyId === c.id} onClick={() => review(c, 'REJECT')}>Reject</button>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Approved collectors <span className="text-muted font-normal">({approved.length})</span></h2>
        {approved.length === 0 && <div className="card p-6 text-sm text-muted">No approved collectors yet.</div>}
        {approved.map((c) => (
          <div key={c.id} className="card p-5">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div><p className="font-semibold">{c.name}</p><Meta c={c} /></div>
              <div className="text-xs text-right space-y-1">
                <p><b>{c.completed}</b> completed · <b>{c.active}</b> active</p>
                <p>{c.ratings > 0 ? <><Stars value={c.averageRating} size="text-sm" /> {c.averageRating} ({c.ratings})</> : <span className="text-muted">No ratings yet</span>}</p>
                {c.flagged > 0 && <p className="text-amber-900 bg-amber-soft rounded px-2 py-0.5 inline-block">{c.flagged} flagged</p>}
              </div>
            </div>
            <details className="mt-3">
              <summary className="text-xs text-forest font-semibold cursor-pointer">Suspend this collector</summary>
              <NoteBox c={c} placeholder="Reason (required)" />
              <button className="btn btn-ghost mt-3" disabled={busyId === c.id} onClick={() => review(c, 'SUSPEND')}>Suspend</button>
            </details>
          </div>
        ))}
      </section>

      {blocked.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-lg">Rejected or suspended <span className="text-muted font-normal">({blocked.length})</span></h2>
          {blocked.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex justify-between items-start gap-4">
                <div><p className="font-semibold">{c.name}</p><Meta c={c} />
                  {c.note && <p className="text-xs mt-1">Reason: {c.note}</p>}</div>
                <span className="bg-gray-100 text-gray-700 text-[11px] font-bold rounded-full px-2.5 py-1">{statusOf(c)}</span>
              </div>
              <button className="btn btn-ghost mt-3" disabled={busyId === c.id} onClick={() => review(c, 'APPROVE')}>Approve again</button>
            </div>
          ))}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Flagged pickups <span className="text-muted font-normal">({flagged.length})</span></h2>
        <p className="text-xs text-muted">A pickup is flagged when a citizen reports a problem, or when a wrong handover code is entered five times.</p>
        {flagged.length === 0 && <div className="card p-6 text-sm text-muted">Nothing flagged. 🎉</div>}
        {flagged.map((f) => (
          <div key={f.id} className="card p-5 text-sm">
            <div className="flex justify-between gap-4">
              <div>
                <p className="font-semibold">{f.code} · {f.item}</p>
                <p className="text-xs text-muted">Citizen: {f.citizen} · Collector: {f.collector || 'not assigned'} · {fmtDate(f.at)}</p>
              </div>
              <span className="text-[11px] font-bold bg-mint text-forest rounded-full px-2.5 py-1 h-fit">{f.status}</span>
            </div>
            <p className="mt-2 bg-amber-soft text-amber-900 rounded-lg px-3 py-2 text-xs">{f.reason}</p>
            {f.rating && <p className="text-xs mt-2">Rating: <Stars value={f.rating} size="text-sm" /></p>}
          </div>
        ))}
      </section>
    </div>
  );
}
