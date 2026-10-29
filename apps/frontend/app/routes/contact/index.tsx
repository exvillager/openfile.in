import { Mail, Shield } from "lucide-react";
import Header from "~/components/header";
import Footer from "~/components/footer";
import { NBCard } from "~/components/ui/neobrutal";

function ContactPage() {
  return (
    <div className="min-h-screen text-black bg-[#FFF8E7]">
      <Header />
      <main className="px-6 py-20 md:py-28">
        <div className="max-w-xl mx-auto text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-5">Get in touch</h1>
          <p className="text-black/70 text-lg leading-relaxed font-medium">
            Questions, feedback, or something broken? We read every email.
          </p>
        </div>

        <div className="max-w-xl mx-auto space-y-5">
          <NBCard color="yellow" className="p-6 flex items-center gap-4">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white border-2 border-black rounded-md">
              <Mail size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold mb-0.5">Email us</h2>
              <a
                href="mailto:exvillagerbgs@gmail.com"
                className="text-sm text-black/80 hover:text-black underline underline-offset-2 font-bold"
              >
                exvillagerbgs@gmail.com
              </a>
            </div>
          </NBCard>
          <NBCard color="blue" className="p-6 flex items-center gap-4">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white border-2 border-black rounded-md">
              <Shield size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold mb-0.5">Security concerns</h2>
              <p className="text-sm text-black/75 font-medium">
                Found a vulnerability? Email us directly — we take security reports seriously.
              </p>
            </div>
          </NBCard>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ContactPage;
