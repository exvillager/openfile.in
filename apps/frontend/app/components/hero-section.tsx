import React from "react";
import { motion } from "framer-motion";
import bg from "public/bg2.png";
import { Link } from "react-router";

function HeroSection() {
  return (
    <section className="py-16 px-4 bg-[#0f0f16]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <img
            src={bg}
            alt="File Upload"
            className="w-full max-h-[450px] object-cover rounded-md"
          />
        </div>
        <div className="text-left">
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold mb-4 text-white"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Private & Anonymous
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-gray-400 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            OpenFile lets you receive files without sharing personal details. No sign-up needed for
            senders.
          </motion.p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/dashboard"
              className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200"
            >
              Get Started
            </Link>
            <a
              href="#how"
              className="px-6 py-3 text-white border border-gray-400 rounded-lg hover:bg-gray-800"
            >
              How it works?
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default React.memo(HeroSection);
