import { Ludex } from "@ludex-labs/ludex-sdk-js";

const challengeAPI = new Ludex.ClientScoped(process.env.LUDEX_KEY, {
  baseUrl: process.env.REACT_APP_PROTOCOL_API,
}).challenge;

export default async function handler(req, res) {
  const { challengeId, playerPubkey } = req.body;
  try {
    const response = await challengeAPI.generateJoin({
      challengeId: challengeId,
      playerPubkey: playerPubkey,
      gasless: false,
    });
    res.json(response.data);
  } catch (error) {
    console.log(error?.response?.data);
    res.status(error?.response?.data?.code).json(error?.response?.data);
  }
}
