import Header from "./header";
import Footer from "./footer";
import { NBCard } from "./ui/neobrutal";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#FFF8E7] text-black">
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-extrabold mb-2">Privacy Policy</h1>
        <p className="text-sm text-black/50 font-bold mb-10">Last Updated: July 18, 2025</p>

        <div className="space-y-6">
          <NBCard color="yellow" className="p-6">
            <h2 className="text-lg font-extrabold mb-3">🔒 What We Collect</h2>
            <ul className="list-disc list-inside space-y-1.5 text-black/80 font-medium text-sm">
              <li>Your name and email address (for account creation).</li>
              <li>Uploaded files (encrypted and auto-expired).</li>
            </ul>
            <p className="mt-4 text-black font-extrabold text-sm">We never sell your data.</p>
          </NBCard>

          <NBCard color="white" className="p-6">
            <h2 className="text-lg font-extrabold mb-3">📦 How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1.5 text-black/80 font-medium text-sm">
              <li>To enable secure file sharing.</li>
              <li>To send notifications for file activity or account updates.</li>
              <li>To detect abuse (spam, malware, etc.).</li>
              <li>To improve service based on anonymized usage.</li>
            </ul>
          </NBCard>

          <NBCard id="terms" color="pink" className="p-6">
            <h2 className="text-lg font-extrabold mb-3">📜 Terms of Service</h2>
            <ul className="list-disc list-inside space-y-1.5 text-black/80 font-medium text-sm">
              <li>Only share files you have the right to share.</li>
              <li>Do not use OpenFile for illegal or harmful purposes.</li>
              <li>We may suspend abusive users or links.</li>
            </ul>
          </NBCard>

          <NBCard id="security" color="blue" className="p-6">
            <h2 className="text-lg font-extrabold mb-3">🔐 Security</h2>
            <ul className="list-disc list-inside space-y-1.5 text-black/80 font-medium text-sm">
              <li>File gets encrypted during upload.</li>
              <li>
                We don't store your secret key and IV (it gets stored on your browser locally).
              </li>
              <li>Files are stored temporarily and deleted after expiry.</li>
              <li>Industry-standard practices ensure data safety.</li>
            </ul>
            <p className="mt-4 text-black font-extrabold text-sm">
              Your files = your privacy. Always.
            </p>
          </NBCard>

          <NBCard id="contact" color="green" className="p-6">
            <h2 className="text-lg font-extrabold mb-3">📬 Contact</h2>
            <p className="text-black/80 font-medium text-sm">
              If you have any questions, reach out to us at{" "}
              <a
                href="mailto:teamopenfile@gmail.com"
                className="underline underline-offset-2 font-extrabold"
              >
                teamopenfile@gmail.com
              </a>
              .
            </p>
          </NBCard>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
