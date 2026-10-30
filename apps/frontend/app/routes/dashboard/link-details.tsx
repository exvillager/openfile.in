import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import { useUserFilesQuery } from "~/service/api";
import type { FileItem } from "types/types";
import { FileCard } from "~/components/file-card";
import Spinner from "~/components/spinner";
import { toast } from "sonner";
import { ArrowLeft, Key, AlertTriangle, Files } from "lucide-react";
import { NBCard, nbButtonClass, nbInputClass } from "~/components/ui/neobrutal";

function LinkPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { id } = useParams();
  const navigate = useNavigate();

  const [key, setKey] = useState("");
  const [iv, setIv] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [showKeyIvInput, setShowKeyIvInput] = useState(false);

  const page = 1;
  const limit = 50;

  const { data, isError, error, isLoading, refetch } = useUserFilesQuery(
    id ?? "",
    token,
    page,
    limit,
  );
  const files = data?.data;

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const hashKey = hashParams.get("key");
    const hashIv = hashParams.get("iv");
    if (hashKey && hashIv) {
      setKey(hashKey);
      setIv(hashIv);
    }
  }, []);

  if (isLoading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner size={28} color="black" />
      </div>
    );

  if (isError)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <p className="text-red-600 font-bold">{error.message}</p>
        </div>
      </div>
    );

  const handleKeyIvInput = () => {
    try {
      const parsed = JSON.parse(inputValue.trim());
      if (parsed.key && parsed.iv) {
        setKey(parsed.key);
        setIv(parsed.iv);
        toast.success("Key and IV set successfully!");
        setShowKeyIvInput(false);
        setInputValue("");
      } else {
        toast.error("Key or IV missing in input");
      }
    } catch (e) {
      toast.error("Invalid JSON format. Please ensure the input is valid.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto min-h-screen text-black px-4 py-6">
      {/* Back + Key button row */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-bold text-black/70 hover:text-black transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          onClick={() => setShowKeyIvInput(!showKeyIvInput)}
          className={nbButtonClass({ color: "white", size: "sm", className: "gap-2" })}
        >
          <Key size={14} />
          {showKeyIvInput ? "Cancel" : "Add Backup Key/IV"}
        </button>
      </div>

      {/* Decrypt warning */}
      <NBCard color="yellow" className="flex items-start gap-2.5 p-4 mb-6 max-w-3xl">
        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
        <p className="text-sm text-black font-medium">
          When you click <strong className="font-extrabold">Decrypt</strong>, the file is downloaded
          and decrypted in your browser. This may take time depending on file size. Do not close or
          refresh the tab during decryption.
        </p>
      </NBCard>

      {/* Key/IV input panel */}
      {showKeyIvInput && (
        <NBCard color="white" className="mb-6 p-5">
          <p className="text-sm text-black/70 mb-3 font-bold">
            Paste your backup JSON (with key and iv):
          </p>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            rows={3}
            className={`${nbInputClass} font-mono resize-none`}
            placeholder={`{"key":"...","iv":"..."}`}
            autoFocus
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleKeyIvInput}
              className={nbButtonClass({ color: "yellow", size: "sm" })}
            >
              Set Key/IV
            </button>
            <button
              onClick={() => setShowKeyIvInput(false)}
              className={nbButtonClass({ color: "white", size: "sm" })}
            >
              Cancel
            </button>
          </div>
        </NBCard>
      )}

      {/* File grid */}
      {files?.length > 0 ? (
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {files.map((file: FileItem) => (
              <FileCard
                key={file.id}
                file={file}
                iv={iv}
                token={token}
                ivkey={key}
                linkId={id ?? ""}
                onDeleted={refetch}
              />
            ))}
          </div>
        </div>
      ) : (
        <NBCard
          color="white"
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#FFF8E7] border-2 border-black flex items-center justify-center mb-4">
            <Files size={22} />
          </div>
          <p className="text-black font-extrabold mb-1">No files uploaded yet</p>
          <p className="text-black/60 text-sm font-medium">
            Share the upload link to receive encrypted files.
          </p>
        </NBCard>
      )}
    </div>
  );
}

export default LinkPage;
