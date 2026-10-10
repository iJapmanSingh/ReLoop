import { Link } from 'react-router-dom';
import { Recycle, ShieldCheck, Laptop, Sparkles, Truck, MapPin, RefreshCw, Wrench, Route, Leaf, CheckCircle2, Smartphone, Monitor, Printer, Refrigerator, Plug } from 'lucide-react';

const Section = ({ bg = '', id, children }) => (
  <section id={id} className={bg}><div className="max-w-6xl mx-auto px-6 py-16">{children}</div></section>
);
const Eyebrow = ({ children }) => <p className="text-[10px] font-bold tracking-wider text-forest">{children}</p>;
const H2 = ({ children }) => <h2 className="text-3xl md:text-4xl font-semibold text-forest leading-tight mt-2">{children}</h2>;

const STATS = [['1,284 kg', 'e-waste diverted'], ['3,852 kg CO2e', 'estimated emissions saved'], ['428', 'items recycled']];
const STEPS = [
  [Laptop, 'Tell us about your device', 'Add its category, condition and approximate weight. A photo helps, but is optional.'],
  [Sparkles, 'Get a considered recommendation', 'AI guidance flags possible hazards and suggests Repair, Resell, Donate or Recycle.'],
  [Truck, 'Arrange a verified pickup', 'Choose an address and date. Follow every step from request to completed recycling.'],
];
const CARE = [
  [ShieldCheck, 'Handle with care', 'Know what not to open, crush or put in household waste.'],
  [Wrench, 'Reuse before recycling', 'A working device may have a repair, resale or donation path.'],
  [Route, 'Know where it goes', 'Verified collectors and a visible four-stage pickup record.'],
  [Leaf, 'See your contribution', 'Impact is added only after your item is marked RECYCLED.'],
];
const DEVICES = [[Smartphone, 'Phones & tablets'], [Laptop, 'Laptops & computers'], [Monitor, 'Monitors & TVs'], [Printer, 'Printers & peripherals'], [Refrigerator, 'Large appliances'], [Plug, 'Small electronics']];
const CITIES = [['Bengaluru', 'Indiranagar · 560038', 'Koramangala · Whitefield · Demo coverage'], ['Pune', 'Kothrud · 411038', 'Aundh · Baner · Demo coverage'], ['Hyderabad', 'Gachibowli · 500032', 'Madhapur · Kondapur · Demo coverage']];
const FAQ = [
  ['What happens to my data?', 'Back up files, sign out of accounts and erase personal data before handover. We do not provide a data-erasure certificate.'],
  ['Is AI advice a safety certificate?', 'No. It is guidance based on your item details. A trained collector or facility must confirm safe handling and the final route.'],
  ['Can I cancel a pickup?', 'Yes, only while it is REQUESTED. After acceptance, contact your assigned collector if you need help.'],
  ['When does my impact update?', 'Only after RECYCLED. Demo CO2e values are illustrative estimates, not audited measurements.'],
];

