import { Ludex } from "@ludex-labs/ludex-sdk-js";

const challengeAPI = new Ludex.ClientScoped(process.env.LUDEX_KEY, {
  baseUrl: process.env.REACT_APP_PROTOCOL_API,
}).challenge;

export default async function handler(req, res) {
  const { challengeId, playerPubkey } = req.body;
  try {
    const response = await challengeAPI.generateLeave({
      challengeId: challengeId,
      playerPubkey: playerPubkey,
    });
    res.json(response.data);
  } catch (error) {
    console.log(error?.response?.data);
    if (error?.response?.status) res.status(error?.response?.status);
    else res.status(400);
    res.json(error?.response?.data);
  }
}
