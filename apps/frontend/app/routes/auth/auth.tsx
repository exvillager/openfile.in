import { useState } from "react";
import { Shield, Lock, Zap } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router";
import { GLOBAL_BG } from "constant";
import OpenfileLogo from "~/components/openfile-logo";
import { signup, login } from "~/service/api";
import { NBCard, nbButtonClass } from "~/components/ui/neobrutal";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await signup(username, password);
      } else {
        await login(username, password);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${GLOBAL_BG} min-h-screen flex items-center justify-center px-4 py-12`}>
      <NBCard
        color="white"
        shadow="lg"
        className="w-full max-w-3xl overflow-hidden grid md:grid-cols-2 rounded-xl"
      >
        {/* Left — Branding */}
        <div className="hidden md:flex flex-col justify-between bg-[#FFD400] p-10 border-r-[3px] border-black">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-10">
              <OpenfileLogo />
              <span className="text-base font-extrabold text-black">OpenFile</span>
            </Link>

            <h2 className="text-2xl font-extrabold text-black mb-3 leading-snug">
              Receive files
              <br />
              privately & securely.
            </h2>
            <p className="text-black/75 text-sm mb-10 leading-relaxed font-medium">
              Create encrypted upload links and let anyone send you files — no account needed for
              senders.
            </p>

            <div className="space-y-4">
              {[
                {
                  icon: <Shield size={14} strokeWidth={2.5} />,
                  text: "Client-side encryption — we never see your files",
                },
                { icon: <Lock size={14} strokeWidth={2.5} />, text: "Zero-knowledge architecture" },
                { icon: <Zap size={14} strokeWidth={2.5} />, text: "No signup needed for senders" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-black font-bold">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white border-2 border-black rounded-md">
                    {item.icon}
                  </span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-black/60 font-bold mt-10">
            © {new Date().getFullYear()} OpenFile
          </p>
        </div>

        {/* Right — Login / Signup */}
        <div className="bg-white p-10 flex flex-col justify-center">
          <Link to="/" className="flex items-center gap-2 mb-8 md:hidden">
            <OpenfileLogo />
            <span className="text-base font-extrabold text-black">OpenFile</span>
          </Link>

          <div className="flex rounded-lg overflow-hidden border-[3px] border-black mb-8">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`flex-1 py-2 text-sm font-extrabold transition-colors ${mode === "login" ? "bg-[#FFD400] text-black" : "bg-white text-black/50 hover:text-black"}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              className={`flex-1 py-2 text-sm font-extrabold border-l-[3px] border-black transition-colors ${mode === "signup" ? "bg-[#FFD400] text-black" : "bg-white text-black/50 hover:text-black"}`}
            >
              Sign up
            </button>
          </div>

          <h3 className="text-xl font-extrabold text-black mb-1">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h3>
          <p className="text-black/60 text-sm mb-8 font-medium">
            {mode === "login"
              ? "Sign in with your username to continue."
              : "Choose a username and password to get started."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-black/70 mb-1.5 font-extrabold uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="your_username"
                className="w-full bg-white border-[3px] border-black rounded-lg px-4 py-2.5 text-sm text-black placeholder-black/30 font-medium focus:outline-none focus:bg-[#FFF8E7] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-black/70 mb-1.5 font-extrabold uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                placeholder="••••••••"
                className="w-full bg-white border-[3px] border-black rounded-lg px-4 py-2.5 text-sm text-black placeholder-black/30 font-medium focus:outline-none focus:bg-[#FFF8E7] transition-colors"
              />
            </div>

            {error && <p className="text-red-600 text-xs font-bold">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={nbButtonClass({ color: "yellow", className: "w-full py-2.5" })}
            >
              {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="text-center text-xs text-black/60 font-medium mt-6">
            By signing in you agree to our{" "}
            <Link
              to="/privacy-policy"
              className="text-black hover:text-black/70 underline font-bold"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </NBCard>
    </div>
  );
}
