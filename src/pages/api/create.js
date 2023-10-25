import { Ludex } from "@ludex-labs/ludex-sdk-js";

import { Connection, Keypair, Transaction } from "@solana/web3.js";
import * as bs58 from "bs58";

const challengeAPI = new Ludex.ClientScoped(process.env.LUDEX_KEY, {
  baseUrl: process.env.REACT_APP_PROTOCOL_API,
}).challenge;

async function waitForChallengeCreation(challengeId) {
  let challenge = null;
  while (challenge === null || challenge.blockchainAddress === null) {
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for 3 seconds before making the next API call
    challenge = await challengeAPI.getChallenge({
      challengeId: challengeId,
    });
  }
  return challenge;
}

export default async function handler(req, res) {
  const { house, payoutId } = req.body;

  const possiblePayouts = [79, 80, 81];
  if (!possiblePayouts.includes(payoutId)) {
    res.status(404);
    res.send({ error: "Payout invalid!" });
    return;
  }

  const challengeOnChain = await challengeAPI.createChallenge({
    payoutId: payoutId,
  });

  var blockchainAddress = challengeOnChain?.blockchainAddress;
  // Non shelf challenges must wait for blockchainAddress
  if (challengeOnChain?.blockchainAddress === null) {
    const _challenge = await waitForChallengeCreation(
      challengeOnChain?.challengeId
    );
    blockchainAddress = _challenge.blockchainAddress;
  }

  if (house) {
    const keypair = Keypair.fromSecretKey(bs58.decode(process.env.HOST_PK));
    var connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com"
    );
    const ludexTx = new Challenge.ChallengeTXClient(
      connection,
      blockchainAddress,
      {
        cluster: "DEVNET",
      }
    );
    console.log("ludexTx", ludexTx);
    const res = await ludexTx
      .join(keypair.publicKey.toBase58())
      .send([keypair]);
    console.log("res", res);
  }

  res.json(challengeOnChain?.challengeId);
}
