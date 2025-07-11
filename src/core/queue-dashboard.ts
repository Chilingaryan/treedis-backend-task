import { uploadQueue } from "@/services/queue/queue.service";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import connect from "connect";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(uploadQueue)],
  serverAdapter,
});

export const bullBoardApp = connect();
bullBoardApp.use("/admin/queues", serverAdapter.getRouter());
