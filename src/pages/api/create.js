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
  const { payoutId } = req.body;

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

  res.json(challengeOnChain?.challengeId);
}
