import http from "node:http";
import next from "next";

const port = Number(process.env.PORT || 3000);
const hostname = process.env.HOSTNAME || "0.0.0.0";
const app = next({ dev: false, dir: process.cwd() });
const handle = app.getRequestHandler();

await app.prepare();

const server = http.createServer((req, res) => {
  handle(req, res);
});

server.listen(port, hostname, () => {
  console.log(`Server siap di http://localhost:${port}`);
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
