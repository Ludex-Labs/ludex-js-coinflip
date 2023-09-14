import { Challenge } from "@ludex-labs/ludex-sdk-js";
import { Connection, Keypair, Transaction } from "@solana/web3.js";
import * as bs58 from "bs58";

const ludexApi = new Challenge.ChallengeAPIClient(
  process.env.LUDEX_KEY,
  process.env.BASE_URL // If this isn't staging, leave blank
);

export default async function handler(req, res) {
  console.log('req', req);
  res.json({});
}
