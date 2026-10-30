import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import type { LinkItem } from "types/types";
import { formatDistanceToNow, isBefore } from "date-fns";
import AlertMenu from "./alert-menu";
import { useDeleteLink } from "~/service/api";
import { getCryptoSecret } from "~/utils/crypto-store";
import { toast } from "sonner";
import { Copy, ExternalLink, RefreshCw, Link2, Plus, Trash2 } from "lucide-react";
import { NBCard, nbButtonClass } from "./ui/neobrutal";

function UserLinks({ links, handleRefresh }: { links: LinkItem[]; handleRefresh: () => void }) {
  const [spinning, setSpinning] = useState<boolean>(false);
  const [secretsMap, setSecretsMap] = useState<Record<string, { key: string; iv: string }>>({});

  const navigate = useNavigate();

  const handleCopyLink = (linkToCopy: string) => {
    navigator.clipboard.writeText(linkToCopy);
    toast("Copied to clipboard");
  };

  const route = (linkId: string, token: string, secret: { key: string; iv: string }) => {
    navigate(`/dashboard/link/${linkId}?token=${token}#key=${secret?.key}&iv=${secret?.iv}`);
  };

  const { mutateAsync: deleteLink } = useDeleteLink();
  const handleLinkDelete = async (id: string) => {
    await deleteLink(id);
    toast("Link deleted");
    handleRefresh();
  };

  const handleRefreshLink = async () => {
    setSpinning(true);
    try {
      handleRefresh();
    } catch (error: any) {
      console.error("Refresh failed", error?.message);
    } finally {
      setTimeout(() => setSpinning(false), 300);
    }
  };

  useEffect(() => {
    const loadSecrets = async () => {
      const newSecrets: Record<string, { key: string; iv: string }> = {};
      for (const link of links) {
        const secret = await getCryptoSecret(link.token);
        if (secret) newSecrets[link.token] = secret;
      }
      setSecretsMap(newSecrets);
    };
    loadSecrets();
  }, []);

  if (links.length === 0) {
    return (
      <NBCard color="white" className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#FFF8E7] border-2 border-black flex items-center justify-center mb-4">
          <Link2 size={20} />
        </div>
        <p className="text-black font-extrabold mb-1">No links yet</p>
        <p className="text-black/60 text-sm mb-6 font-medium">
          Create your first secure upload link to get started.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className={nbButtonClass({ color: "yellow", size: "sm", className: "gap-2" })}
        >
          <Plus size={14} />
          Create Link
        </button>
      </NBCard>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-extrabold text-black">Your Links</h2>
        <button
          onClick={handleRefreshLink}
          className="flex items-center gap-1.5 text-xs font-bold text-black/60 hover:text-black transition-colors px-2 py-1 rounded-lg hover:bg-white border-2 border-transparent hover:border-black"
        >
          <RefreshCw
            size={12}
            className={`transition-transform duration-500 ${spinning ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      <NBCard color="white" className="overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-[3px] border-black bg-[#FFF8E7]">
              <th className="px-4 py-3 text-left text-xs font-extrabold text-black/70 uppercase tracking-wide">
                Link
              </th>
              <th className="px-4 py-3 text-left text-xs font-extrabold text-black/70 uppercase tracking-wide">
                Uploads
              </th>
              <th className="px-4 py-3 text-left text-xs font-extrabold text-black/70 uppercase tracking-wide hidden sm:table-cell">
                Expires
              </th>
              <th className="px-4 py-3 text-right text-xs font-extrabold text-black/70 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black/10">
            {links.map((link: LinkItem) => {
              const secret = secretsMap[link.token];
              const fullLink = `${import.meta.env.VITE_UPLOAD_URL}?token=${link.token}#key=${secret?.key}&iv=${secret?.iv}`;
              const isExpired = link.expiresAt && isBefore(new Date(link.expiresAt), new Date());
              const expiryText = link.expiresAt
                ? isExpired
                  ? `Expired ${formatDistanceToNow(new Date(link.expiresAt))} ago`
                  : `in ${formatDistanceToNow(new Date(link.expiresAt))}`
                : "Never";

              return (
                <tr key={link.id} className="hover:bg-[#FFF8E7] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => route(link.id, link.token, secret)}
                        className="text-sm text-black hover:text-black/70 transition-colors font-bold truncate max-w-[160px] sm:max-w-[240px] text-left"
                        title={link.name || fullLink}
                      >
                        {link.name || `Link #${link.id}`}
                      </button>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleCopyLink(fullLink)}
                          className="p-1 rounded text-black/50 hover:text-black transition-colors"
                          title="Copy link"
                        >
                          <Copy size={12} />
                        </button>
                        <Link
                          to={fullLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded text-black/50 hover:text-black transition-colors"
                          title="Open link"
                        >
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-black font-bold">{link.uploadCount}</span>
                      <span className="text-black/50 text-xs font-bold">
                        / {link.maxUploads === 0 ? "∞" : link.maxUploads}
                      </span>
                      {link.maxUploads > 0 && (
                        <div className="hidden sm:block w-16 h-2 bg-white border border-black/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#FFD400] rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (link.uploadCount / link.maxUploads) * 100)}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span
                      className={`text-xs font-bold ${
                        isExpired
                          ? "text-red-600"
                          : link.expiresAt
                            ? "text-black/70"
                            : "text-black/40"
                      }`}
                    >
                      {expiryText}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <AlertMenu
                      onConfirm={() => handleLinkDelete(link.id)}
                      trigger={
                        <button className="p-1.5 rounded-md border-2 border-black bg-white hover:bg-red-100 transition-colors">
                          <Trash2 size={13} className="text-red-600" />
                        </button>
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </NBCard>
    </div>
  );
}

export default React.memo(UserLinks);
