import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customerId, email } = req.body;

  if (!customerId || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch(`https://sandbox-api.paddle.com/customers/${customerId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.PADDLE_API_KEY_GET_CUSTOMER}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Paddle API error:', errorData);
      return res.status(response.status).json({ error: 'Failed to update Paddle customer' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error updating Paddle customer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 