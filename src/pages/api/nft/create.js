import axios from "axios";

const ludexApi = process.env.NEXT_PUBLIC_BASE_URL + '/v2/nftChallenge';
const authToken = process.env.LUDEX_KEY;

export default async function handler(req, res) {
  const { payoutId } = req.body;

  console.log('🚨🚨🚨🚨'.payoutId)
  try {
    const requestbody = {
      payoutId
    }

    const response = await axios.post(ludexApi, requestbody, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    res.json(response.data);
  } catch (error) {
    console.log(error?.response?.data);
    if (error?.response?.status) res.status(error?.response?.status);
    else res.status(400);
    res.json(error?.response?.data);
  }
}
