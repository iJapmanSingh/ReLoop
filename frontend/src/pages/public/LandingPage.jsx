import { Link } from "react-router-dom";
import Button from "../../components/common/Button.jsx";
import Card from "../../components/common/card.jsx";
import Badge from "../../components/common/Badge.jsx";

const steps = [
  { title: "Add your device", text: "Describe the item, its condition, and whether it holds personal data." },
  { title: "Get guidance", text: "Receive a suggestion to reuse, repair, or recycle based on what you told us." },
  { title: "Schedule a pickup", text: "Choose an address and time window. Your contact details stay masked until a collector accepts." },
  { title: "Track to recycling", text: "Follow every stage, from accepted to picked up to recycled." },
];

const trackingStages = ["Requested", "Accepted", "Picked up", "Recycled"];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 md:grid-cols-2 md:pt-24">
        <div className="flex flex-col gap-6">
          <Badge tone="teal">Responsible e-waste disposal</Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
            Give your old electronics a trackable, responsible end.
          </h1>
          <p className="text-lg leading-relaxed text-ink-700">
            ReLoop guides you from device condition to collection, and shows you what happened to your device at every step.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/register">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">Start a disposal request</Button>
            </Link>
            <a href="#how-it-works" className="inline-flex h-12 items-center justify-center rounded-xl px-6 text-sm font-medium text-ink-700 hover:bg-canvas">
              See how it works
            </a>
          </div>
        </div>

        {/* Sample tracker preview: clearly labelled as sample data */}
        <Card className="flex flex-col gap-5" aria-labelledby="preview-title">
          <div className="flex items-center justify-between">
            <h2 id="preview-title" className="text-base">Sample pickup</h2>
            <Badge tone="amber">Sample data</Badge>
          </div>
          <p className="text-sm text-ink-500">Pickup PK-2041 · Laptop · 2 kg</p>
          <ol className="flex flex-col gap-4">
            {trackingStages.map((stage, index) => (
              <li key={stage} className="flex items-center gap-3">
                <span
                  className={`grid size-7 place-items-center rounded-full text-xs font-semibold ${
                    index === 0 ? "bg-blue-700 text-white" : "bg-canvas text-ink-500 ring-1 ring-inset ring-line"
                  }`}
                >
                  {index + 1}
                </span>
                <span className={index === 0 ? "font-medium text-ink-900" : "text-ink-500"}>{stage}</span>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl sm:text-4xl">How ReLoop works</h2>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title}>
                <Card className="h-full">
                  <p className="text-sm font-semibold text-teal-700">Step {index + 1}</p>
                  <h3 className="mt-3 text-lg">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-700">{step.text}</p>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Impact: no invented numbers */}
      <section id="impact" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Card className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div>
              <h2 className="text-2xl sm:text-3xl">Impact is counted only after recycling</h2>
              <p className="mt-3 max-w-2xl text-ink-700">
                A device only adds to ReLoop's environmental totals once it reaches the RECYCLED stage. Until we connect verified
                platform data, this section shows no figures.
              </p>
            </div>
            <Badge tone="neutral">Awaiting verified data</Badge>
          </Card>
        </div>
      </section>

      {/* Why recycle */}
      <section id="why-recycle" className="scroll-mt-20 border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl sm:text-4xl">Why responsible disposal matters</h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-700">
            Electronics contain valuable materials such as copper, aluminium, and iron, and some components that need careful
            handling. Sending them to general waste loses materials and can release harmful substances. Recycling through
            a proper process recovers materials and reduces that risk.
          </p>
        </div>
      </section>

      
      {/* Final call to action */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <h2 className="text-3xl font-semibold text-ink-900 sm:text-4xl">
          Ready to clear out old electronics?
        </h2>

        <div className="mt-8 flex justify-center">
          <Link to="/register">
            <Button variant="dark" size="lg">
              Create a free account
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}