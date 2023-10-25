import { Ludex } from "@ludex-labs/ludex-sdk-js";

const challengeAPI = new Ludex.ClientScoped(process.env.LUDEX_KEY, {
  baseUrl: process.env.REACT_APP_PROTOCOL_API,
}).challenge;

async function waitForChallengeLock(challengeId) {
  let challenge = null;
  while (challenge === null || challenge.state !== "LOCKED") {
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for 3 seconds before making the next API call
    challenge = await challengeAPI.getChallenge(challengeId);
    console.log("------locked-------");
  }
  return challenge;
}

function flipCoin(players) {
  const randomIndex = Math.floor(Math.random() * players.length); // Select a random index from the array
  return players[randomIndex]; // Return the player at that index
}

export default async function handler(req, res) {
  const { challengeId } = req.body;

  var challenge = await challengeAPI.getChallenge(challengeId);

  if (
    challenge.state.includes("RESOLVE") ||
    challenge.state.includes("CANCEL")
  ) {
    return res.json({ error: "This challenge is already complete!" });
  }

  const players = await challenge.players;
  if (players.length === 0) return res.json({ error: "Not enough players" });

  if (challenge.state.includes("CREATED")) {
    await challengeAPI.lockChallenge(challengeId);
    const challengeLocked = await waitForChallengeLock(challengeId);
    challenge = challengeLocked;
  }

  if (challenge.state.includes("LOCKED")) {
    const winner = flipCoin(players);

    const { entryFee, mediatorRake, providerRake } = challenge;
    const amount = (entryFee - mediatorRake - providerRake) * players.length;

    try {
      await challengeAPI.resolveChallenge({
        challengeId,
        payout: [
          {
            to: winner,
            amount: amount,
          },
        ],
      });
      res.json({ winner: winner });
    } catch (error) {
      console.log("error res", error?.response);
      res.json({ error: error });
    }
  } else {
    res.json({ error: "The challenge must be locked first!" });
  }
}
