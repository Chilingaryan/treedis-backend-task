import { S3Client } from "@aws-sdk/client-s3";

const isProd = process.env.NODE_ENV === "production";

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error("Missing AWS credentials in environment variables");
}

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

const config = {
  region: process.env.AWS_REGION || "eu-north-1",
  credentials,
  forcePathStyle: !isProd,
  ...(isProd
    ? {}
    : {
        endpoint: process.env.MINIO_ENDPOINT,
      }),
};

export const s3 = new S3Client(config);
