import Header from "~/components/header";
import Footer from "~/components/footer";
import { NBCard } from "~/components/ui/neobrutal";

export default function About() {
  return (
    <div className="min-h-screen text-black bg-[#FFF8E7]">
      <Header />
      <main className="px-6 py-20 md:py-28">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-5">
            About OpenFile
          </h1>
          <p className="text-black/70 text-lg leading-relaxed font-medium">
            OpenFile is a zero-knowledge file receiving tool. We built it because sharing a link
            shouldn't mean handing your files to a server that can read them.
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-5">
          <NBCard color="yellow" className="p-6">
            <h2 className="text-sm font-extrabold mb-1.5">Why we built this</h2>
            <p className="text-black/75 text-sm leading-relaxed font-medium">
              Most "send me a file" tools store your uploads in plaintext on someone else's server.
              OpenFile encrypts every file in the sender's browser before it ever leaves their
              device — we're structurally unable to read what gets uploaded.
            </p>
          </NBCard>
          <NBCard color="pink" className="p-6">
            <h2 className="text-sm font-extrabold mb-1.5">Who it's for</h2>
            <p className="text-black/75 text-sm leading-relaxed font-medium">
              Anyone who needs to receive files privately — from freelancers collecting client
              assets to teams accepting sensitive documents, without asking senders to sign up for
              anything.
            </p>
          </NBCard>
          <NBCard color="blue" className="p-6">
            <h2 className="text-sm font-extrabold mb-1.5">Get in touch</h2>
            <p className="text-black/75 text-sm leading-relaxed font-medium">
              Questions, feedback, or bug reports — reach us at{" "}
              <a
                href="mailto:exvillagerbgs@gmail.com"
                className="underline underline-offset-2 font-extrabold"
              >
                exvillagerbgs@gmail.com
              </a>
              .
            </p>
          </NBCard>
        </div>
      </main>
      <Footer />
    </div>
  );
}
