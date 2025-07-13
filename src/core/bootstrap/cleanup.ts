import path from "path";
import { readdir, stat, unlink } from "fs/promises";
import { getUploadTmpDir } from "@/modules/media/upload/upload.utils";

export const cleanupOldTmpFiles = async () => {
  const tmpUploads = getUploadTmpDir();
  const files = await readdir(tmpUploads);
  const now = Date.now();

  for (const file of files) {
    const fullPath = path.join(tmpUploads, file);
    const { birthtimeMs } = await stat(fullPath);
    if (now - birthtimeMs > 2 * 60 * 60 * 1000) {
      await unlink(fullPath);
    }
  }
};
