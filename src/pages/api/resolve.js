import { Ludex } from "@ludex-labs/ludex-sdk-js";
const BN = require("bn.js");

const challengeAPI = new Ludex.ClientScoped(process.env.LUDEX_KEY, {
  baseUrl: process.env.REACT_APP_PROTOCOL_API,
}).challenge;

function flipCoin(players) {
  const randomIndex = Math.floor(Math.random() * players?.length); // Select a random index from the array
  return players[randomIndex]; // Return the player at that index
}

export default async function handler(req, res) {
  const { challengeId } = req.body;

  var response = await challengeAPI.getChallenge(challengeId);
  const { players, payout } = response.data;
  const { entryFee, mediatorRake, providerRake } = payout;

  const winnerAddress = flipCoin(players);
  const entryBN = new BN(entryFee);
  const mediatorRakeBN = new BN(mediatorRake);
  const providerRakeBN = new BN(providerRake);
  const amount = entryBN.sub(mediatorRakeBN).sub(providerRakeBN).toString();

  console.log("---------------------------------------------");
  console.log("amount", amount);

  try {
    await challengeAPI.resolveChallenge({
      challengeId,
      payout: [
        {
          to: winnerAddress,
          amount: amount,
        },
      ],
    });
    res.json({ winner: winnerAddress });
  } catch (error) {
    console.log(error?.response?.data);
    res.status(error?.response?.data?.code).json(error?.response?.data);
  }
}
