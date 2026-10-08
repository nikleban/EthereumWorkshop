# Ethereum Workshop

A small web app for poking around Ethereum locally with [ethers.js](https://docs.ethers.org/) —
generate private keys, send ETH between accounts, check balances, and browse account history,
all against a local [Anvil](https://book.getfoundry.sh/anvil/) node running in Docker.

This isn't meant to solve a real-world problem — it's a personal playground to get hands-on
with `ethers` and web3 frontend development.

## Stack

- **Local chain:** Anvil (Foundry), via `docker-compose.yml`
- **Blockchain logic:** `ethers.js` (`client/blockchain`)
- **Frontend:** React + TypeScript + Vite + Tailwind + shadcn (`client/frontend`)

## Screenshots

<!-- Drop images into docs/screenshots/ and they'll show up here -->
![Generate a private key](docs/screenshots/generate.png)
![Insert an existing private key](docs/screenshots/insert.png)

## Features

- [x] Generate a random private key
- [x] Insert an existing private key
- [ ] Send ETH to an account
- [ ] Check an account's balance
- [ ] View an account's transaction history

## Getting Started

1. Start the local chain:
   ```bash
   docker compose up -d
   ```
2. Run the frontend:
   ```bash
   cd client/frontend
   pnpm install
   pnpm dev
   ```
3. Open the printed local URL (usually `http://localhost:5173`).
