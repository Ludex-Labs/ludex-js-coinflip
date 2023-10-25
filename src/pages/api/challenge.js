import { Ludex } from "@ludex-labs/ludex-sdk-js";

export default async function handler(req, res) {
  const { challengeId } = req.body;
  try {
    const challengeAPI = new Ludex.ClientScoped(process.env.LUDEX_KEY, {
      baseUrl: process.env.REACT_APP_PROTOCOL_API,
    }).challenge;

    const challenge = await challengeAPI.getChallenge(challengeId);
    res.json(challenge);
  } catch (error) {
    console.error(error?.message);
    res.json({ error: error });
  }
}
