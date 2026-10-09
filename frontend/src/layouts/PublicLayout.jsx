
import { Outlet } from "react-router-dom";
import PublicNavbar from "../components/layout/PublicNavbar.jsx";
import Footer from "../components/layout/Footer.jsx";

export default function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:shadow-soft"
      >
        Skip to content
      </a>

      <PublicNavbar />

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}