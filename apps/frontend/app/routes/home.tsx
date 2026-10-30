import { Link } from "react-router";
import Header from "~/components/header";
import Footer from "~/components/footer";
import { Lock } from "lucide-react";
import { NBBadge, NBCard, nbButtonClass } from "~/components/ui/neobrutal";

const features = [
  {
    title: "Client-side Encryption",
    desc: "Files encrypt in the sender's browser using AES-256 before upload. The key never touches our servers.",
    color: "yellow" as const,
  },
  {
    title: "Zero-Knowledge",
    desc: "The encryption key lives only in the link URL fragment — never sent to our server. We're structurally unable to read your files.",
    color: "pink" as const,
  },
  {
    title: "No Signup for Senders",
    desc: "Anyone can upload to your link — no account, no tracking, no friction.",
    color: "blue" as const,
  },
  {
    title: "You Control the Key",
    desc: "Set expiry, max upload count, or one-time use. Download the key file as a backup anytime.",
    color: "green" as const,
  },
  {
    title: "Instant Dashboard",
    desc: "All received files appear in your dashboard. Preview or download — decrypted locally in your browser.",
    color: "yellow" as const,
  },
  {
    title: "Simple Sharing",
    desc: "One link, shareable anywhere. Works in any browser with no plugins required.",
    color: "pink" as const,
  },
];

const steps = [
  {
    num: "01",
    title: "Create a link",
    desc: "Generate a private encrypted upload link from your dashboard in seconds.",
  },
  {
    num: "02",
    title: "Share it",
    desc: "Send the link to anyone. They open it in their browser — no account needed.",
  },
  {
    num: "03",
    title: "Receive securely",
    desc: "Files encrypt in their browser before upload. Only you can decrypt and download.",
  },
];

export default function App() {
  return (
    <div className="min-h-screen text-black bg-[#FFF8E7]">
      <Header />
      <main>
        {/* Hero */}
        <section className="px-6 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="max-w-2xl mx-auto text-center">
            <NBBadge color="white" className="mb-6 uppercase tracking-wide">
              <Lock size={12} strokeWidth={3} />
              Zero-Knowledge Encryption
            </NBBadge>
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] mb-5">
              Receive files privately.
            </h1>
            <p className="text-black/70 text-lg mb-8 leading-relaxed max-w-lg mx-auto font-medium">
              Create an encrypted upload link. Share it. Anyone can send you files — encrypted in
              their browser before they leave their device.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard" className={nbButtonClass({ color: "yellow" })}>
                Get Started Free
              </Link>
              <a href="#how-it-works" className={nbButtonClass({ color: "white" })}>
                How it works
              </a>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-6 py-16 border-t-[3px] border-black">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-extrabold text-black mb-8">Why OpenFile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {features.map((f) => (
                <NBCard key={f.title} color={f.color} className="p-5">
                  <h3 className="text-sm font-extrabold text-black mb-1.5">{f.title}</h3>
                  <p className="text-black/75 text-sm leading-relaxed font-medium">{f.desc}</p>
                </NBCard>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="px-6 py-16 border-t-[3px] border-black">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-extrabold text-black mb-8">How it works</h2>
            <ol className="space-y-5">
              {steps.map((s) => (
                <NBCard key={s.num} as="li" color="white" className="p-5 flex gap-5 items-start">
                  <span className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-[#FFD400] border-2 border-black rounded-md text-sm font-extrabold">
                    {s.num}
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-black mb-1">{s.title}</h3>
                    <p className="text-black/70 text-sm leading-relaxed font-medium">{s.desc}</p>
                  </div>
                </NBCard>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
