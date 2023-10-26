import { Ludex } from "@ludex-labs/ludex-sdk-js";

export default async function handler(req, res) {
  const { challengeId, playerPubkey } = req.body;

  try {
    const challengeAPI = new Ludex.ClientScoped(process.env.LUDEX_KEY, {
      baseUrl: process.env.REACT_APP_PROTOCOL_API,
    }).challenge;

    const tx = await challengeAPI.generateJoin({
      challengeId: challengeId,
      playerPubkey: playerPubkey,
      gasless: true,
    });

    res.json(tx);
  } catch (error) {
    console.log("error", error);
    console.log("error", error?.response?.data);
    res.json(error);
  }
}
