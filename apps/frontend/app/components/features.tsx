import React from "react";

function Features() {
  return (
    <section className="py-20 px-4 bg-[#0f0f16] text-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-12">Why OpenFile?</h2>
        <div className="grid md:grid-cols-2 gap-6 text-left">
          <div className="p-6 bg-[#292942] border border-[#333] rounded-xl shadow hover:shadow-lg transition">
            <h4 className="text-xl font-semibold mb-2">🔐 Private</h4>
            <p className="text-gray-400">Your uploads are secure and only accessible by you.</p>
          </div>
          <div className="p-6 bg-[#292942] border border-[#333] rounded-xl shadow hover:shadow-lg transition">
            <h4 className="text-xl font-semibold mb-2">🌐 Anonymous</h4>
            <p className="text-gray-400">
              Share files without revealing identity. No account required for uploaders.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default React.memo(Features);
