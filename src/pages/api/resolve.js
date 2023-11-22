import { Ludex } from "@ludex-labs/ludex-sdk-js";
const BN = require("bn.js");

const challengeAPI = new Ludex.ClientScoped(process.env.LUDEX_KEY, {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
}).challenge;

function flipCoin(players) {
  const randomIndex = Math.floor(Math.random() * players?.length); // Select a random index from the array
  return players[randomIndex]; // Return the player at that index
}

export default async function handler(req, res) {
  const { challengeId } = req.body;

  var response = await challengeAPI.getChallenge(challengeId);
  const { players } = response.data;

  console.log(players);
  const winnerAddress = flipCoin(players);

  console.log(winnerAddress);

  try {
    const res = await challengeAPI.resolveChallengeWithOneWinner({
      challengeId: challengeId,
      winner: winnerAddress,
    });
    console.log("res", res);

    res.json({ winnerAddress: winnerAddress });
  } catch (error) {
    console.log(error?.response?.data);
    if (error?.response?.status) res.status(error?.response?.status);
    else res.status(400);
    res.json(error?.response?.data);
  }
}