export default function Landing() {
  return (
    <div>
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <span className="flex items-center gap-2 font-bold"><Recycle size={20} /> ReLoop</span>
        <div className="flex items-center gap-6 text-sm">
          <a href="#how" className="hidden sm:block">How it works</a>
          <Link to="/facilities" className="hidden sm:block">Find a facility</Link>
          <Link to="/login">Log in</Link>
          <Link to="/register" className="btn">Get started</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-8 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="bg-mint text-forest text-[10px] font-bold tracking-wider rounded-full px-3 py-1">MADE FOR A MORE CIRCULAR INDIA</span>
          <h1 className="text-5xl md:text-6xl font-semibold text-forest leading-[1.05] mt-5">Old electronics.<br />New possibilities.</h1>
          <p className="text-muted mt-5 text-lg max-w-md">Don't let your next upgrade become someone else's hazard. Find a safer path for your devices—from repair to responsible recycling.</p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Link to="/register" className="btn">Give your device a next step</Link>
            <Link to="/facilities" className="btn btn-ghost">Find a nearby facility</Link>
          </div>
          <p className="flex items-center gap-2 text-xs text-muted mt-5"><ShieldCheck size={14} /> Verified collectors. Clear guidance. Tracked handovers.</p>
        </div>
        <div className="relative rounded-3xl overflow-hidden">
          <img src="/images/hero.jpg" alt="A citizen handing a laptop to a verified collector" className="w-full h-[360px] md:h-[400px] object-cover" />
          <div className="absolute left-4 bottom-4 bg-sand rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
            <RefreshCw size={20} className="text-forest" />
            <div><p className="font-semibold text-sm">Keep materials in the loop.</p><p className="text-xs text-muted">One safe handover at a time.</p></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12">
        <div className="border-y border-black/10 py-6 grid sm:grid-cols-4 gap-6 items-center">
          <div><p className="font-semibold text-sm">Small actions. Shared impact.</p><p className="text-[11px] text-muted">Demo community totals · not national statistics</p></div>
          {STATS.map(([v, l]) => <div key={l}><p className="text-2xl text-forest font-medium">{v}</p><p className="text-xs text-muted">{l}</p></div>)}
        </div>
      </div>

      <Section id="how">
        <Eyebrow>A CLEAR NEXT STEP</Eyebrow><H2>Less guesswork. More good.</H2>
        <p className="text-muted mt-2">From a forgotten drawer to a responsible destination, in three simple steps.</p>
        <div className="grid md:grid-cols-3 gap-5 mt-8">
          {STEPS.map(([Icon, t, d], i) => (
            <div key={t} className="card p-6"><div className="flex justify-between text-forest"><Icon size={22} strokeWidth={1.5} /><span className="text-xs text-muted">0{i + 1}</span></div>
              <h3 className="font-semibold text-lg mt-6">{t}</h3><p className="text-sm text-muted mt-2">{d}</p></div>
          ))}
        </div>
      </Section>

      <Section bg="bg-mint">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <Eyebrow>BETTER FOR PEOPLE & PLACES</Eyebrow><H2>Not just out of your home.<br />Out of harm's way.</H2>
            <p className="text-muted mt-4 max-w-md">Electronics can contain batteries and hazardous materials. A safer route protects households, workers and the places we share.</p>
            <span className="inline-block mt-4 bg-amber-soft text-amber-900 text-[10px] font-bold tracking-wider rounded px-2 py-1">GUIDANCE, NOT SAFETY CERTIFICATION</span>
          </div>
          <div className="space-y-5">
            {CARE.map(([Icon, t, d]) => (
              <div key={t} className="flex gap-3"><Icon size={20} className="text-forest mt-0.5 shrink-0" strokeWidth={1.5} />
                <div><p className="font-semibold text-sm">{t}</p><p className="text-xs text-muted">{d}</p></div></div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <Eyebrow>FROM POCKET TO PLUG</Eyebrow><H2>A place for every kind of device.</H2>
        <p className="text-muted mt-2">List one item at a time. Collection eligibility is confirmed before pickup.</p>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-8">
          {DEVICES.map(([Icon, t]) => <div key={t} className="card p-4 min-h-24"><Icon size={18} strokeWidth={1.5} /><p className="text-xs mt-5">{t}</p></div>)}
        </div>
      </Section>

      <Section>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <img src="/images/handover.jpg" alt="A verified collector sorting devices" className="rounded-3xl w-full h-72 object-cover" />
          <div>
            <Eyebrow>TRUST AT THE DOORSTEP</Eyebrow><H2>A real person.<br />A responsible handover.</H2>
            <p className="text-muted mt-4 text-sm">Your assigned collector's verified profile and demo contact details appear after acceptance. Never hand over a device to an unassigned person.</p>
            <ul className="mt-5 space-y-2 text-sm">
              {['Collector identity checked', 'Pickup recorded at every stage', 'Recycling completion visible in your account'].map((t) => (
                <li key={t} className="flex gap-2 items-center"><CheckCircle2 size={16} className="text-forest" />{t}</li>))}
            </ul>
            <p className="text-[11px] text-muted mt-4">Collectors: join the network through the Collector registration option.</p>
          </div>
        </div>
      </Section>

      <Section bg="bg-mint">
        <Eyebrow>LOCAL COLLECTION. SHARED PROGRESS.</Eyebrow><H2>Built for neighbourhoods across India.</H2>
        <p className="text-muted mt-2 text-sm">Demo service areas shown below. Search your six-digit pincode to check local facilities and pickup availability.</p>
        <div className="grid md:grid-cols-3 gap-5 mt-8">
          {CITIES.map(([c, a, b]) => (
            <div key={c} className="card p-5"><p className="flex items-center gap-2 font-semibold"><MapPin size={16} strokeWidth={1.5} />{c}</p>
              <p className="text-sm mt-3">{a}</p><p className="text-xs text-muted mt-1">{b}</p></div>))}
        </div>
        <Link to="/facilities" className="btn btn-ghost mt-6">Check your pincode</Link>
      </Section>

      <Section>
        <div className="grid md:grid-cols-3 gap-10">
          <div><Eyebrow>A LITTLE CLARITY</Eyebrow><H2>Before you<br />let it go.</H2>
            <p className="text-muted text-sm mt-3">Useful answers for a safer first pickup.</p>
            <a href="#" className="text-xs font-semibold text-forest mt-4 inline-block">Visit the help centre ↗</a></div>
          <div className="md:col-span-2">
            {FAQ.map(([q, a]) => <div key={q} className="py-4 border-b border-black/10"><p className="font-semibold text-sm">{q}</p><p className="text-xs text-muted mt-1">{a}</p></div>)}
          </div>
        </div>
      </Section>

      <section className="bg-forest text-white">
        <div className="max-w-6xl mx-auto px-6 py-14 flex flex-wrap items-center justify-between gap-6">
          <div><h2 className="text-3xl md:text-4xl font-semibold leading-tight">Your old device deserves<br />a better ending.</h2>
            <p className="text-white/70 text-sm mt-3">Start with one item. We'll help you find its next step.</p></div>
          <Link to="/register" className="bg-white text-forest font-semibold text-sm rounded-lg px-5 py-3">Create your citizen account</Link>
        </div>
      </section>
      <footer className="bg-forest-dark text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-wrap justify-between gap-4">
            <div><p className="flex items-center gap-2 font-semibold text-sm"><Recycle size={16} /> ReLoop</p><p className="text-xs text-white/60 mt-1">A better next chapter for your electronics.</p></div>
            <div className="flex gap-6 text-xs text-white/80"><a href="#how">How it works</a><Link to="/facilities">Find a facility</Link><Link to="/register">Collector sign-up</Link><a href="#">Help & safety</a></div>
          </div>
          <div className="flex flex-wrap justify-between gap-2 text-[11px] text-white/50 mt-6"><span>© 2026 ReLoop · India · Demo design, illustrative data</span><span>Privacy policy · Terms of service</span></div>
        </div>
      </footer>
    </div>
  );
}
