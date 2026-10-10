import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, PieChart, Pie, Cell } from 'recharts';
import { api } from '../api';
import { StatCard, CATEGORY, fmtDate } from '../components/ui';

const COLORS = { REQUESTED: '#9bb09a', ACCEPTED: '#3d5f7a', PICKED_UP: '#c8a24a', RECYCLED: '#244a3c' };

function BarList({ title, rows, label }) {
  const max = Math.max(1, ...rows.map((r) => r.kg));
  return (
    <div className="card p-5">
      <h3 className="font-semibold">{title}</h3>
      <div className="space-y-4 mt-4">
        {rows.length === 0 && <p className="text-sm text-muted">No completed recycling yet.</p>}
        {rows.map((r) => (
          <div key={r.name}>
            <div className="flex justify-between text-sm"><span>{label(r.name)}</span><span className="font-semibold">{r.kg} kg</span></div>
            <div className="h-2 bg-mint rounded-full mt-1"><div className="h-2 bg-forest rounded-full" style={{ width: `${(r.kg / max) * 100}%` }} /></div>
            <p className="text-xs text-muted mt-1">{r.items} recycled items</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [s, setS] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api.adminStats().then(setS).catch((e) => setErr(e.message)); }, []);
  if (err) return <p className="text-red-700">{err}</p>;
  if (!s) return <p className="text-muted">Loading…</p>;

  const pie = Object.entries(s.statusCounts).map(([name, value]) => ({ name, value }));
  const pct = s.totalRequests ? Math.round((s.statusCounts.RECYCLED / s.totalRequests) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold tracking-wider text-forest">ADMIN / ENVIRONMENTAL IMPACT</p>
        <h1 className="text-3xl font-semibold text-forest mt-1">See the difference. Keep it accountable.</h1>
        <p className="text-muted text-sm mt-1">Community-wide collection and completed recycling, in one clear view.</p>
        <span className="inline-block mt-3 bg-amber-soft text-amber-900 text-[10px] font-bold tracking-wider rounded px-2 py-1">DEMO / ILLUSTRATIVE DATA</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="E-waste diverted" value={`${s.totalKg.toLocaleString()} kg`} note="Weight from RECYCLED records only" />
        <StatCard label="Estimated emissions saved" value={`${s.totalCo2.toLocaleString()} kg CO2e`} note="Illustrative · 3 kg CO2e per kg" />
        <StatCard label="Items recycled" value={s.itemsRecycled} note="One item per completed pickup" />
        <StatCard label="Total pickup requests" value={s.totalRequests} note="All four lifecycle statuses" />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold">Materials back in the loop</h3><p className="text-xs text-muted">Monthly recycled weight (kg)</p>
          <div className="h-64 mt-3"><ResponsiveContainer>
            <BarChart data={s.monthly} margin={{ top: 20 }}><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis hide /><Tooltip />
              <Bar dataKey="kg" fill="#244a3c" radius={[4, 4, 0, 0]}><LabelList dataKey="kg" position="top" /></Bar></BarChart>
          </ResponsiveContainer></div>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold">Pickup status</h3>
          <div className="h-44 relative mt-2"><ResponsiveContainer>
            <PieChart><Pie data={pie} dataKey="value" innerRadius={55} outerRadius={75} stroke="none">{pie.map((e) => <Cell key={e.name} fill={COLORS[e.name]} />)}</Pie></PieChart>
          </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center text-center pointer-events-none"><div><p className="text-xl font-semibold">{pct}%</p><p className="text-xs text-muted">recycled</p></div></div></div>
          {pie.map((e) => <div key={e.name} className="flex justify-between text-sm mt-1"><span className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[e.name] }} />{e.name}</span><b>{e.value}</b></div>)}
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <BarList title="Impact by city" rows={s.byCity} label={(n) => n} />
        <BarList title="Impact by device" rows={s.byDevice} label={(n) => CATEGORY[n]?.label || n} />
      </div>
      <div className="card p-5">
        <h3 className="font-semibold mb-3">Completed records · sample audit trail</h3>
        {s.recent.map((r) => (
          <div key={r.code} className="flex justify-between items-center py-3 border-t border-black/5 text-sm">
            <div><p className="font-semibold">{r.code}</p><p className="text-xs text-muted">{r.item} · {r.citizen}</p></div>
            <span className="text-xs text-muted">{fmtDate(r.at)}</span><span className="text-xs">{r.kg} kg · {r.co2} kg CO2e</span>
            <span className="bg-mint text-forest text-[11px] font-semibold rounded-full px-2.5 py-1">RECYCLED</span>
          </div>))}
      </div>
      <div className="bg-mint rounded-xl p-4 text-xs text-muted"><b className="text-ink">How to read these totals.</b> Only RECYCLED records contribute to diverted kg, estimated CO2e and recycled-item counts. CO2e uses a simplified factor, not a verified carbon methodology.</div>
    </div>
  );
}
