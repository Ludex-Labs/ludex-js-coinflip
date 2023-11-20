import { Ludex } from "@ludex-labs/ludex-sdk-js";
import { Transaction, Keypair } from "@solana/web3.js";

const challengeAPI = new Ludex.ClientScoped(process.env.LUDEX_KEY, {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
}).challenge;

export default async function handler(req, res) {
  const { challengeId } = req.body;
  try {
    const playerPubkey = process.env.NEXT_PUBLIC_HOUSE_PUBLIC_KEY;
    const playerPrivKey = process.env.NEXT_PUBLIC_HOUSE_PRIVATE_KEY;

    const privateKeyBuffer = Buffer.from(playerPrivKey, "hex");

    // Initialize a keypair using the public and private key buffers
    const keypair = Keypair.fromSecretKey(privateKeyBuffer);

    console.log("keypair", keypair);

    // const response = await challengeAPI.generateJoin({
    //   challengeId: challengeId,
    //   playerPubkey: playerPubkey,
    //   gasless: false,
    // });

    // const transaction = Transaction.from(Buffer.from(tx, "base64"));
    // const sig = await signAndSendTransaction(transaction);

    res.json(true);
  } catch (error) {
    console.log(error?.response?.data);
    if (error?.response?.status) res.status(error?.response?.status);
    else res.status(400);
    res.json(error?.response?.data);
  }
}
