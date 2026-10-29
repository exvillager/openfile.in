import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Copy, Check, Link2, Download, Shield } from "lucide-react";
import { downloadKeyFile } from "~/utils/dowload-key";
import { useCreateLinkMutation } from "~/service/api";
import Spinner from "~/components/spinner";
import { generateKeyAndIVWithWebCrypto } from "~/utils/encrypt-decrypt";
import { useAuth } from "~/zustand/store";
import { saveCryptoSecret } from "~/utils/crypto-store";
import { toast } from "sonner";
import { NBCard, nbButtonClass, nbInputClass, nbLabelClass } from "~/components/ui/neobrutal";

const createLinkSchema = z.object({
  maxUploads: z.number({ error: "Max uploads is required" }).min(1),
  allowedFileType: z.array(z.string()).optional(),
  expiresAt: z.string().datetime().optional(),
  name: z.string().optional(),
});

type CreateLinkData = z.infer<typeof createLinkSchema>;
type TimeUnit = "minutes" | "hours" | "days";

export default function CreateLinkPage() {
  const user = useAuth.getState().user;
  const userPlan = user?.subscription?.planName || "free";
  const maxUploadVal =
    userPlan === "free" ? 3 : userPlan === "pro" ? 5 : userPlan === "enterprise" ? 10 : 1;

  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [relativeTime, setRelativeTime] = useState<Record<string, string>>({
    value: "1",
    unit: "hours",
  });
  const [shouldDownloadKey, setShouldDownloadKey] = useState<boolean>(true);
  const [shouldExpireLinkAfterFirstUpload, setShouldExpireLinkAfterFirstUpload] =
    useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateLinkData>({
    resolver: zodResolver(createLinkSchema),
  });

  const {
    mutateAsync: createLink,
    isError: isCreateLinkError,
    error: createLinkError,
    isPending: isCreateLinkPending,
  } = useCreateLinkMutation();

  const handleCopy = () => {
    if (!uploadUrl) return;
    navigator.clipboard.writeText(uploadUrl);
    setCopied(true);
    toast("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = async (data: CreateLinkData) => {
    let expiresAt: string | undefined;
    if (relativeTime.value) {
      const now = new Date();
      const amount = parseInt(relativeTime.value);
      if (relativeTime.unit === "minutes") now.setMinutes(now.getMinutes() + amount);
      if (relativeTime.unit === "hours") now.setHours(now.getHours() + amount);
      if (relativeTime.unit === "days") now.setDate(now.getDate() + amount);
      expiresAt = now.toISOString();
    } else {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 10);
      expiresAt = now.toISOString();
    }

    const { iv, key: secretKey } = await generateKeyAndIVWithWebCrypto();
    const payload = {
      ...data,
      expiresAt,
      expireAfterFirstUpload: shouldExpireLinkAfterFirstUpload,
    };

    try {
      interface Result {
        uploadUrl?: string;
        token?: string;
      }
      const result: Result | void = await createLink({ payload, secretKey, iv });
      if (result) {
        const { token } = result;
        const fullLink = `${import.meta.env.VITE_UPLOAD_URL}?token=${token}#key=${secretKey}&iv=${iv}`;
        setUploadUrl(fullLink);
        toast("Secure link created");
        saveCryptoSecret(token!, { iv, key: secretKey });
        shouldDownloadKey && downloadKeyFile(fullLink, secretKey, iv);
      }
    } catch (err) {
      console.error("Failed to create link");
      toast.error("Failed to create link");
    }
  };

  return (
    <div className="min-h-screen text-black flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} strokeWidth={2.5} />
          <h1 className="text-lg font-extrabold text-black">Create Secure Link</h1>
        </div>
        <p className="text-black/60 text-sm font-medium">
          Generate an encrypted upload link to privately receive files.
        </p>
      </div>

      <div className="w-full max-w-lg space-y-4">
        <NBCard color="white" className="p-6 space-y-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className={nbLabelClass}>
                Link name <span className="text-black/40 normal-case font-medium">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Client project files"
                {...register("name")}
                className={nbInputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={nbLabelClass}>Max uploads</label>
                <input
                  type="number"
                  defaultValue={maxUploadVal}
                  {...register("maxUploads", { valueAsNumber: true })}
                  className={nbInputClass}
                />
                {errors.maxUploads && (
                  <p className="text-xs text-red-600 font-bold mt-1">{errors.maxUploads.message}</p>
                )}
              </div>

              <div>
                <label className={nbLabelClass}>Expires in</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    value={relativeTime.value}
                    onChange={(e) => setRelativeTime({ ...relativeTime, value: e.target.value })}
                    className={`w-16 ${nbInputClass} px-2`}
                  />
                  <select
                    value={relativeTime.unit}
                    onChange={(e) =>
                      setRelativeTime({ ...relativeTime, unit: e.target.value as TimeUnit })
                    }
                    className={`flex-1 ${nbInputClass} px-2`}
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className={nbLabelClass}>Options</label>

              <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg border-2 border-transparent hover:border-black hover:bg-[#FFF8E7] transition-colors">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={shouldDownloadKey}
                    onChange={(e) => setShouldDownloadKey(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-md border-2 border-black transition-colors flex items-center justify-center ${shouldDownloadKey ? "bg-[#FFD400]" : "bg-white"}`}
                  >
                    {shouldDownloadKey && (
                      <Check size={12} className="text-black" strokeWidth={3} />
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-black font-bold">Download encryption key file</span>
                  <p className="text-xs text-black/60 mt-0.5 font-medium">
                    Save the key/IV backup to your device
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg border-2 border-transparent hover:border-black hover:bg-[#FFF8E7] transition-colors">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={shouldExpireLinkAfterFirstUpload}
                    onChange={(e) => setShouldExpireLinkAfterFirstUpload(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-md border-2 border-black transition-colors flex items-center justify-center ${shouldExpireLinkAfterFirstUpload ? "bg-[#FFD400]" : "bg-white"}`}
                  >
                    {shouldExpireLinkAfterFirstUpload && (
                      <Check size={12} className="text-black" strokeWidth={3} />
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-black font-bold">Expire after first upload</span>
                  <p className="text-xs text-black/60 mt-0.5 font-medium">
                    Link becomes invalid after one use
                  </p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isCreateLinkPending}
              className={nbButtonClass({ color: "yellow", className: "w-full py-2.5 gap-2" })}
            >
              {isCreateLinkPending ? (
                <>
                  <Spinner size={15} color="black" /> Generating...
                </>
              ) : (
                <>
                  <Link2 size={15} /> Generate Link
                </>
              )}
            </button>
          </form>
        </NBCard>

        <NBCard color="white" className="p-5">
          <p className="text-xs font-extrabold text-black/60 uppercase tracking-wide mb-3">
            Generated Link
          </p>

          {isCreateLinkError && (
            <p className="text-red-600 text-sm font-bold mb-3">
              {createLinkError instanceof Error ? createLinkError.message : String(createLinkError)}
            </p>
          )}

          {uploadUrl ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#FFF8E7] border-2 border-black">
                <a
                  href={uploadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:text-black/70 break-all text-sm underline-offset-2 hover:underline flex-1 font-medium"
                >
                  {uploadUrl.length > 80 ? `${uploadUrl.substring(0, 80)}...` : uploadUrl}
                </a>
                <button
                  onClick={handleCopy}
                  className="flex-shrink-0 p-1.5 rounded-md bg-white border-2 border-black hover:bg-[#FFD400] transition-colors"
                  title="Copy link"
                >
                  {copied ? (
                    <Check size={14} className="text-green-600" />
                  ) : (
                    <Copy size={14} className="text-black" />
                  )}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={nbButtonClass({
                    color: "white",
                    size: "sm",
                    className: "flex-1 gap-2",
                  })}
                >
                  {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <button
                  onClick={() => downloadKeyFile(uploadUrl, "", "")}
                  className={nbButtonClass({ color: "white", size: "sm", className: "gap-2" })}
                >
                  <Download size={13} />
                  Key
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-lg border-2 border-dashed border-black/30 text-center">
              <Link2 size={18} className="text-black/30 mx-auto mb-2" />
              <p className="text-black/50 text-sm font-medium">
                Your generated link will appear here.
              </p>
            </div>
          )}
        </NBCard>
      </div>
    </div>
  );
}
