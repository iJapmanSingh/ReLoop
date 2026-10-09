import { Link } from "react-router-dom";
import Button from "../common/Button.jsx";

function LogoMark() {
  return (
    <span className="grid size-9 place-items-center rounded-xl bg-ink-900">
      <svg
        viewBox="0 0 24 24"
        className="size-5 text-teal-600"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 12a8 8 0 1 1-2.34-5.66" />
        <path d="M20 4v4h-4" />
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
        <Link to="/" className="flex items-center gap-2.5 rounded-lg">
          <LogoMark />
          <span className="text-lg font-semibold tracking-tight text-ink-900">ReLoop</span>
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