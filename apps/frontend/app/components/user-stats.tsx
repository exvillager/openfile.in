import React from "react";
import type { LinkItem } from "types/types";
import { filesize } from "filesize";
import { Link2, CheckCircle, Upload, HardDrive } from "lucide-react";
import { NBCard, NB_COLORS, type NBColor } from "./ui/neobrutal";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  color: NBColor;
}

function UserStats({
  links,
  storageUsed,
  linkCount,
}: {
  links: LinkItem[];
  storageUsed: number;
  storageUsedLoading: boolean;
  storageUsedError: Error | null;
  linkCount: number;
}) {
  const totalUploads = links.length ? links.reduce((sum, l) => sum + (l.uploadCount || 0), 0) : 0;
  const activeLinks = links
    ? links.filter((link) => {
        if (!link.expiresAt) return true;
        return new Date(link.expiresAt) > new Date();
      }).length
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        label="Total Links"
        value={linkCount ?? 0}
        icon={<Link2 size={15} strokeWidth={2.5} />}
        color="yellow"
      />
      <StatCard
        label="Active Links"
        value={activeLinks}
        icon={<CheckCircle size={15} strokeWidth={2.5} />}
        color="green"
      />
      <StatCard
        label="Total Uploads"
        value={totalUploads}
        icon={<Upload size={15} strokeWidth={2.5} />}
        color="pink"
      />
      <StatCard
        label="Storage Used"
        value={filesize(storageUsed || 0)}
        icon={<HardDrive size={15} strokeWidth={2.5} />}
        color="blue"
      />
    </div>
  );
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => (
  <NBCard color="white" shadow="sm" className="px-4 py-3.5">
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-extrabold text-black/60 uppercase tracking-wide">{label}</p>
      <div
        className="p-1.5 rounded-md border-2 border-black"
        style={{ backgroundColor: NB_COLORS[color] }}
      >
        {icon}
      </div>
    </div>
    <p className="text-2xl font-extrabold text-black">{value}</p>
  </NBCard>
);

export default React.memo(UserStats);
