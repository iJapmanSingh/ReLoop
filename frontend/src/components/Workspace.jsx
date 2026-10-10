import { NavLink, Outlet, Link } from 'react-router-dom';
import { Recycle, LogOut } from 'lucide-react';
import { useAuth } from '../AuthContext';

const NAV = {
  CITIZEN: [['/citizen', 'Overview'], ['/citizen/items', 'My items'], ['/citizen/pickups', 'My pickups'], ['/citizen/facilities', 'Nearby facilities']],
  COLLECTOR: [['/collector', 'Requests'], ['/collector/assigned', 'Assigned pickups'], ['/collector/completed', 'Completed']],
  ADMIN: [['/admin', 'Impact overview']],
};

export default function Workspace() {
  const { user, logout } = useAuth();
  const links = NAV[user.role];
  const cls = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-mint font-semibold' : 'hover:bg-mint/60'}`;
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-white border-r border-black/5 md:w-60 md:min-h-screen p-4">
        <Link to="/" className="flex items-center gap-2 font-bold mb-3"><Recycle size={20} /> ReLoop</Link>
        <span className="inline-block bg-mint text-forest text-[10px] font-bold tracking-wider rounded-full px-2.5 py-1 mb-4">
          {user.role} WORKSPACE
        </span>
        <nav className="flex md:block gap-1 overflow-x-auto">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to.split('/').length === 2} className={cls}>{label}</NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-black/5 px-6 py-3 flex justify-end items-center gap-4 text-sm">
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
