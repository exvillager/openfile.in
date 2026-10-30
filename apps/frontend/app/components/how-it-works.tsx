import React from "react";

const howItWorksArr = [
  {
    title: "1. Sign Up (Optional)",
    description: "Create an account to manage links and get full access to the dashboard.",
  },
  {
    title: "2. Create a Link",
    description: "Configure your link with limits on file size, types, and upload count.",
  },
  {
    title: "3. Share the Link",
    description: "Send the link to anyone. They don’t need an account to upload files.",
  },
  {
    title: "4. Receive Files",
    description: "View and manage uploads directly from your dashboard securely.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="py-24 px-4 bg-[#0f0f16] text-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6 text-left">
          {howItWorksArr.map((item, idx) => (
            <div
              key={idx}
              className="p-6 bg-[#282840] border border-[#2a2a2a] rounded-xl hover:shadow-lg transition"
            >
              <h4 className="text-xl font-semibold mb-2 text-white">{item.title}</h4>
              <p className="text-gray-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default React.memo(HowItWorks);
