import fs from "fs";
import os from "os";
import path from "path";
import Busboy from "busboy";
import { v4 as uuidv4 } from "uuid";

import { Req } from "@/core/types";
import { httpError } from "@/core/utils";
import { S3Service as s3 } from "@/services/s3.service";
import { hasFile, isAllowedMimeType, saveToTemp } from "./media.utils";

export class MediaService {
  async getMedia(file?: string) {
    if (hasFile(file)) {
      const stream = await s3.get(file!);
      return stream;
    }
  }

  async getMetadata(file?: string) {
    if (hasFile(file)) {
      const metadata = await s3.getMetadata(file!);

      if (!metadata) {
        throw httpError("No metadata found", 404);
      }

      return metadata;
    }
  }

  async updateMedia(req: Req) {
    if (!req.query.file) {
      throw httpError("Missing file key", 400);
    }

    return this.processFileUpload(req, req.query.file);
  }

  async uploadMedia(req: Req) {
    return this.processFileUpload(req);
  }

  private async processFileUpload(req: Req, fileName?: string) {
    const busboy = Busboy({ headers: req.headers });

    const uploadPromise = new Promise((resolve, reject) => {
      busboy.on("file", async (name, fileStream, file) => {
        try {
          const result = await this.handleFileUpload(
            fileStream,
            file,
            fileName
          );
          resolve(result);
        } catch (err) {
          reject(httpError("File processing failed", 500));
        }
      });

      busboy.on("error", () => reject(httpError("Upload error", 500)));
    });

    req.pipe(busboy);
    return uploadPromise;
  }

  private async handleFileUpload(
    fileStream: NodeJS.ReadableStream,
    file: Busboy.FileInfo,
    fileName?: string
  ) {
    if (!isAllowedMimeType(file.mimeType)) {
      throw httpError(`Unsupported file type: ${file.mimeType}`, 400);
    }

    const ext = path.extname(file.filename);
    const finalKey = fileName ?? uuidv4() + ext;
    const tmpFilePath = path.join(os.tmpdir(), finalKey);

    await saveToTemp(fileStream, tmpFilePath);

    const contentLength = fs.statSync(tmpFilePath).size;
    const readStream = fs.createReadStream(tmpFilePath);

    await s3.upload(finalKey, readStream, file.mimeType, contentLength);

    fs.unlinkSync(tmpFilePath);

    return {
      message: fileName ? "Replaced!" : "Uploaded!",
      fileName: finalKey,
    };
  }

  async deleteMedia(file?: string) {
    if (hasFile(file)) {
      return await s3.delete(file!);
    }
  }
}
