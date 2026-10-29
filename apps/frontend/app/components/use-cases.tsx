import React from "react";

const PerfectFor = [
  {
    title: "🎬 Creators",
    description: "Receive video testimonials or content from fans and collaborators securely.",
  },
  {
    title: "🎨 Freelancers",
    description: "Collect design files or assets from clients without messy email threads.",
  },
  {
    title: "🏢 Agencies",
    description: "Get files from clients without asking them to sign up or create accounts.",
  },
  {
    title: "📦 Beta Testers",
    description: "Let testers send bug screenshots, logs, or videos anonymously.",
  },
  {
    title: "🎤 Event Organizers",
    description: "Gather media submissions or speaker videos from contributors.",
  },
  {
    title: "👨‍💼 Recruiters",
    description: "Collect resumes and portfolios from candidates without asking for sign-ups.",
  },
];

function UseCases() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-12">Perfect For</h2>
        <div className="grid md:grid-cols-3 gap-6 text-left">
          {PerfectFor.map((item, idx) => (
            <div key={idx} className="p-6 border rounded-xl shadow-sm hover:shadow-md transition">
              <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default React.memo(UseCases);
