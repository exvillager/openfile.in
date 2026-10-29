export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function getFileExt(name: string) {
  return name.split(".").pop()?.toUpperCase() ?? "FILE";
}

export function getExtStyle(ext: string): string {
  if (["JPG", "JPEG", "PNG", "GIF", "WEBP", "HEIC"].includes(ext)) return "bg-blue-500/20";
  if (["MP4", "MOV", "AVI", "MKV", "WEBM"].includes(ext)) return "bg-pink-500/20";
  if (["PDF", "DOC", "DOCX", "TXT", "MD"].includes(ext)) return "bg-orange-500/20";
  if (["JS", "TS", "TSX", "JSX", "PY", "GO", "JSON"].includes(ext)) return "bg-green-500/20";
  if (["ZIP", "RAR", "TAR", "GZ"].includes(ext)) return "bg-yellow-500/20";
  return "bg-zinc-700";
}

export function isImage(ext: string) {
  return ["JPG", "JPEG", "PNG", "GIF", "WEBP", "HEIC"].includes(ext);
}

export function isVideo(ext: string) {
  return ["MP4", "MOV", "AVI", "MKV", "WEBM"].includes(ext);
}
