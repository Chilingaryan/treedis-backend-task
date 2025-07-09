import {
  GetObjectCommand,
  HeadObjectCommand,
  S3ServiceException,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { Upload } from "@aws-sdk/lib-storage";

import { s3 } from "@/config/aws.config";
import { httpError } from "@/core/utils";
import { IFileStorageService } from "./file-storage.interface";

const Bucket = process.env.AWS_S3_BUCKET;

const s3ErrorMessages = {
  NoSuchKey: "File not found",
  NoSuchBucket: "Bucket doesn’t exist",
  AccessDenied: "Access denied",
  InvalidObjectState: "Invalid file",
};

export class S3Service implements IFileStorageService {
  async upload(
    key: string,
    body: Buffer | Readable,
    contentType: string,
    contentLength: number,
  ) {
    try {
      const parallelUpload = new Upload({
        client: s3,
        params: {
          Bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          ContentLength: contentLength,
        },
      });

      // parallelUpload.on("httpUploadProgress", (progress) => {
      //   console.log(progress);
      // });

      await parallelUpload.done();

      return { success: true };
    } catch (err) {
      throw httpError(err);
    }
  }

  async get(key: string) {
    try {
      const command = new GetObjectCommand({ Bucket, Key: key });
      const response = await s3.send(command);
      return response.Body as Readable;
    } catch (err) {
      const error = err as S3ServiceException;
      const name = error.name as keyof typeof s3ErrorMessages;

      if (name in s3ErrorMessages) {
        throw httpError(s3ErrorMessages[name], 404);
      }

      throw httpError(err);
    }
  }

  async delete(key: string) {
    try {
      const command = new DeleteObjectCommand({ Bucket, Key: key });
      await s3.send(command);
      return { success: true };
    } catch (err) {
      throw err;
    }
  }

  async getMetadata(key: string) {
    try {
      const command = new HeadObjectCommand({ Bucket, Key: key });
      return await s3.send(command);
    } catch (e) {
      throw httpError("No metadata found", 404);
    }
  }
}
