import type { FileItem } from "types/types";

export const fileExtentsion = (file: FileItem) => {
  return file.name.split(".").pop();
};
