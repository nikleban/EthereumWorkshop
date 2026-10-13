import { Router } from "express";
import { getAddress, isAddress, JsonRpcProvider, Wallet } from "ethers";
import { config } from "../config.js";
import { createCooldown, createGlobalCap } from "../rateLimit.js";

// DEPLOYMENT_PLAN.md: sends a small amount of Sepolia ETH from the server-side faucet wallet
export const faucetRouter = Router();

const HOUR = 60 * 60 * 1000;

const provider = new JsonRpcProvider(config.rpcUrls.sepolia, config.faucet.chainId, { staticNetwork: true });
const wallet = new Wallet(config.faucet.privateKey, provider);

// Each send costs ~21000 gas, far more than the payout, so the global cap is
// what actually protects the faucet balance from spam.
const perAddress = createCooldown(24 * HOUR);
const perIp = createCooldown(24 * HOUR);
const allClaims = createGlobalCap(50, HOUR);

// One send at a time, so concurrent requests don't pick the same nonce
let sendQueue = Promise.resolve();
const sendInOrder = (tx) => {
  const sent = sendQueue.then(() => wallet.sendTransaction(tx));
  sendQueue = sent.catch(() => {}); // a failed send must not block the next one
  return sent;
};

faucetRouter.post("/", async (req, res) => {
  const { address } = req.body ?? {};
  if (!isAddress(address)) return res.status(400).json({ error: "Address is not valid" });

  const to = getAddress(address);
  const limits = [
    [perAddress, to],
    [perIp, req.ip],
    [allClaims, null],
  ];

  const wait = Math.max(...limits.map(([limit, key]) => limit.retryAfter(key)));
  if (wait > 0) {
    res.set("Retry-After", String(wait));
    return res.status(429).json({ error: `Too many requests, try again in ${wait}s` });
  }

  // Reserve before the await, otherwise parallel requests all pass the check above
  limits.forEach(([limit, key]) => limit.reserve(key));

  try {
    const tx = await sendInOrder({ to, value: config.faucet.amountWei });
    res.json({ hash: tx.hash });
  } catch (error) {
    limits.forEach(([limit, key]) => limit.release(key));
    console.error("faucet send failed:", error);
    res.status(500).json({ error: "Could not send transaction" });
  }
});
