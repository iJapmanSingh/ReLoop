import { Link } from 'react-router-dom';
import { Recycle, Check } from 'lucide-react';

export default function AuthShell({ children }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2 gap-8 p-4 md:p-8 max-w-6xl mx-auto">
      <div className="hidden md:flex flex-col justify-between bg-forest text-white rounded-3xl p-10">
        <Link to="/" className="flex items-center gap-2 font-bold"><Recycle size={20} /> ReLoop</Link>
        <div>
          <h2 className="text-4xl font-semibold leading-tight">The next chapter<br />starts with you.</h2>
          <p className="mt-4 text-white/70">Keep devices in circulation. Keep hazardous materials out of everyday waste.</p>
          <ul className="mt-6 space-y-2 text-sm">
            {['Guidance for safer decisions', 'Verified doorstep collection', 'A visible record of your impact'].map((t) => (
              <li key={t} className="flex gap-2 items-center"><Check size={16} /> {t}</li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/50">For citizens and verified collectors across India.</p>
      </div>
      <div className="flex flex-col justify-center">{children}</div>
    </div>
  );
}
