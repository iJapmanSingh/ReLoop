import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Truck } from 'lucide-react';
import { useAuth, homeFor } from '../AuthContext';
import AuthShell from '../components/AuthShell';
import { COLLECTOR_TYPES } from '../components/trust';

const CITIES = ['Bengaluru', 'Pune', 'Hyderabad', 'Delhi', 'Chandigarh', 'Ludhiana'];

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ role: 'CITIZEN', name: '', email: '', phone: '', city: 'Bengaluru', pincode: '', organization: '', collectorType: 'AUTHORISED_COLLECTOR', registrationNumber: '', password: '', confirm: '', agree: false });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const isCollector = f.role === 'COLLECTOR';
  const isPartner = isCollector && f.collectorType === 'DELIVERY_PARTNER';

  async function submit(e) {
    e.preventDefault();
    if (f.password !== f.confirm) return setErr('Passwords do not match');
    if (!f.agree) return setErr('Please agree to the Terms of service and Privacy policy');
    setErr(''); setBusy(true);
    try {
      const { confirm, agree, collectorType, registrationNumber, ...rest } = f;
      const body = isCollector ? { ...rest, collectorType, registrationNumber } : rest;
      nav(homeFor((await register(body)).role));
    } catch (x) { setErr(x.message); }
    finally { setBusy(false); }
  }

  const Role = ({ value, Icon, title, sub }) => (
    <button type="button" onClick={() => setF({ ...f, role: value })}
      className={`text-left rounded-xl border p-4 ${f.role === value ? 'border-forest bg-mint' : 'border-black/10 bg-white'}`}>
      <Icon size={18} /><p className="font-semibold text-sm mt-2">{title}</p><p className="text-xs text-muted">{sub}</p>
    </button>
  );

  return (
    <AuthShell>
      <p className="text-[11px] font-bold tracking-wider text-forest">JOIN THE CIRCLE</p>
      <h1 className="text-3xl font-semibold text-forest mt-1">Start a better habit.</h1>
      <form onSubmit={submit} className="space-y-3 mt-5">
        <div className="grid grid-cols-2 gap-3">
          <Role value="CITIZEN" Icon={User} title="Citizen" sub="List devices & book pickups" />
          <Role value="COLLECTOR" Icon={Truck} title="Collector" sub="Accept & complete pickups" />
        </div>
        {isCollector && (
          <div className="bg-mint rounded-xl p-3 text-xs text-muted space-y-1">
            <p><b className="text-ink">How collector approval works.</b> You apply with your registration or partner ID. An admin checks it before you can see or accept any pickup.</p>
            <p>E-waste in India must go to recyclers registered on the CPCB portal. Delivery partners only transport devices to a registered facility.</p>
          </div>
        )}
        <div><label className="label">Full name</label><input className="input" required value={f.name} onChange={set('name')} /></div>
        <div><label className="label">Email address</label><input className="input" type="email" required value={f.email} onChange={set('email')} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Mobile number</label><input className="input" required value={f.phone} onChange={set('phone')} /></div>
          <div><label className="label">City</label>
            <select className="input" value={f.city} onChange={set('city')}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">{isPartner ? 'Delivery route pincode' : 'Pincode'}</label><input className="input" maxLength={6} required={isPartner} value={f.pincode} onChange={set('pincode')} /></div>
          {isCollector && <div><label className="label">Organization</label><input className="input" required value={f.organization} onChange={set('organization')} /></div>}
        </div>
        {isCollector && (
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">I am a</label>
              <select className="input" value={f.collectorType} onChange={set('collectorType')}>
                {Object.entries(COLLECTOR_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select></div>
            <div><label className="label">{isPartner ? 'Partner / vendor ID' : 'Registration number'}</label>
              <input className="input" required minLength={4} value={f.registrationNumber} onChange={set('registrationNumber')}
                placeholder={isPartner ? 'ID from your delivery company' : 'CPCB / State Board registration'} /></div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Password</label><input className="input" type="password" minLength={8} required value={f.password} onChange={set('password')} /></div>
          <div><label className="label">Confirm password</label><input className="input" type="password" required value={f.confirm} onChange={set('confirm')} /></div>
        </div>
        <label className="flex gap-2 text-xs items-start"><input type="checkbox" checked={f.agree} onChange={set('agree')} className="mt-0.5" />I agree to the Terms of service and Privacy policy.</label>
        {err && <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{err}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? 'Creating…' : isCollector ? 'Submit collector application' : 'Create citizen account'}</button>
      </form>
      <p className="text-sm mt-4">Already have an account? <Link to="/login" className="text-forest font-semibold">Log in →</Link></p>
    </AuthShell>
  );
}
