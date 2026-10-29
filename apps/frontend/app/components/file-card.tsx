import { Download, Eye, EyeOff, MoreVertical, Trash2 } from "lucide-react";
import { filesize } from "filesize";
import type { FileItem } from "types/types";
import { useEffect, useRef, useState } from "react";
import { decryptAndDownloadFileWithCrypto } from "~/utils/encrypt-decrypt";
import Spinner from "./spinner";
import PreviewFile, { isPreviewable } from "./preview-file";
import AlertMenu from "./alert-menu";
import { toast } from "sonner";
import { useDeleteFileFromLink } from "~/service/api";
import { NBCard, nbButtonClass } from "./ui/neobrutal";

type FileCardProps = {
  file: FileItem;
  token: string;
  iv: string;
  ivkey: string;
  linkId: string;
  onDeleted: () => void;
};

function getFileExt(name: string) {
  return name.split(".").pop()?.toUpperCase() ?? "FILE";
}

function getExtColor(ext: string): string {
  const images = ["JPG", "JPEG", "PNG", "GIF", "WEBP", "SVG", "AVIF"];
  const videos = ["MP4", "MOV", "AVI", "MKV", "WEBM"];
  const docs = ["PDF", "DOC", "DOCX", "TXT", "MD"];
  const code = ["JS", "TS", "TSX", "JSX", "PY", "GO", "RS", "JSON"];
  const archives = ["ZIP", "RAR", "TAR", "GZ", "7Z"];
  if (images.includes(ext)) return "bg-[#6EC1FF]";
  if (videos.includes(ext)) return "bg-[#FF6FA5]";
  if (docs.includes(ext)) return "bg-[#FFD400]";
  if (code.includes(ext)) return "bg-[#A3FF66]";
  if (archives.includes(ext)) return "bg-[#FFD400]";
  return "bg-[#FFF8E7]";
}

export function FileCard({ file, iv, ivkey, token, linkId, onDeleted }: FileCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [decryptedBlob, setDecryptedBlob] = useState<Blob | null>(null);
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const ext = getFileExt(file.name);

  const { mutateAsync: deleteFile, isPending: isDeleting } = useDeleteFileFromLink();

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleDelete = async () => {
    try {
      await deleteFile({ linkId, fileId: file.id });
      toast.success("File deleted");
      onDeleted();
    } catch (error) {
      console.error("File delete failed:", error);
      toast.error("Failed to delete file.");
    }
  };

  const handleDecrypt = async () => {
    if (decryptedBlob) return;
    if (iv === "undefined" || ivkey === "undefined") {
      toast.error("No Key/IV found — please add your backup Key/IV.");
      return;
    }
    setIsProcessing(true);
    try {
      const blob = await decryptAndDownloadFileWithCrypto(file, file.name, token, ivkey, iv);
      if (blob) {
        setDecryptedBlob(blob);
        setDecryptedUrl(URL.createObjectURL(blob));
      }
    } catch (error) {
      console.error("Decryption failed:", error);
      toast.error("Failed to decrypt file. Check your key/IV.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTogglePreview = async () => {
    if (showPreview) {
      setShowPreview(false);
    } else {
      setShowPreview(true);
      if (!decryptedBlob && isPreviewable(file.name)) await handleDecrypt();
    }
  };

  const handleDownload = async () => {
    if (decryptedBlob) {
      const link = document.createElement("a");
      link.href = decryptedUrl!;
      link.download = file.name;
      link.click();
      return;
    }
    if (iv === "undefined" || ivkey === "undefined") {
      toast.error("No Key/IV found — please add your backup Key/IV.");
      return;
    }
    setIsProcessing(true);
    try {
      const blob = await decryptAndDownloadFileWithCrypto(file, file.name, token, ivkey, iv);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Decryption for download failed:", error);
      toast.error("Failed to decrypt and download file.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <NBCard color="white" className="p-4 flex flex-col gap-3">
      {/* File info */}
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg border-2 border-black flex items-center justify-center flex-shrink-0 ${getExtColor(ext)}`}
        >
          <span className="text-[9px] font-extrabold font-mono text-black">{ext}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-black truncate" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs text-black/60 mt-0.5 font-medium">{filesize(file.size)}</p>
        </div>

        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            disabled={isDeleting}
            className="p-1.5 rounded-md border-2 border-black text-black hover:bg-[#FFF8E7] transition-colors disabled:opacity-40"
          >
            {isDeleting ? <Spinner size={13} color="black" /> : <MoreVertical size={16} />}
          </button>

          {menuOpen && (
            <NBCard
              color="white"
              shadow="sm"
              className="absolute right-0 top-full mt-1 w-36 z-10 overflow-hidden"
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} /> Delete
              </button>
            </NBCard>
          )}
        </div>
      </div>

      <AlertMenu
        trigger={null}
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        title="Delete File"
        description={`Are you sure you want to delete "${file.name}"? This cannot be undone.`}
      />

      {/* Preview */}
      {showPreview && (
        <div className="rounded-lg overflow-hidden border-2 border-black bg-[#FFF8E7]">
          <PreviewFile file={file} previewUrl={decryptedUrl} isLoading={isProcessing} />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={handleTogglePreview}
          disabled={isProcessing && !decryptedUrl}
          className={nbButtonClass({
            color: "white",
            size: "sm",
            className: "flex-1 gap-1.5 py-2 px-3",
          })}
        >
          {isProcessing && !decryptedUrl ? (
            <Spinner size={13} color="black" />
          ) : showPreview ? (
            <>
              <EyeOff size={13} /> Hide
            </>
          ) : (
            <>
              <Eye size={13} /> Preview
            </>
          )}
        </button>

        <button
          onClick={handleDownload}
          disabled={isProcessing}
          className={nbButtonClass({
            color: "yellow",
            size: "sm",
            className: "flex-1 gap-1.5 py-2 px-3",
          })}
        >
          {isProcessing ? (
            <Spinner size={13} color="black" />
          ) : (
            <>
              <Download size={13} /> Download
            </>
          )}
        </button>
      </div>
    </NBCard>
  );
}
