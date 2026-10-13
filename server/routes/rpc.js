import { Router } from "express";
import { config } from "../config.js";

// DEPLOYMENT_PLAN.md step 2a: read-only JSON-RPC proxy to Alchemy
export const rpcRouter = Router();

const ALLOWED_METHODS = new Set([
  "eth_chainId",
  "eth_blockNumber",
  "eth_getBalance",
  "eth_getTransactionCount",
  "eth_getCode",
  "eth_getTransactionByHash",
  "eth_getTransactionReceipt",
  "eth_call",
  "eth_estimateGas",
  "eth_gasPrice",
  "eth_feeHistory",
  "alchemy_getAssetTransfers"
]);


// req.body = { method: 'eth_chainId', params: [], id: 38, jsonrpc: '2.0' }
rpcRouter.post("/:network", async (req, res) => {
  const upstreamUrl = config.rpcUrls[req.params.network];
  if(!upstreamUrl) return res.status(404).json({ error: "Network Not found" });

  const payload = Array.isArray(req.body) ? req.body : [req.body];
  const containsNotAllowedMethods = payload.some(r => !ALLOWED_METHODS.has(r.method));
  if (containsNotAllowedMethods) return res.status(404).json({ error: "Method not supported" });

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),   // original body, ids untouched
    });
    res.status(upstream.status).json(await upstream.json());
  } catch {
    res.status(500).json({ error: "Ethereum network problem." });
  }
});
