import { useEffect, useState } from 'react';
import { Gift, Coins } from 'lucide-react';
import { api } from '../api';
import { StatCard, fmtDate } from '../components/ui';

export default function Rewards() {
  const [c, setC] = useState(null);
  const [err, setErr] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => { api.credits().then(setC).catch((e) => setErr(e.message)); }, []);

  async function redeem(r) {
    if (!confirm(`Redeem ${r.cost} credits for ${r.title}?`)) return;
    setBusyId(r.id); setErr(''); setNotice('');
    try {
      const next = await api.redeem(r.id);
      setC(next);
      setNotice(`Redeemed ${r.title}. Your voucher code is ${next.transactions[0].voucherCode}.`);
      window.dispatchEvent(new Event('credits-changed')); // refresh the header balance
    } catch (e) { setErr(e.message); } finally { setBusyId(null); }
  }

  if (!c) return err ? <p className="text-red-700">{err}</p> : <p className="text-muted">Loading…</p>;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold tracking-wider text-forest">CITIZEN / REWARDS</p>
        <h1 className="text-3xl font-semibold text-forest mt-1">Recycle more. Earn more.</h1>
        <p className="text-muted text-sm mt-1">You earn ReLoop credits when a pickup is recorded as RECYCLED. Handing over with a delivery partner earns a bonus.</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Available credits" value={c.balance} note="Spend them below" />
        <StatCard label="Total earned" value={c.totalEarned} note="From RECYCLED pickups" />
        <StatCard label="Total redeemed" value={c.totalRedeemed} note="Spent on rewards" />
      </div>
      {err && <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{err}</p>}
      {notice && <p className="text-sm bg-mint text-forest rounded-lg px-3 py-2 font-semibold">{notice}</p>}
      <div className="grid md:grid-cols-3 gap-4">
        {c.rewards.map((r) => (
          <div key={r.id} className="card p-5 space-y-3">
            <Gift size={22} strokeWidth={1.5} />
            <div><p className="font-semibold">{r.title}</p><p className="text-xs text-muted mt-1">{r.description}</p></div>
            <p className="flex items-center gap-1.5 text-sm font-semibold"><Coins size={16} />{r.cost} credits</p>
            <button className="btn w-full" disabled={busyId === r.id || c.balance < r.cost} onClick={() => redeem(r)}>
              {c.balance < r.cost ? `${r.cost - c.balance} more needed` : busyId === r.id ? 'Redeeming…' : 'Redeem'}
            </button>
          </div>
        ))}
      </div>
      <div className="card p-5">
        <h2 className="font-semibold mb-3">Credit history</h2>
        {c.transactions.length === 0 ? <p className="text-sm text-muted">No credits yet. They appear when a pickup reaches RECYCLED.</p> : c.transactions.map((t) => (
          <div key={t.id} className="flex justify-between items-center gap-4 py-3 border-t border-black/5 text-sm">
            <div>
              <p className="font-medium">{t.description}</p>
              <p className="text-xs text-muted">{fmtDate(t.at)}{t.pickupCode ? ` · ${t.pickupCode}` : ''}{t.voucherCode ? ` · Code ${t.voucherCode}` : ''}</p>
            </div>
            <span className={`font-semibold ${t.points > 0 ? 'text-forest' : 'text-ink'}`}>{t.points > 0 ? '+' : ''}{t.points}</span>
          </div>
        ))}
      </div>
      <div className="bg-mint rounded-xl p-4 text-xs text-muted"><b className="text-ink">Demo rewards.</b> Voucher codes are simulated for this prototype. A real partnership with a retailer would issue real credits.</div>
    </div>
  );
}
