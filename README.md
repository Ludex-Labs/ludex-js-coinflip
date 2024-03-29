# Coin Flip Challenge

Try the game: https://coinflip.ludex.gg/

This project allows for players (or testers) to join a Ludex challenge using the Ludex Javscript SDK. Once players join, they wager on a simple coin flip game. The backend logic is also handled in this repo under `pages/api/*`.

The Ludex Javascript SDK allows web apps to interact with Ludex APIs and smart contracts. It also has integration with [Web3auth](https://web3auth.io/) for passwordless authentication and non-custodial key infrastructure for wallets.

## Getting Started

First, install the dependencies:

```bash
npm install
```

then add environment variables in .env (get them from netlify or another dev)

```bash
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=
LUDEX_KEY=
REACT_APP_PROTOCOL_API=
```

then run the development server and open [http://localhost:3000](http://localhost:3000) with your browser!

```bash
npm run dev
```

## Deployment

We deploy our this app using [Netlify](https://app.netlify.com/). In order to get access ask another dev to join the Netlify team.
