import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import Stepper from '../components/Stepper';
import { CATEGORY, CONDITION } from '../components/ui';

export default function AddItem() {
  const nav = useNavigate();
  const [f, setF] = useState({ category: 'LAPTOP_COMPUTER', brand: '', model: '', condition: 'NOT_WORKING', weightKg: '', description: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const item = await api.createItem({ ...f, weightKg: Number(f.weightKg) });
      nav(`/citizen/items/${item.id}`);
    } catch (x) { setErr(x.message); setBusy(false); }
  }

  return (
    <div>
      <p className="text-[11px] font-bold tracking-wider text-forest">CITIZEN / NEW ITEM</p>
      <h1 className="text-3xl font-semibold text-forest mt-1">What's ready for a next step?</h1>
      <p className="text-muted text-sm mt-1">A few details help us suggest a safer route for your electronics.</p>
      <Stepper step={1} />
      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={submit} className="card p-6 space-y-4 lg:col-span-2">
          <h2 className="font-semibold">Tell us about your device</h2>
          <div><label className="label">Category *</label>
            <select className="input" value={f.category} onChange={set('category')}>
              {Object.entries(CATEGORY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Brand *</label><input className="input" required value={f.brand} onChange={set('brand')} /></div>
            <div><label className="label">Model *</label><input className="input" required value={f.model} onChange={set('model')} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Condition *</label>
              <select className="input" value={f.condition} onChange={set('condition')}>
                {Object.entries(CONDITION).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select></div>
            <div><label className="label">Approximate weight (kg) *</label>
              <input className="input" type="number" step="0.1" min="0.1" required value={f.weightKg} onChange={set('weightKg')} />
              <p className="text-xs text-muted mt-1">An estimate is fine. Include the device only.</p></div>
          </div>
          <div><label className="label">Description *</label>
            <textarea className="input h-24" required maxLength={1000} value={f.description} onChange={set('description')} placeholder="Won't power on. Battery no longer holds charge…" /></div>
          {err && <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{err}</p>}
          <button className="btn w-full" disabled={busy}>{busy ? 'Saving…' : 'Save item & get AI advice'}</button>
          <p className="text-xs text-muted">Your item is saved before advice is generated. No pickup is booked yet.</p>
        </form>
        <div className="space-y-4">
          <div className="bg-amber-soft rounded-2xl p-4 text-sm"><p className="font-semibold">Don't open the device</p>
            <p className="text-amber-900/80 mt-1">Do not dismantle, puncture batteries or test damaged electronics. If a battery is hot or swollen, stop handling it and seek specialist advice.</p></div>
          <div className="bg-mint rounded-2xl p-4 text-sm"><p className="font-semibold">Protect your personal data</p>
            <p className="text-muted mt-1">Back up and erase personal data when safe to do so. Never include passwords in the description.</p></div>
        </div>
      </div>
      <Link to="/citizen" className="btn btn-ghost mt-6">Back to my items</Link>
    </div>
  );
}
