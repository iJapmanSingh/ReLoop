export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-ink-500 sm:px-6 md:flex-row md:items-center md:justify-between">
        <p className="font-medium text-ink-900">ReLoop</p>
        <p>
          E-waste pickup and responsible recycling. Prototype for the Environmental Hacks hackathon.
          Sample records are labelled as demo data.
        </p>
      </div>
    </footer>
  );
}