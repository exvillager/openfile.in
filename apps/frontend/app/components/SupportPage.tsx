import React from "react";
import { NBCard, nbButtonClass } from "./ui/neobrutal";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#FFF8E7] text-black flex items-center justify-center px-4 py-16">
      <NBCard color="white" shadow="lg" className="max-w-xl w-full text-center p-8 space-y-6">
        <h1 className="text-4xl font-extrabold">Support OpenFile</h1>
        <p className="text-black/70 font-medium">
          Your support helps keep OpenFile fast, free, and open. If you'd like to show appreciation,
          consider donating below.
        </p>

        {/* Buy Me a Coffee */}
        <a
          href="https://buymeacoffee.com/pradeepsahu"
          target="_blank"
          rel="noopener noreferrer"
          className={nbButtonClass({ color: "yellow" })}
        >
          ☕ Buy Me a Coffee
        </a>

        <p className="text-sm text-black/60 font-medium">or choose a custom amount:</p>

        {/* Donation Options */}
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="https://checkout.dodopayments.com/buy/pdt_r0o4sFbrxAyIfY58BLPaK?quantity=1&redirect_url=https://openfile-one.vercel.app%2F"
            target="_blank"
            rel="noopener noreferrer"
            className={nbButtonClass({ color: "blue", size: "sm" })}
          >
            Click to donate a custom amount on Dodo Payments
          </a>
        </div>

        <p className="text-xs text-black/50 font-bold">
          Thank you for supporting independent open-source work
        </p>
      </NBCard>
    </div>
  );
}
