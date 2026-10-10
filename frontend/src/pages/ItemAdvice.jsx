import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Sparkles, AlertTriangle, Check } from 'lucide-react';
import { api } from '../api';
import Stepper from '../components/Stepper';
import { CATEGORY, CONDITION, DeviceIcon, fmtDate } from '../components/ui';

export default function ItemAdvice() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        let i = await api.getItem(id);
        if (!i.advice) i = await api.generateAdvice(id);
        setItem(i);
      } catch (e) { setErr(e.message); }
    })();
  }, [id]);

  if (err) return <p className="text-red-700">{err}</p>;
  if (!item) return <p className="text-muted">Preparing your guidance…</p>;
  const a = item.advice;

  return (
    <div>
      <p className="text-[11px] font-bold tracking-wider text-forest">CITIZEN / ITEM {item.code}</p>
      <h1 className="text-3xl font-semibold text-forest mt-1">Saved. Here's a safer next step.</h1>
      <p className="text-muted text-sm mt-1">{item.brand} {item.model} · Added {fmtDate(item.createdAt)}</p>
      <Stepper step={2} />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-mint rounded-3xl border border-forest/20 p-6 space-y-5">
          <div className="flex justify-between text-xs font-bold tracking-wider text-forest">
            <span className="flex items-center gap-1.5"><Sparkles size={14} /> AI ADVICE</span>
            <span>RECOMMENDATION: {a.recommendation}</span>
          </div>
          <div className="flex items-center gap-3"><DeviceIcon category={item.category} />
            <div><p className="font-semibold text-sm">{item.brand} {item.model}</p><p className="text-xs text-muted">{item.code} · {CATEGORY[item.category].label} · {item.weightKg} kg</p></div></div>
          <h2 className="text-3xl font-semibold text-forest leading-tight">{a.headline}</h2>
          <p className="text-sm text-muted">{a.summary}</p>
          <div className="bg-amber-soft rounded-xl p-4">
            <p className="font-semibold text-sm mb-2">Possible hazards in this {CATEGORY[item.category].label.toLowerCase()}</p>
            {a.hazards.map((h) => (
              <div key={h.title} className="flex gap-2 text-sm mb-2"><AlertTriangle size={16} className="text-amber-700 mt-0.5 shrink-0" />
                <div><p className="font-semibold">{h.title}</p><p className="text-xs text-amber-900/80">{h.detail}</p></div></div>
            ))}
          </div>
          <div><p className="font-semibold text-sm mb-2">Until your pickup</p>
            {a.tips.map((t) => <p key={t} className="flex gap-2 text-sm mb-1"><Check size={16} className="text-forest mt-0.5 shrink-0" />{t}</p>)}</div>
          <p className="text-xs text-muted"><b>Guidance, not certification.</b> {a.disclaimer}</p>
          {item.pickupId
            ? <Link to={`/citizen/pickups/${item.pickupId}`} className="btn block">Track pickup {item.pickupCode}</Link>
            : <Link to={`/citizen/items/${item.id}/pickup`} className="btn block">Request Pickup</Link>}
        </div>
        <div className="space-y-4">
          <div className="card p-5 text-sm space-y-2">
            <p className="font-semibold text-lg">Your item record</p>
            {[['Category', CATEGORY[item.category].label], ['Brand / model', `${item.brand} · ${item.model}`], ['Condition', CONDITION[item.condition]], ['Approx. weight', `${item.weightKg} kg`]].map(([k, v]) => (
              <div key={k}><p className="text-xs text-muted">{k}</p><p>{v}</p></div>))}
            <p className="text-xs text-muted pt-2 border-t border-black/5">{item.description}</p>
          </div>
          <div className="card p-5 text-sm"><p className="font-semibold">Why this route?</p>
            <p className="text-muted text-xs mt-1">Repair, Resell and Donate usually depend on usable condition. Recycle is suggested when a device is non-working or damaged. No pickup has been requested yet.</p></div>
        </div>
      </div>
    </div>
  );
}
