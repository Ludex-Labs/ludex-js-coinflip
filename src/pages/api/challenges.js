import { Challenge } from "@ludex-labs/ludex-sdk-js";

const ludexApi = new Challenge.ChallengeAPIClient(
  process.env.LUDEX_KEY,
  process.env.BASE_URL // If this isn't staging, leave blank
);

export default async function handler(req, res) {
  const { payoutId } = req.body;

  const filter = {
    payoutId: payoutId,
  };

  const challenges = await ludexApi.list(filter, {
    page: 1,
    limit: 100,
    orderBy: "claimedAt",
    sort: "desc",
  });
  res.json(challenges);
}
