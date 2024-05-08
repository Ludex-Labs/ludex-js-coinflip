import axios from "axios";

const ludexApi = process.env.NEXT_PUBLIC_BASE_URL + '/v2/nftChallenge/'
const authToken = process.env.LUDEX_KEY

export default async function handler(req, res) {
  const { challengeId, playerPubkey, amount } = req.body;

  const url = ludexApi + challengeId + '/add-nft-offering';

  console.log('🚨🚨🚨🚨', url)
  try {
    
    const requestbody = {
        playerPubkey,
        amount: 1,
        // tokenMintAddress: "6DbWVAtjRapDg3khNeEnJvz4gJ788rEgaiwSfV5n8hao"
        tokenMintAddress: "2sQpe3Ggs8KT2y6ziAVdqRQJ57so6oTT1avGT5s6FRXD"
    }
    
    const response = await axios.patch(url, requestbody, {
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
