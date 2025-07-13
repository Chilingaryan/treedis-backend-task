import os from "os";
import path from "path";
import { stat } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { pipeline } from "stream/promises";
import { createWriteStream, existsSync, mkdirSync } from "fs";

console.log(os.tmpdir());

export async function saveToTempStream(
  fileStream: NodeJS.ReadableStream,
  tmpFilePath: string,
): Promise<void> {
  await pipeline(fileStream, createWriteStream(tmpFilePath));
}

// Will cache the result in case if high frequency uploads are needed
export const getUploadTmpDir = () => {
  const uploadTmpDir = path.join(os.tmpdir(), "uploads");

  if (!existsSync(uploadTmpDir)) {
    mkdirSync(uploadTmpDir, { recursive: true });
  }

  return uploadTmpDir;
};

export const generateTempFilePath = (
  originalFilename?: string,
  customFileName?: string,
) => {
  const ext = originalFilename ? path.extname(originalFilename) : "";
  const uploadId = uuidv4();
  const finalKey = customFileName ?? `${uploadId}${ext}`;
  const tmpFilePath = path.join(getUploadTmpDir(), finalKey);
  return { uploadId, finalKey, tmpFilePath };
};

export const getFileSize = async (filePath: string) => {
  const stats = await stat(filePath);
  return stats.size;
};
