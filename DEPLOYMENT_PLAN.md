# Deployment plan: safe public demo

## Goal
Publish the workshop app on my own server (Dokploy + docker compose) **without any secret reaching the browser**.

- **Mainnet**: read-only (balance, tx count, contract check) through Alchemy
- **Sepolia**: reads plus a rate-limited "send me test ETH" faucet, signed on the server
- **Local Anvil**: available only in development, never in the deployed build

**Why:** anything prefixed with `VITE_` is compiled into the JS bundle and visible in devtools. Keys must live only on a server.

---

## Step 1: Target architecture
```
Browser ──> https://eth.yourdomain/            (static React build)
        └─> https://eth.yourdomain/api/...     (Node server: holds secrets)
                     ├─ /api/rpc/:network   → Alchemy (mainnet|sepolia), read-only allowlist
                     └─ /api/faucet         → signs Sepolia tx with FAUCET_PRIVATE_KEY
```
- **One container** (`server`) serves the built frontend **and** `/api`. Same origin means no CORS and only one Dokploy domain/Traefik route.
- Server env vars **without** the `VITE_` prefix (Vite never exposes those):
  `ALCHEMY_MAINNET_URL`, `ALCHEMY_SEPOLIA_URL`, `FAUCET_PRIVATE_KEY`, `FAUCET_AMOUNT_WEI`, `ETHERSCAN_KEY` (for the future `api.js`).
- In Dokploy, set them in the app's Environment tab. Never in the repo.

- [ ] Decide on the server framework (Express or Hono)
- [ ] Decide on the env var names and add them to `client/.env.example` (names only)

---

## Step 2: Server (`server/` folder, new)

### 2a. RPC proxy: `POST /api/rpc/:network`
- `network` must be `mainnet` or `sepolia`; reject anything else (400).
- **Method allowlist**: `eth_chainId`, `eth_blockNumber`, `eth_getBalance`, `eth_getTransactionCount`, `eth_getCode`, `eth_getTransactionByHash`, `eth_getTransactionReceipt`, `eth_call`, `eth_estimateGas`, `eth_gasPrice`, `eth_feeHistory`.
  Anything else gets a JSON-RPC error back. `eth_sendRawTransaction` is **never** proxied.
- Forward the body to the Alchemy URL with `fetch` and return the response.
- Hint: ethers sends **batched** requests (a JSON array). Either handle both an object and an array and check every item's method, or turn off batching on the client (see 3b).
- Add a simple per-IP rate limit so nobody can burn your Alchemy compute units.

### 2b. Faucet: `POST /api/faucet` body `{ address }`
- Validate it with `ethers.isAddress`.
- Build the wallet on the server:
  `new Wallet(FAUCET_PRIVATE_KEY, new JsonRpcProvider(ALCHEMY_SEPOLIA_URL, 11155111, { staticNetwork: true }))`
  This is the same pattern as `getProvider` in `client/blockchain/provider.js`.
- Use a **fixed amount** from env and ignore any amount the client sends.
- Limits: one claim per address per 24h and N per IP per day.
  - An in-memory `Map` works for a single container, but it resets on redeploy.
  - If the limits need to survive restarts, add a small Redis service to the compose file or a SQLite file on a volume.
- Return `{ hash }`. The browser waits for the receipt through the read proxy (`provider.waitForTransaction(hash)`).
- Hint: put a mutex/queue around the sends. Two concurrent requests from the same wallet will collide on the **nonce**.
- Optional: Cloudflare Turnstile captcha, verified on the server.

### 2c. Static files
- Serve `client/frontend/dist`.
- Fall back to `index.html` for React Router routes (e.g. `/dashboard/0x…`).

---

## Step 3: Frontend changes

### 3a. `client/blockchain/networks.js`: the source of truth for networks
- Stop reusing `sepolia` for Anvil. Use three entries:
  | key | chainId | rpcUrl | canFaucet |
  |---|---|---|---|
  | `mainnet` | `1` | `/api/rpc/mainnet` | `false` |
  | `sepolia` | `11155111` | `/api/rpc/sepolia` | `true` |
  | `local` (only if `import.meta.env.DEV`) | `31337` | `http://localhost:8545` | `true` |
