import { Settings } from "lucide-react";
import { NBCard } from "~/components/ui/neobrutal";

function SettingsPage() {
  return (
    <div className="min-h-screen text-black px-4 md:px-8 py-8 flex flex-col items-center justify-center">
      <NBCard color="white" className="p-10 max-w-sm text-center">
        <div className="w-12 h-12 rounded-xl bg-[#FFF8E7] border-2 border-black flex items-center justify-center mx-auto mb-4">
          <Settings size={20} />
        </div>
        <p className="text-black font-extrabold mb-1">Settings coming soon</p>
        <p className="text-black/60 text-sm font-medium">
          Account settings aren't available yet — check back later.
        </p>
      </NBCard>
    </div>
  );
}

export default SettingsPage;
