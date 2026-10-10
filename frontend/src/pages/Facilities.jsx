import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Recycle } from 'lucide-react';

const FACILITIES = [
  { name: 'GreenLoop Indiranagar drop-off', km: 1.2, address: '24, 100 Feet Road, Indiranagar, Bengaluru 560038', city: 'Bengaluru', pin: '560038', hours: 'Mon–Sat · 09:00–18:00', accepts: 'Laptops, phones, monitors & peripherals', phone: '+91 90000 02101' },
  { name: 'Domlur community collection hub', km: 2.4, address: '16, 2nd Main, Domlur, Bengaluru 560008', city: 'Bengaluru', pin: '560008', hours: 'Tue–Sun · 10:00–17:00', accepts: 'Small electronics, cables & printers', phone: '+91 90000 02102' },
  { name: 'East Bengaluru material recovery', km: 5.8, address: '8, Service Road, Ramamurthy Nagar, Bengaluru 560016', city: 'Bengaluru', pin: '560016', hours: 'Mon–Sat · 09:30–17:30', accepts: 'Computers, appliances & mixed e-waste', phone: '+91 90000 02103' },
  { name: 'Kothrud e-waste collection point', km: 1.8, address: '12, Karve Road, Kothrud, Pune 411038', city: 'Pune', pin: '411038', hours: 'Mon–Sat · 10:00–18:00', accepts: 'Phones, laptops & small electronics', phone: '+91 90000 02201' },
  { name: 'Gachibowli recycling hub', km: 2.1, address: '5, Financial District Road, Gachibowli, Hyderabad 500032', city: 'Hyderabad', pin: '500032', hours: 'Mon–Sun · 09:00–17:00', accepts: 'Computers, monitors & appliances', phone: '+91 90000 02301' },
];

export function FacilitiesList({ signedIn }) {
  const [q, setQ] = useState('Indiranagar, Bengaluru');
  const [pin, setPin] = useState('560038');
  const [applied, setApplied] = useState({ q, pin });
  const words = applied.q.toLowerCase().split(/[ ,]+/).filter(Boolean);
  const list = FACILITIES.filter((f) =>
    (applied.pin.length < 3 || f.pin.startsWith(applied.pin.slice(0, 3))) &&
    (applied.pin.length >= 3 || words.some((w) => `${f.city} ${f.address}`.toLowerCase().includes(w))));

  return (
    <div>
      <p className="text-[11px] font-bold tracking-wider text-forest">{signedIn ? 'CITIZEN / ' : ''}NEARBY FACILITIES</p>
      <h1 className="text-3xl font-semibold text-forest mt-1">A responsible destination, closer by.</h1>
      <p className="text-muted text-sm mt-1">Find a local drop-off option. Call ahead to confirm accepted devices and current authorisation.</p>
      <form onSubmit={(e) => { e.preventDefault(); setApplied({ q, pin }); }} className="card p-4 mt-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-40"><label className="label">Locality or city</label><input className="input" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="flex-1 min-w-32"><label className="label">Pincode</label><input className="input" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value)} /></div>
        <button className="btn">Search facilities</button>
      </form>
      <p className="text-sm font-semibold mt-6 mb-3">{list.length} demo {list.length === 1 ? 'facility' : 'facilities'} found</p>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {list.length === 0 && <div className="card p-6 text-sm text-muted">No demo facilities for that search. Try 560038, 411038 or 500032.</div>}
          {list.map((f, i) => (
            <div key={f.name} className="card p-5">
              <div className="flex items-center gap-3"><span className="grid place-items-center w-7 h-7 rounded-full bg-mint text-forest text-xs font-bold">{String.fromCharCode(65 + i)}</span>
                <div><p className="font-semibold">{f.name}</p><p className="text-xs text-muted">{f.km} km away · Illustrative distance</p></div></div>
              <p className="text-sm mt-3">{f.address}</p>
              <p className="text-xs text-muted mt-2">{f.hours}</p>
              <p className="text-xs mt-2"><b>Accepts:</b> {f.accepts}</p>
              <p className="text-xs text-muted mt-1">Demo contact: {f.phone}</p>
              <div className="flex gap-2 mt-4">
                <a className="btn btn-ghost" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.address)}`}>View directions</a>
                <a className="btn btn-ghost" href={`tel:${f.phone.replace(/\s/g, '')}`}>Call facility</a>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="bg-mint rounded-2xl p-5 text-sm"><p className="font-semibold">Check before you travel</p>
            <p className="text-muted text-xs mt-1">Listings, distances and contacts are demo examples. For real disposal, verify the facility's current authorisation with the relevant State Pollution Control Board.</p></div>
          <div className="bg-mint rounded-2xl p-5 text-sm"><p className="font-semibold">Prefer a doorstep pickup?</p>
            <p className="text-muted text-xs mt-1">Add your device, review its AI guidance and request a verified collector from your account.</p></div>
          <Link to={signedIn ? '/citizen/items/new' : '/register'} className="btn block">{signedIn ? 'Add an item for pickup' : 'Create your account'}</Link>
        </div>
      </div>
    </div>
  );
}

export function PublicFacilities() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      <Link to="/" className="flex items-center gap-2 font-bold mb-8"><Recycle size={20} /> ReLoop</Link>
      <FacilitiesList />
    </div>
  );
}

export default function CitizenFacilities() { return <FacilitiesList signedIn />; }
