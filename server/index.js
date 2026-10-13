import path from "node:path";
import express from "express";
import { config } from "./config.js";
import { rpcRouter } from "./routes/rpc.js";
import { faucetRouter } from "./routes/faucet.js";

const app = express();

// Behind Dokploy's Traefik, so req.ip is the real client IP, not the proxy's
app.set("trust proxy", 1);
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/rpc", rpcRouter);
app.use("/api/faucet", faucetRouter);

app.use("/api", (req, res) => res.status(404).json({ error: "not found" }));

// Built frontend + React Router fallback (step 2c)
app.use(express.static(config.staticDir));
app.get("/{*splat}", (req, res) => res.sendFile(path.join(config.staticDir, "index.html")));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "internal error" });
});

app.listen(config.port, () => {
  console.log(`server listening on http://localhost:${config.port}`);
});
