import { Ludex } from "@ludex-labs/ludex-sdk-js";

const challengeAPI = new Ludex.ClientScoped(process.env.LUDEX_KEY, {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
}).challenge;

var updatedChallenges = [];

export default async function handler(req, res) {
  const challengeUpdate = req.body;
  const isWebhookUpdate = Object.keys(challengeUpdate).length !== 0;
  const challengeUpdateId = challengeUpdate.id || challengeUpdate.challengeId;
  const id = parseInt(req.query.id);
  var force = false;
  if (req.query.force) force = JSON.parse(req.query.force);

  try {
    if (isWebhookUpdate && challengeUpdateId) {
      updatedChallenges.push(challengeUpdateId);
      res.status(200).json("Ok");
    } else if (updatedChallenges.includes(id) || force) {
      updatedChallenges.filter((c) => c !== id);
      const response = await challengeAPI.getChallenge(id);
      res.json(response.data);
    } else {
      res.status(204).send();
    }
  } catch (error) {
    console.log(error);
    console.log(error?.response?.data);
    if (error?.response?.status) res.status(error?.response?.status);
    else res.status(400);
    res.json(error?.response?.data);
  }
}
