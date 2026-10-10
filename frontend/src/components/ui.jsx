import { Smartphone, Laptop, Monitor, Printer, Refrigerator, Plug } from 'lucide-react';

export const CATEGORY = {
  PHONE_TABLET: { label: 'Phones & tablets', Icon: Smartphone },
  LAPTOP_COMPUTER: { label: 'Laptop / computer', Icon: Laptop },
  MONITOR_TV: { label: 'Monitor / TV', Icon: Monitor },
  PRINTER_PERIPHERAL: { label: 'Printer / peripheral', Icon: Printer },
  LARGE_APPLIANCE: { label: 'Large appliance', Icon: Refrigerator },
  SMALL_ELECTRONICS: { label: 'Small electronics', Icon: Plug },
};
export const CONDITION = { WORKING: 'Working', NOT_WORKING: 'Not working', DAMAGED: 'Damaged' };

export function DeviceIcon({ category, size = 22 }) {
  const Icon = (CATEGORY[category] || CATEGORY.SMALL_ELECTRONICS).Icon;
  return <Icon size={size} strokeWidth={1.5} />;
}

const BADGE = {
  REQUESTED: 'bg-amber-soft text-amber-900',
  ACCEPTED: 'bg-mint text-forest',
  PICKED_UP: 'bg-sky-100 text-sky-900',
  RECYCLED: 'bg-mint text-forest',
  CANCELLED: 'bg-gray-100 text-gray-600',
  LISTED: 'bg-gray-100 text-gray-600',
};
export function StatusBadge({ status }) {
  const s = status || 'LISTED';
  return <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${BADGE[s]}`}>{s}</span>;
}

export function StatCard({ label, value, note }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="text-3xl font-semibold mt-1">{value}</p>
      <p className="text-xs text-muted mt-1">{note}</p>
    </div>
  );
}

export const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
