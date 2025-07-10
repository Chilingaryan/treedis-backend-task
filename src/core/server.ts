import http from "http";

import { Router } from "@/router";
import { queryfy } from "./utils";

export const runServer = (router: Router, port: number) => {
  const server = http.createServer((req, res) => {
    // Todo: Testing reasons only
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS",
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    return router.handle.bind(router)(queryfy(req), res);
  });

  server.listen(port, () => console.log(`Server listens to port: ${port}`));

  return server;
};
