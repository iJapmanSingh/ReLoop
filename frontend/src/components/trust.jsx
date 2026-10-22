// Small helpers shared by the collector, citizen and admin screens.
export const COLLECTOR_TYPES = {
  RECYCLER: 'Registered recycler',
  REFURBISHER: 'Registered refurbisher',
  AUTHORISED_COLLECTOR: 'Authorised collection partner',
  DELIVERY_PARTNER: 'Delivery partner (transport only)',
};

export const isDemoReg = (reg) => !!reg && reg.toUpperCase().startsWith('DEMO-');

export function Stars({ value, size = 'text-base' }) {
  const n = Math.round(value || 0);
  return (
    <span className={`${size} text-amber-700 tracking-tight`} aria-label={`${value} out of 5`}>
      {'★'.repeat(n)}<span className="text-black/20">{'★'.repeat(5 - n)}</span>
    </span>
  );
}

export function RegBadge({ reg, className = '' }) {
  if (!reg) return null;
  return (
    <span className={className}>
      Reg. {reg}{isDemoReg(reg) && <span className="ml-1 bg-amber-soft text-amber-900 text-[10px] font-bold rounded px-1.5 py-0.5">DEMO</span>}
    </span>
  );
}
