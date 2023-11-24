import { Keypair, Connection, Transaction } from "@solana/web3.js";
import bs58 from "bs58";
import { Ludex } from "@ludex-labs/ludex-sdk-js";

const challengeAPI = new Ludex.ClientScoped(process.env.LUDEX_KEY, {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
}).challenge;

export default async function handler(req, res) {
  const { challengeId } = req.body;

  try {
    const playerPrivKey = process.env.HOUSE_PRIVATE_KEY;
    const decodedKey = bs58.decode(playerPrivKey);
    const secret = new Uint8Array(decodedKey);
    const account = Keypair.fromSecretKey(secret);
    const response = await challengeAPI.generateJoin({
      challengeId: challengeId,
      playerPubkey: account.publicKey.toBase58(),
      gasless: false,
    });
    const transaction = Transaction.from(
      Buffer.from(response.data.transaction, "base64")
    );
    const conn = new Connection("https://api.devnet.solana.com");
    const signature = await conn.sendTransaction(transaction, [account]);
    res.json(signature);
  } catch (error) {
    console.log("error", error?.response?.data);
    if (error?.response?.status) res.status(error?.response?.status);
    else res.status(400);
    res.json(error?.response?.data);
  }
}
