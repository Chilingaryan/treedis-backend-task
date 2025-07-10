import os from "os";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { pipeline } from "stream/promises";
import fs, { createWriteStream } from "fs";

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
  const finalKey = customFileName ?? uuidv4() + ext;
  const tmpFilePath = path.join(os.tmpdir(), finalKey);
  return { finalKey, tmpFilePath };
};

export const getFileSize = (filePath: string) => {
  return fs.statSync(filePath).size;
};
