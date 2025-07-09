import { Worker } from "bullmq";
import IORedis from "ioredis";
// import { processUploadJob } from "./uploadJobHandler"; // your logic

const connection = new IORedis("redis://localhost:6379");

const worker = new Worker(
  "upload",
  async (job) => {
    console.log(job.data);
    // await processUploadJob(job.data); // stream to S3, scan, delete temp, etc.
  },
  { connection },
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});
