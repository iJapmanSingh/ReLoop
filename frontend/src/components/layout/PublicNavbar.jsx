import { Link } from "react-router-dom";
import Button from "../common/Button.jsx";

function LogoMark() {
  return (
    <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 shadow-lg shadow-teal-900/20">
      <svg
        viewBox="0 0 40 40"
        className="size-7"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M29.5 13.5A12 12 0 1 0 31 24"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M25 8.5L31 13.5L24 17"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 25C14 18 21 16 27 16C26 23 22 29 14 29"
          fill="#BBF7D0"
        />
        <path
          d="M14 29L22 21"
          stroke="#047857"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#impact", label: "Impact" },
  { href: "#why-recycle", label: "Why recycle" },
];

export default function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
  to="/"
  aria-label="ReLoop home"
  className="group flex items-center gap-3 rounded-xl"
>
  <LogoMark />

  <span className="flex flex-col">
    <span className="text-xl font-extrabold tracking-tight text-ink-900">
      Re<span className="text-teal-600">Loop</span>
    </span>

    <span className="-mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-500">
      E-waste, reimagined
    </span>
  </span>
</Link>

        <ul className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="text-sm font-medium text-ink-700 hover:text-ink-900">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="md">Log in</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="md">Get started</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}