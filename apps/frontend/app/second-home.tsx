import React from "react";
import { FaLock, FaUserSecret, FaShareAlt, FaUpload } from "react-icons/fa";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 shadow-md bg-slate-800/70 backdrop-blur">
        <h1 className="text-2xl font-bold text-white tracking-tight">OpenFile</h1>
        <nav className="space-x-4 text-sm font-medium">
          <a href="#features" className="hover:text-blue-400">
            Features
          </a>
          <a href="#how" className="hover:text-blue-400">
            How it Works
          </a>
          <a href="#get-started" className="hover:text-blue-400">
            Get Started
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center px-6 py-20">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
          Share Secure Upload Links, Not Your Privacy.
        </h2>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-slate-300">
          OpenFile lets you generate a secure, one-time upload link so others can send files{" "}
          <strong>only you</strong> can access — end-to-end encrypted, privacy-first, zero-trust.
        </p>
        <a
          href="/dashboard"
          className="inline-block px-6 py-3 text-lg font-semibold bg-blue-600 rounded-xl hover:bg-blue-700 transition"
        >
          Get Started
        </a>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-800 py-16 px-6">
        <h3 className="text-3xl font-bold text-center mb-12">Why OpenFile?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <FaLock className="mx-auto text-blue-500 text-3xl mb-3" />
            <h4 className="font-semibold text-lg mb-2">Zero-Knowledge</h4>
            <p className="text-slate-300 text-sm">
              Only you hold the decryption key. Even we can't read your files.
            </p>
          </div>
          <div>
            <FaUserSecret className="mx-auto text-blue-500 text-3xl mb-3" />
            <h4 className="font-semibold text-lg mb-2">Private Upload Links</h4>
            <p className="text-slate-300 text-sm">
              Create links that expire or allow one-time use, securely.
            </p>
          </div>
          <div>
            <FaShareAlt className="mx-auto text-blue-500 text-3xl mb-3" />
            <h4 className="font-semibold text-lg mb-2">Controlled Sharing</h4>
            <p className="text-slate-300 text-sm">
              Others can upload, but can’t view or download what they sent.
            </p>
          </div>
          <div>
            <FaUpload className="mx-auto text-blue-500 text-3xl mb-3" />
            <h4 className="font-semibold text-lg mb-2">Simple & Secure</h4>
            <p className="text-slate-300 text-sm">
              No signup needed to upload. Files go directly to your dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="py-20 px-6 text-center">
        <h3 className="text-3xl font-bold mb-10">How It Works</h3>
        <ol className="space-y-6 text-slate-300 max-w-2xl mx-auto text-left text-lg">
          <li>
            1. <strong>Create</strong> an account and generate an upload link.
          </li>
          <li>
            2. <strong>Send</strong> the link to the person who needs to send you files.
          </li>
          <li>
            3. <strong>They Upload</strong> the files — encrypted and protected.
          </li>
          <li>
            4. <strong>You Receive</strong> the files in your private dashboard. Only you can
            decrypt.
          </li>
        </ol>
      </section>

      {/* Call to Action */}
      <section id="get-started" className="bg-blue-700 py-16 text-center">
        <h3 className="text-3xl font-bold mb-4 text-white">Start Receiving Private Files Now</h3>
        <p className="mb-6 text-white/90">
          Sign up and start generating secure upload links in seconds.
        </p>
        <a
          href="/register"
          className="inline-block px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-slate-100 transition"
        >
          Create Account
        </a>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-slate-400 text-sm bg-slate-900 border-t border-slate-700">
        &copy; {new Date().getFullYear()} OpenFile — Built for privacy.
      </footer>
    </div>
  );
}
