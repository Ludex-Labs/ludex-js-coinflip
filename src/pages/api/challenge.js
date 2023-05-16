import { Challenge } from "@ludex-labs/ludex-sdk-js";

const ludexApi = new Challenge.ChallengeAPIClient(
  process.env.LUDEX_KEY,
  process.env.BASE_URL // If this isn't staging, leave blank
);

export default async function handler(req, res) {
  const { challengeId } = req.body;
  const challenge = await ludexApi.get(challengeId);
  const players = await challenge?.getPlayers();
  res.json({ challenge, players });
}
