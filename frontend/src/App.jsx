
import { Routes, Route, Link } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout.jsx";
import LandingPage from "./pages/public/LandingPage.jsx";

function NotFound() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold text-ink-900">
        Page not found
      </h1>

      <p className="text-ink-700">
        The page you're looking for doesn't exist yet.
      </p>

      <Link
        to="/"
        className="text-sm font-medium text-teal-700 underline underline-offset-4"
      >
        Back to home
      </Link>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}