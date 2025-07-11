import os from "os";
import path from "path";
import { stat } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";

console.log(os.tmpdir());

export async function saveToTempStream(
  fileStream: NodeJS.ReadableStream,
  tmpFilePath: string,
): Promise<void> {
  await pipeline(fileStream, createWriteStream(tmpFilePath));
}

export const generateTempFilePath = (
  originalFilename?: string,
  customFileName?: string,
) => {
  const ext = originalFilename ? path.extname(originalFilename) : "";
  const uploadId = uuidv4();
  const finalKey = customFileName ?? uploadId + ext;
  const tmpFilePath = path.join(os.tmpdir(), finalKey);
  return { uploadId, finalKey, tmpFilePath };
};

export const getFileSize = async (filePath: string) => {
  const stats = await stat(filePath);
  return stats.size;
};
