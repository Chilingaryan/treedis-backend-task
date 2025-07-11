import Busboy from "busboy";
import { createReadStream } from "fs";

import {
  getFileSize,
  saveToTempStream,
  generateTempFilePath,
} from "./upload.utils";
import { Req } from "@/core/types";
import { httpError } from "@/core/utils";
import type {
  ProcessUploadData,
  ProcessUploadOptions,
} from "./upload.interface";

export const processUpload = (
  req: Req,
  options?: ProcessUploadOptions,
): Promise<ProcessUploadData> => {
  const { allowedMimeTypes = [] } = options || {};

  const busboy = Busboy({ headers: req.headers });

  const uploadPromise = new Promise<ProcessUploadData>((resolve, reject) => {
    busboy.on("file", (name, fileStream, file) => {
      if (
        allowedMimeTypes.length &&
        !allowedMimeTypes.includes(file.mimeType)
      ) {
        fileStream.resume();
        return reject(
          httpError(`Unsupported file type: ${file.mimeType}`, 400),
        );
      }

      const { uploadId, finalKey, tmpFilePath } = generateTempFilePath(
        file.filename,
        options?.customFileName,
      );

      saveToTempStream(fileStream, tmpFilePath)
        .then(async () => {
          const contentLength = await getFileSize(tmpFilePath);
          const readStream = createReadStream(tmpFilePath);

          resolve({
            fileName: finalKey,
            mimeType: file.mimeType,
            readStream,
            contentLength,
            tmpFilePath, // keep for later deletion
            uploadId,
          });
        })
        .catch((err) => {
          reject(httpError("File processing failed", 500));
        });
    });

    busboy.on("error", console.log);
  });

  req.pipe(busboy);

  return uploadPromise;
};
