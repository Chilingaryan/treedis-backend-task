import http from "http";
import finalHandler from "finalhandler";

import { Router } from "@/router";
import { queryfy } from "../utils/utils";
import { applyCorsHeaders } from "./cors";
import { bullBoardApp } from "./queue-dashboard";

export const createHttpServer = (router: Router) => {
  return http.createServer((req, res) => {
    applyCorsHeaders(res);

    if (req.url?.startsWith("/admin/queues")) {
      return bullBoardApp(req, res, finalHandler(req, res));
    }

    return router.handle.bind(router)(queryfy(req), res);
  });
};
