import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, homeFor } from '../AuthContext';
import AuthShell from '../components/AuthShell';

const DEMO = [
  ['Citizen', 'ananya.rao@example.com', 'Citizen@123'],
  ['Collector', 'ravi@greenloop.in', 'Collector@123'],
  ['Admin', 'admin@ewaste.app', 'Admin@123'],
];

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try { nav(homeFor((await login(email, password)).role)); }
    catch (x) { setErr(x.message); }
    finally { setBusy(false); }
  }

  return (
    <AuthShell>
      <p className="text-[11px] font-bold tracking-wider text-forest">WELCOME BACK</p>
      <h1 className="text-3xl font-semibold text-forest mt-1">Good to see you again.</h1>
      <p className="text-muted text-sm mt-1 mb-6">Log in to continue your device's journey.</p>
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label">Email address</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label">Password</label>
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {err && <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{err}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form>
      <p className="text-sm mt-4">New here? <Link to="/register" className="text-forest font-semibold">Create an account →</Link></p>
      <div className="mt-6 bg-mint rounded-xl p-4 text-sm">
        <p className="font-semibold mb-2">Demo accounts</p>
        <div className="flex gap-2">
          {DEMO.map(([n, e, p]) => (
            <button key={n} type="button" className="btn btn-ghost !py-1.5" onClick={() => { setEmail(e); setPassword(p); }}>{n}</button>
          ))}
        </div>
      </div>
    </AuthShell>
  );
}
