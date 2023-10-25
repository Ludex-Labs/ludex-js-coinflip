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
    challenge = await ludexApi.get(challengeId);
  }
  return challenge;
}

export default async function handler(req, res) {
  const { house, payoutId } = req.body;

  console.log(req.body);

  // const possiblePayouts = [79, 80, 81];
  // if (!possiblePayouts.includes(payoutId)) {
  //   res.status(404);
  //   res.send({ error: "Payout invalid!" });
  //   return;
  // }

  // const challengeOnChain = await challengeAPI.createChallenge({
  //   payoutId: payoutId.toString(),
  // });

  fetch(process.env.REACT_APP_PROTOCOL_API + "/v2/challenge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: "Bearer " + process.env.LUDEX_KEY,
    },
    body: {
      payoutId: payoutId,
      limit: 2,
      isVerified: false,
    },
  })
    .then((response) => {
      console.log("---------------- response -------------------");
      console.log("response", response);
      if (!response.ok) {
        throw new Error("GET Request Error");
      }
      return response.json();
    })
    .then((data) => {
      console.log("GET Request Response:", data);
      return data;
    })
    .catch((error) => {
      console.error("GET Request Error:", error);
    });

  console.log("res", res);

  res.json(res);

  // var blockchainAddress = challengeOnChain?.blockchainAddress;
  // // Non shelf challenges must wait for blockchainAddress
  // if (challengeOnChain?.blockchainAddress === null) {
  //   const _challenge = await waitForChallengeCreation(
  //     challengeOnChain?.challengeId
  //   );
  //   blockchainAddress = _challenge.blockchainAddress;
  // }

  // if (house) {
  //   const keypair = Keypair.fromSecretKey(bs58.decode(process.env.HOST_PK));
  //   var connection = new Connection(
  //     process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com"
  //   );
  //   const ludexTx = new Challenge.ChallengeTXClient(
  //     connection,
  //     blockchainAddress,
  //     {
  //       cluster: "DEVNET",
  //     }
  //   );
  //   console.log("ludexTx", ludexTx);
  //   const res = await ludexTx
  //     .join(keypair.publicKey.toBase58())
  //     .send([keypair]);
  //   console.log("res", res);
  // }

  // res.json(challengeOnChain?.challengeId);
}
