import { useUploadStatusStore } from "~/zustand/upload-status-store";
import { filesize } from "filesize";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { NBCard } from "./ui/neobrutal";

function getFileExt(name: string) {
  return name.split(".").pop()?.toUpperCase() ?? "FILE";
}

export function SelectedFilesList({ files }: { files: File[] | undefined }) {
  const fileStatusList = useUploadStatusStore((state) => state.uploads);
  const errors = useUploadStatusStore((state) => state.errors);

  if (!files || files.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {files.map((file) => {
        const status = fileStatusList.find((f) => f.name === file.name);
        const isDone = status?.status === "done";
        const isError = status?.status === "error";
        const isUploading = status?.status === "uploading";

        return (
          <NBCard key={file.name} color="white" shadow="sm" className="flex items-center gap-3 p-3">
            {/* Ext badge */}
            <div className="w-10 h-10 rounded-md bg-[#FFF8E7] border-2 border-black flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-extrabold text-black font-mono">
                {getFileExt(file.name)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-black font-bold truncate">{file.name}</p>
              <p className="text-xs text-black/60 font-medium">{filesize(file.size)}</p>

              {status && (
                <div className="mt-1.5">
                  <div className="w-full bg-black/10 h-2 rounded-full overflow-hidden border border-black/20">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isError ? "bg-red-500" : isDone ? "bg-[#A3FF66]" : "bg-[#FFD400]"
                      }`}
                      style={{ width: isDone ? "100%" : `${status.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {errors?.[file.name] && (
                <p className="text-xs text-red-600 font-bold mt-1">{errors[file.name]}</p>
              )}
            </div>

            {/* Status icon */}
            {status && (
              <div className="flex-shrink-0">
                {isDone && <CheckCircle size={18} className="text-green-600" />}
                {isError && <XCircle size={18} className="text-red-600" />}
                {isUploading && <Loader size={18} className="text-black animate-spin" />}
              </div>
            )}
          </NBCard>
        );
      })}
    </div>
  );
}
