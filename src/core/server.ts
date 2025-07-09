import http from "http";

import { Router } from "@/router";
import { queryfy } from "./utils";

export const runServer = (router: Router, port: number) => {
  const server = http.createServer((req, res) => {
    return router.handle.bind(router)(queryfy(req), res);
  });

  server.listen(port, () => console.log(`Server listens to port: ${port}`));

  return server;
};
