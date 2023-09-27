<p align="center">
  <img width="100" height="100" src="/public/SOL.svg">
</p>

# Coin flip wager on Solana

Try the game: https://coinflip.ludex.gg/

This project allows for players (or testers) to join a Ludex challenge on Solana using the Ludex Javscript SDK. Once players join, they wager on a simple coin flip game. The backend logic is also handled in this repo under `pages/api/*`.

The Ludex Javascript SDK allows web apps to interact with Ludex APIs and smart contracts. It also has integration with [Web3auth](https://web3auth.io/) for passwordless authentication and non-custodial key infrastructure for wallets.

## Getting Started

First, install the dependencies:

```bash
npm install
```

then add environment variables in .env (get them from netlify or another dev)

```bash
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=
NEXT_PUBLIC_SOLANA_RPC_MAINNET=
NEXT_PUBLIC_SOLANA_RPC=
LUDEX_KEY=
BASE_URL=
HOST_PK=
```

and run the development server and open [http://localhost:3000](http://localhost:3000) with your browser!

```bash
npm run dev
```
