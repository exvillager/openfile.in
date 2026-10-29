import { Github, Shield } from "lucide-react";
import React from "react";
import { Link } from "react-router";
import OpenfileLogo from "./openfile-logo";
import { nbBorderThin, nbPress, nbShadowSm, NBBadge } from "./ui/neobrutal";

const GITHUB_REPO_URL = "https://github.com/exvillager/openfile.in";

function Footer() {
  return (
    <footer className="border-t-[3px] border-black bg-[#FFF8E7] mt-8">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <OpenfileLogo />
              <span className="text-sm font-extrabold text-black">OpenFile</span>
            </Link>
            <p className="text-black/60 text-sm leading-relaxed max-w-xs mb-4 font-medium">
              Secure, zero-knowledge file receiving. Your files are encrypted before they leave the
              sender's device.
            </p>
            <a
              href="mailto:exvillagerbgs@gmail.com"
              className="text-sm text-black/60 hover:text-black transition-colors font-bold underline underline-offset-2"
            >
              exvillagerbgs@gmail.com
            </a>
          </div>

          <div>
            <h4 className="text-xs font-extrabold text-black uppercase tracking-widest mb-4">
              Product
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Features", href: "#features" },
                { label: "Security", href: "/privacy-policy/#security" },
                { label: "Dashboard", href: "/dashboard" },
              ].map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-black/70 hover:text-black font-medium transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-extrabold text-black uppercase tracking-widest mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Contact", href: "/privacy-policy/#contact" },
                { label: "Help Center", href: "/privacy-policy/" },
              ].map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-black/70 hover:text-black font-medium transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-black/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-black/60 font-bold">
            © {new Date().getFullYear()} OpenFile. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <NBBadge color="green" className="text-[11px]">
              <Shield className="w-3 h-3" strokeWidth={2.5} />
              End-to-end encrypted
            </NBBadge>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source on GitHub"
              className={`p-1.5 rounded-md bg-white ${nbBorderThin} ${nbShadowSm} ${nbPress}`}
            >
              <Github className="w-3.5 h-3.5" strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default React.memo(Footer);
