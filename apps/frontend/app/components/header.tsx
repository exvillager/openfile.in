import React, { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "~/zustand/store";
import OpenfileLogo from "./openfile-logo";
import { FiMenu, FiX } from "react-icons/fi";
import { Github } from "lucide-react";
import { nbBorderThin, nbButtonClass, nbPress, nbShadowSm } from "./ui/neobrutal";

const GITHUB_REPO_URL = "https://github.com/exvillager/openfile.in";

function Header() {
  const isLoggedIn = useAuth.getState()?.user?.username;
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "How it works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-black bg-[#FFF8E7]">
      <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <OpenfileLogo />
          <Link to={"/"} className="text-sm font-extrabold text-black">
            OpenFile
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-bold text-black/70 hover:text-black transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            className={`p-1.5 rounded-md bg-white ${nbBorderThin} ${nbShadowSm} ${nbPress}`}
          >
            <Github size={16} strokeWidth={2.5} />
          </a>
          {isLoggedIn ? (
            <Link to={"/dashboard"} className={nbButtonClass({ color: "yellow", size: "sm" })}>
              Dashboard
            </Link>
          ) : (
            <Link to={"/auth"} className={nbButtonClass({ color: "white", size: "sm" })}>
              Login
            </Link>
          )}
        </div>

        <button
          className={`md:hidden text-black rounded-md p-1.5 bg-white ${nbBorderThin} ${nbShadowSm}`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t-[3px] border-black bg-[#FFF8E7] px-6 py-4 flex flex-col gap-4">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-bold text-black/80 hover:text-black transition-colors py-1"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-bold text-black/80 hover:text-black transition-colors py-1"
            onClick={() => setMobileOpen(false)}
          >
            <Github size={16} strokeWidth={2.5} />
            GitHub
          </a>
          {isLoggedIn ? (
            <Link
              to={"/dashboard"}
              className={nbButtonClass({ color: "yellow", size: "sm", className: "text-center" })}
              onClick={() => setMobileOpen(false)}
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to={"/auth"}
              className={nbButtonClass({ color: "white", size: "sm", className: "text-center" })}
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

export default React.memo(Header);
