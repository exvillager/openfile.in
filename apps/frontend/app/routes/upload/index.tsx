import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router";
import Header from "~/components/header";
import {
  getUploadUrl,
  useUpdateS3UploadDB,
  useUploadS3Mutation,
  useValidateTokenQuery,
} from "~/service/api";
import { useAuth } from "~/zustand/store";
import Spinner from "~/components/spinner";
import { useUploadStatusStore } from "~/zustand/upload-status-store";
import { Upload, X, Lock, AlertTriangle } from "lucide-react";
import { GLOBAL_BG } from "constant";
import { SelectedFilesList } from "~/components/selected-file";
import { encryptFileWithWorker, getHashParams } from "./upload.util";
import { filesize } from "filesize";
import { NBBadge, NBCard, nbButtonClass } from "~/components/ui/neobrutal";

const MAX_FREE_USER_UPLOAD_MB = import.meta.env.VITE_MAX_FREE_USER_UPLOAD_MB ?? 200 as number;

type UploadMode = "sequential" | "parallel";

function UploadPage() {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { iv, key } = getHashParams(window.location.hash);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [uploadMode, setUploadMode] = useState<UploadMode>("sequential");

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const user = useAuth.getState().user;
  const isFreeUser = user?.subscription?.planName === "free";

  const { handleSubmit, formState: { errors }, reset } = useForm();

  const files = selectedFiles;

  const {
    isError: isTokenInvalid,
    isLoading: isTokenValidating,
    error: tokenValidationError,
  } = useValidateTokenQuery(token || "");

  const { mutateAsync: uploadFilesMutation, isPending: isUploading } = useUploadS3Mutation();
  const { mutateAsync: UpdateDbS3 } = useUpdateS3UploadDB();
  const { addFile, updateStatus, setError } = useUploadStatusStore.getState();
  const fileStatusList = useUploadStatusStore((state) => state.uploads);

  const addFiles = (newFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  useEffect(() => {
    if (!files || files.length === 0) { setTotalSize(0); return; }
    let size = 0;
    const existingStatus = useUploadStatusStore.getState().uploads;
    selectedFiles.forEach((file) => {
      size += file.size;
      const existingFile = existingStatus.find((f) => f.name === file.name);
      if (!existingFile) {
        addFile({ id: file.name, name: file.name, progress: 0, status: "pending" });
      }
    });
    setTotalSize(size);
  }, [selectedFiles]);

  const processUploads = async () => {
    setIsProcessing(true);
    setErrorMessage("");
    if (!files || files.length === 0) { setErrorMessage("Please select at least one file."); return; }
    if (!key || !iv) { setErrorMessage("Missing encryption key or IV."); setIsProcessing(false); return; }
    const maxTotalSize = isFreeUser ? MAX_FREE_USER_UPLOAD_MB * 1024 * 1024 : Infinity;
    if (totalSize > maxTotalSize) {
      setErrorMessage(`Total size exceeds the ${MAX_FREE_USER_UPLOAD_MB}MB limit. Your total: ${(totalSize / 1024 / 1024).toFixed(2)}MB.`);
      setIsProcessing(false);
      return;
    }
    if (uploadMode === "sequential") { await handleSequentialUpload(); }
    else { await handleParallelUpload(); }
    setIsProcessing(false);
  };

  const uploadSingleFile = async (file: File) => {
    const status = fileStatusList.find((f) => f.name === file.name);
    if (status?.status === "done") return;
    try {
      const mimeType = file.type || 'application/octet-stream';
      // Encrypt first: the upload URL is signed for the exact ciphertext size.
      const encryptedBlob = await encryptFileWithWorker(file, key, iv);
      const { url, key: s3Key } = await getUploadUrl(mimeType, token, encryptedBlob.size);
      await uploadFilesMutation({ encryptFile: encryptedBlob, type: mimeType, url, name: file.name });
      await UpdateDbS3({ s3Key, size: encryptedBlob.size, token, filename: file.name });
      updateStatus(file.name, "done");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setError(file.name, message ?? "error while uploading this file");
      throw error;
    }
  };

  const handleSequentialUpload = async () => {
    for (const file of files) {
      try { await uploadSingleFile(file); } catch (error) { console.error(`Failed to upload ${file.name}:`, error); }
    }
  };

  const handleParallelUpload = async () => {
    const uploadPromises = files.map(file => uploadSingleFile(file).catch(e => e));
    await Promise.all(uploadPromises);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) addFiles(dropped);
  };

  if (!token)
    return (
      <div className={`h-screen w-full flex items-center justify-center ${GLOBAL_BG}`}>
        <NBCard color="white" className="p-8 text-center max-w-sm">
          <AlertTriangle className="w-10 h-10 text-red-600 mx-auto mb-4" strokeWidth={2} />
          <p className="text-black font-extrabold">Invalid or missing link.</p>
          <p className="text-black/60 text-sm mt-1 font-medium">Please check your URL and try again.</p>
        </NBCard>
      </div>
    );

  if (isTokenValidating)
    return (
      <div className={`h-screen w-full flex items-center justify-center ${GLOBAL_BG}`}>
        <Spinner size={24} color="black" />
      </div>
    );

  if (isTokenInvalid)
    return (
      <div className={`h-screen w-full flex items-center justify-center ${GLOBAL_BG}`}>
        <NBCard color="white" className="p-8 text-center max-w-sm">
          <AlertTriangle className="w-10 h-10 text-red-600 mx-auto mb-4" strokeWidth={2} />
          <p className="text-black font-extrabold">{tokenValidationError.message ?? "This link has expired or is invalid."}</p>
        </NBCard>
      </div>
    );

  return (
    <div className={`text-black min-h-screen ${GLOBAL_BG}`}>
      <Header />

      <div className="max-w-xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <NBBadge color="green" className="mb-4">
            <Lock size={12} strokeWidth={3} />
            End-to-end encrypted upload
          </NBBadge>
          <h1 className="text-2xl font-extrabold text-black">Upload Files</h1>
          <p className="text-black/60 text-sm mt-1 font-medium">Files are encrypted in your browser before uploading.</p>
        </div>

        <form onSubmit={handleSubmit(processUploads)} className="space-y-4">
          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative cursor-pointer rounded-xl border-[3px] border-dashed p-10 text-center transition-all duration-200 ${
              isDragging
                ? 'border-black bg-[#FFD400]/30'
                : 'border-black bg-white hover:bg-[#FFF8E7]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files ? Array.from(e.target.files) : [])}
            />
            <div className={`w-14 h-14 rounded-xl border-2 border-black flex items-center justify-center mx-auto mb-4 transition-colors ${
              isDragging ? 'bg-[#FFD400]' : 'bg-[#FFF8E7]'
            }`}>
              <Upload size={22} className="text-black" strokeWidth={2.5} />
            </div>
            <p className="text-black font-extrabold mb-1">
              {isDragging ? 'Drop files here' : 'Drag files here or click to browse'}
            </p>
            <p className="text-black/60 text-sm font-medium">Any file type supported</p>
            {isFreeUser && (
              <p className="text-black/50 text-xs mt-2 font-bold">Max {MAX_FREE_USER_UPLOAD_MB}MB total</p>
            )}
          </div>

          {/* Upload mode toggle */}
          <NBCard color="white" shadow="sm" className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm text-black font-extrabold">Upload Mode</p>
              <p className="text-xs text-black/60 mt-0.5 font-medium">
                {uploadMode === 'sequential' ? 'Files upload one at a time' : 'All files upload simultaneously'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold ${uploadMode === 'sequential' ? 'text-black' : 'text-black/40'}`}>Sequential</span>
              <button
                type="button"
                onClick={() => setUploadMode(prev => prev === 'sequential' ? 'parallel' : 'sequential')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full border-2 border-black transition-colors duration-200 ${
                  uploadMode === 'parallel' ? 'bg-[#FFD400]' : 'bg-white'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black transition-transform duration-200 ${
                  uploadMode === 'parallel' ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
              <span className={`text-xs font-bold ${uploadMode === 'parallel' ? 'text-black' : 'text-black/40'}`}>Parallel</span>
            </div>
          </NBCard>

          {errorMessage && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-100 border-2 border-red-600 text-red-700 text-sm font-bold">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading || !files?.length || isProcessing}
            className={nbButtonClass({ color: 'yellow', className: 'w-full py-3 gap-2' })}
          >
            {isProcessing ? (
              <><Spinner size={16} color="black" /> Encrypting & Uploading...</>
            ) : (
              <><Upload size={16} /> Upload {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''}` : 'Files'}</>
            )}
          </button>
        </form>

        {/* Selected Files */}
        {files.length > 0 && (
          <NBCard color="white" className="mt-6 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b-[3px] border-black">
              <div>
                <h2 className="text-black text-sm font-extrabold">{files.length} file{files.length > 1 ? 's' : ''} selected</h2>
                <p className="text-black/60 text-xs mt-0.5 font-medium">Total: {filesize(totalSize)}</p>
              </div>
              <button
                onClick={() => { setSelectedFiles([]); reset(); }}
                className="text-black/60 hover:text-black transition-colors p-1.5 rounded-md border-2 border-black bg-white hover:bg-[#FFF8E7]"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 max-h-72 overflow-auto space-y-2">
              <SelectedFilesList files={files} />
            </div>
          </NBCard>
        )}
      </div>
    </div>
  );
}

export default UploadPage;