- No `import.meta.env.VITE_*` secrets anywhere. Use plain numbers so the string chain ID bug can't come back.
- Hint: ethers' `JsonRpcProvider` needs an absolute URL. Build it with `new URL("/api/rpc/sepolia", window.location.origin).href`.

### 3b. `client/blockchain/provider.js`
- Keep the `cache` + `staticNetwork` pattern.
- Consider `{ batchMaxCount: 1 }` to make the proxy simpler.
- **Move `FUNDED_ETH_PRIVATE_KEYS` out of this module** into a dev-only one (e.g. `devAccounts.js`), and use it only behind `import.meta.env.DEV`. Anvil keys are public, but they shouldn't ship in the prod bundle.

### 3c. `client/blockchain/walletActions.js`: `sendEthTest`
- `sepolia` → `fetch("/api/faucet", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ address }) })`, then `provider.waitForTransaction(hash)`
- `local` → the existing `sendTestEthOnLocalEnv` loop with the Anvil keys. Remember to **return** (and await) the helper's result.
- `mainnet` → there's no send path at all. The UI hides the button using `canFaucet`.

### 3d. `client/frontend/src/context/NetworkContext.tsx` and `components/NetworkSwitch.tsx`
- Extend the `Network` type with `"local"`. Show the option only in dev.
- Keep the default as `"sepolia"`.

### 3e. `client/frontend/vite.config.ts`
- Add `server.proxy: { "/api": "http://localhost:3000" }` so `pnpm dev` talks to the local server exactly like production.

---

## Step 4: Docker / Dokploy

### `Dockerfile` (multi-stage)
1. Build stage: install with pnpm, run `vite build` in `client/frontend`.
2. Runtime stage: Node slim, copy `server/` + `dist`, `CMD node server/index.js`, run as non-root `USER node`.
- Add a `.dockerignore` that excludes `.env`, `node_modules`, and `.git`, so secrets never get baked into an image layer.

### `docker-compose.yml`
- `server` service: build from the Dockerfile, `expose: 3000` (Dokploy/Traefik handles the domain and HTTPS), env vars from Dokploy.
- `anvil` service: put it under `profiles: ["local"]` so Dokploy **doesn't** start it. Locally, run `docker compose --profile local up`.
- Bug to fix: `volumes:` is currently indented **under `services`**, so the named volume isn't declared. Move it to the top level (column 0).

---

## Step 5: Defense in depth (Alchemy dashboard)
- Use separate Alchemy apps for mainnet and Sepolia, so you can see and cap usage per network.
- Set a monthly compute-unit / spending cap.
- Keep only small amounts in the faucet wallet (e.g. 0.2 Sepolia ETH) and top it up by hand from the web faucets (Alchemy, Google Cloud Web3, the pk910 PoW faucet).

---

## Verification
1. **No secrets in the bundle**: run `pnpm build`, then
   `grep -rE "alch|g.alchemy.com|0x[0-9a-fA-F]{64}" client/frontend/dist`. It should find nothing.
   In the devtools Network tab, every RPC call goes to `/api/rpc/...`.
2. **Proxy allowlist**:
   ```sh
   curl -X POST localhost:3000/api/rpc/mainnet -H 'Content-Type: application/json' \
     -d '{"jsonrpc":"2.0","id":1,"method":"eth_sendRawTransaction","params":["0x"]}'   # rejected
   curl -X POST localhost:3000/api/rpc/mainnet -H 'Content-Type: application/json' \
     -d '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}'               # works
   ```
   `/api/rpc/foo` returns 400.
3. **Faucet**: a claim on Sepolia returns a hash you can see on sepolia.etherscan.io. A second claim for the same address gets rate-limited.
4. **Local**: run `docker compose --profile local up` + `pnpm dev`. The `local` network appears and sending from Anvil works. In `pnpm build` + `pnpm preview`, `local` is absent.
5. **Git**: `git ls-files | grep .env` shows only `.env.example`.
6. **Dokploy**: deploy and open the domain. Mainnet reads work, the mainnet send button is hidden, and the Sepolia faucet works.

---

## Suggested order
- [ ] 3a + 3b: local still works against Anvil
- [ ] 2a + 3e: reads go through the proxy
- [ ] 2b + 3c + 3d: faucet + network switch
- [ ] 4: Docker / compose
- [ ] 5: Alchemy caps
- [ ] Deploy on Dokploy and run the verification checklist
