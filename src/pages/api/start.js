import { Challenge } from "@ludex-labs/ludex-sdk-js";

const ludexApi = new Challenge.ChallengeAPIClient(
  process.env.LUDEX_KEY,
  process.env.BASE_URL // If this isn't staging, leave blank
);

async function waitForChallengeLock(challengeId) {
  let challenge = null;
  while (challenge === null || challenge.state !== "LOCKED") {
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for 3 seconds before making the next API call
    challenge = await ludexApi.get(challengeId);
  }
  return challenge;
}

function flipCoin(players) {
  const randomIndex = Math.floor(Math.random() * players.length); // Select a random index from the array
  return players[randomIndex]; // Return the player at that index
}

export default async function handler(req, res) {
  const { challengeId } = req.body;

  var challenge = await ludexApi.get(challengeId);

  if (
    challenge.state.includes("RESOLVE") ||
    challenge.state.includes("CANCEL")
  ) {
    return res.json({ error: "This challenge is already complete!" });
  }

  const players = await challenge?.getPlayers();
  if (players.length === 0) return res.json({ error: "Not enough players" });

  if (challenge.state.includes("CREATED")) {
    await ludexApi.lock(challengeId);
    const challengeLocked = await waitForChallengeLock(challengeId);
    challenge = challengeLocked;
  }

  if (challenge.state.includes("LOCKED")) {
    const winner = flipCoin(players);
    try {
      await ludexApi.resolve(challengeId, winner?.walletAddress);
    } catch (e) {
      console.log(e);
    }

    res.json({ winner: winner?.walletAddress });
  } else {
    res.json({ error: "The challenge must be locked first!" });
  }
}
