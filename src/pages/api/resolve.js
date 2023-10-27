import { Ludex } from "@ludex-labs/ludex-sdk-js";
const BN = require("bn.js");

const challengeAPI = new Ludex.ClientScoped(process.env.LUDEX_KEY, {
  baseUrl: process.env.REACT_APP_PROTOCOL_API,
}).challenge;

async function waitForChallengeLock(challengeId) {
  let challenge = null;
  while (challenge === null || challenge?.state !== "LOCKED") {
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for 3 seconds before making the next API call
    challenge = await challengeAPI.getChallenge(challengeId).data;
  }
  return challenge;
}

function flipCoin(players) {
  const randomIndex = Math.floor(Math.random() * players?.length); // Select a random index from the array
  return players[randomIndex]; // Return the player at that index
}

export default async function handler(req, res) {
  const { challengeId } = req.body;

  var response = await challengeAPI.getChallenge(challengeId);

  const { players, payout, state } = response.data;

  const { entryFee, mediatorRake, providerRake } = payout;

  if (!state?.includes("CREATED") && !state?.includes("LOCKED")) {
    res.status(400).json('Challenge must be in "CREATED" or "LOCKED" state');
  }

  if (state?.includes("CREATED")) {
    await challengeAPI.lockChallenge(challengeId);
    const challengeLocked = await waitForChallengeLock(challengeId);
    challenge = challengeLocked;
  }

  const winnerAddress = flipCoin(players);

  const entryBN = new BN(entryFee);
  const mediatorRakeBN = new BN(mediatorRake);
  const providerRakeBN = new BN(providerRake);

  const amount = entryBN.sub(mediatorRakeBN).sub(providerRakeBN);
  const amountString = amount.toString();

  console.log("amountString", amountString);

  try {
    await challengeAPI.resolveChallenge({
      challengeId,
      payout: [
        {
          to: winnerAddress,
          amount: amountString,
        },
      ],
    });
    res.json({ winner: winnerAddress });
  } catch (error) {
    console.log(error?.response?.data);
    res.status(error?.response?.data?.code).json(error?.response?.data);
  }
}
