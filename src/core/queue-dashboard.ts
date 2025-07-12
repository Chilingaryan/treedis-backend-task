import connect from "connect";
import { createBullBoard } from "@bull-board/api";
import { ExpressAdapter } from "@bull-board/express";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";

import { uploadQueue } from "@/services/queue/queue.service";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(uploadQueue)],
  serverAdapter,
});

export const bullBoardApp = connect();
bullBoardApp.use("/admin/queues", serverAdapter.getRouter());
