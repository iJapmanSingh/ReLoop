import { useState, useEffect } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Recycle, LogOut, Coins } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { api } from '../api';

const NAV = {
  CITIZEN: [
    ['/citizen', 'Overview'],
    ['/citizen/items', 'My items'],
    ['/citizen/pickups', 'My pickups'],
    ['/citizen/rewards', 'Rewards'],
    ['/citizen/facilities', 'Nearby facilities'],
  ],
  COLLECTOR: [
    ['/collector', 'Requests'],
    ['/collector/assigned', 'Assigned pickups'],
    ['/collector/completed', 'Completed'],
  ],
  ADMIN: [['/admin', 'Impact overview']],
};

export default function Workspace() {
  const { user, logout } = useAuth();
  const [balance, setBalance] = useState(user.creditBalance ?? 0);
  const links = NAV[user.role] || [];
  const cls = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-mint font-semibold' : 'hover:bg-mint/60'}`;

  useEffect(() => {
    if (user.role !== 'CITIZEN') return;
    const fetchBalance = () => {
      api.credits()
        .then((res) => setBalance(res.balance))
        .catch(() => {});
    };
    fetchBalance();
    window.addEventListener('credits-changed', fetchBalance);
    return () => window.removeEventListener('credits-changed', fetchBalance);
  }, [user.role]);

  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-white border-r border-black/5 md:w-60 md:min-h-screen p-4">
        <Link to="/" className="flex items-center gap-2 font-bold mb-3"><Recycle size={20} /> ReLoop</Link>
        <span className="inline-block bg-mint text-forest text-[10px] font-bold tracking-wider rounded-full px-2.5 py-1 mb-4">
          {user.deliveryPartner ? 'DELIVERY PARTNER' : `${user.role} WORKSPACE`}
        </span>
        <nav className="flex md:block gap-1 overflow-x-auto">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to.split('/').length === 2} className={cls}>{label}</NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-black/5 px-6 py-3 flex justify-end items-center gap-4 text-sm">
          {user.role === 'CITIZEN' && (
            <Link
              to="/citizen/rewards"
              className="flex items-center gap-1.5 bg-mint text-forest font-semibold text-xs px-3 py-1.5 rounded-full hover:bg-forest hover:text-white transition-colors"
              title="View and redeem ReLoop credits"
            >
              <Coins size={14} />
              <span>{balance} credits</span>
            </Link>
          )}
          {user.deliveryPartner && (
            <span className="text-xs bg-amber-soft text-amber-900 font-medium px-2.5 py-1 rounded-full">
              Route: {user.pincode}
            </span>
          )}
          <span className="grid place-items-center w-8 h-8 rounded-full bg-mint text-xs font-bold">
            {user.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
          </span>
          <span>{user.name}</span>
          <button onClick={logout} title="Log out" className="text-muted hover:text-ink"><LogOut size={18} /></button>
        </header>
        <main className="p-6 max-w-5xl"><Outlet /></main>
      </div>
    </div>
  );
}
