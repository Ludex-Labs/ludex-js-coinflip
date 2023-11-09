import { Ludex } from "@ludex-labs/ludex-sdk-js";

const challengeAPI = new Ludex.ClientScoped(process.env.LUDEX_KEY, {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
}).challenge;

export default async function handler(req, res) {
  const { payoutId } = req.body;
  const filters = {
    payoutId: payoutId,
  };

  try {
    const response = await challengeAPI.getChallenges(filters);
    res.json(response.data);
  } catch (error) {
    console.log(error?.response?.data);
    if (error?.response?.status) res.status(error?.response?.status);
    else res.status(400);
    res.json(error?.response?.data);
  }
}
