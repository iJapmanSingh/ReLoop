import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import Stepper from '../components/Stepper';
import { CATEGORY, DeviceIcon } from '../components/ui';

const WINDOWS = ['10:00-13:00', '14:00-17:00', '17:00-20:00'];
const tomorrow = () => new Date(Date.now() + 864e5).toISOString().slice(0, 10);

export default function RequestPickup() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [item, setItem] = useState(null);
  const [f, setF] = useState({ address: '', landmark: '', city: user.city || '', pincode: user.pincode || '', preferredDate: tomorrow(), timeWindow: WINDOWS[0], contactNumber: user.phone || '', consentShared: false });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  useEffect(() => { api.getItem(id).then(setItem).catch((e) => setErr(e.message)); }, [id]);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const p = await api.createPickup({ ...f, itemId: Number(id) });
      nav(`/citizen/pickups/${p.id}`);
    } catch (x) { setErr(x.message); setBusy(false); }
  }

  if (!item) return err ? <p className="text-red-700">{err}</p> : <p className="text-muted">Loading…</p>;
  return (
    <div>
      <p className="text-[11px] font-bold tracking-wider text-forest">CITIZEN / REQUEST PICKUP</p>
      <h1 className="text-3xl font-semibold text-forest mt-1">Let's arrange a safe handover.</h1>
      <p className="text-muted text-sm mt-1">Choose where and when. A verified collector will accept your request.</p>
      <Stepper step={3} />
      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={submit} className="card p-6 space-y-4 lg:col-span-2">
          <h2 className="font-semibold">Pickup details</h2>
          <div><label className="label">Pickup address *</label><textarea className="input h-20" required value={f.address} onChange={set('address')} /></div>
          <div><label className="label">Landmark</label><input className="input" value={f.landmark} onChange={set('landmark')} /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">City *</label><input className="input" required value={f.city} onChange={set('city')} /></div>
            <div><label className="label">Pincode *</label><input className="input" required maxLength={6} pattern="\d{6}" value={f.pincode} onChange={set('pincode')} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Preferred date *</label><input className="input" type="date" required min={new Date().toISOString().slice(0, 10)} value={f.preferredDate} onChange={set('preferredDate')} /></div>
            <div><label className="label">Preferred time window *</label>
              <select className="input" value={f.timeWindow} onChange={set('timeWindow')}>{WINDOWS.map((w) => <option key={w}>{w}</option>)}</select></div>
          </div>
          <div><label className="label">Contact number *</label><input className="input" required value={f.contactNumber} onChange={set('contactNumber')} /></div>
          <div className="bg-mint rounded-xl p-3 text-sm"><b>A preferred date is not a confirmed slot.</b> <span className="text-muted">Your assigned collector will coordinate the handover after accepting. Your request starts as REQUESTED.</span></div>
          <label className="flex gap-2 text-xs items-start"><input type="checkbox" className="mt-0.5" checked={f.consentShared} onChange={set('consentShared')} />I agree to share this address and contact number with the assigned verified collector for this pickup.</label>
          {err && <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{err}</p>}
          <button className="btn w-full" disabled={busy || !f.consentShared}>{busy ? 'Submitting…' : 'Submit pickup request'}</button>
          <p className="text-xs text-muted">You can cancel only while the request is REQUESTED.</p>
        </form>
        <div className="space-y-4">
          <div className="card p-5 text-sm">
            <p className="font-semibold text-lg mb-3">Your pickup item</p>
            <div className="flex items-center gap-3"><DeviceIcon category={item.category} />
              <div><p className="font-semibold">{item.brand} {item.model}</p><p className="text-xs text-muted">{item.code} · {CATEGORY[item.category].label} · {item.weightKg} kg</p></div></div>
            {item.recommendation && <span className="inline-block mt-3 bg-mint text-forest text-[11px] font-bold rounded-full px-2.5 py-1">AI RECOMMENDATION: {item.recommendation}</span>}
          </div>
          <div className="bg-amber-soft rounded-2xl p-4 text-sm"><p className="font-semibold">Before the collector arrives</p>
            <p className="text-amber-900/80 mt-1">Keep the device off and dry. Don't dismantle it. Erase personal data only if safe. Check the assigned collector's name before handover.</p></div>
          <Link to={`/citizen/items/${id}`} className="btn btn-ghost block">Back to AI advice</Link>
        </div>
      </div>
    </div>
  );
}
