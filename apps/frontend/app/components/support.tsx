import React from "react";
import { Link } from "react-router";

export default function SupportPage() {
  return (
    <div className="w-full bg-yellow-500 text-black py-1 px-4 flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
      <span className="text-center">
        Support OpenFile – Your donation keeps this service free and alive.
      </span>
      <Link to="/support" className="underline font-semibold hover:text-yellow-800 transition">
        Donate Now →
      </Link>
    </div>
  );
}
