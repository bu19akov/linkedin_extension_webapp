import { NextApiRequest, NextApiResponse } from 'next';
import { withPaddleCustomer } from '../../../lib/api-helpers';

async function handler(req: NextApiRequest, res: NextApiResponse, user: { id: string; paddleCustomerId: string }) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(`${process.env.PADDLE_URL}/customers/${user.paddleCustomerId}/portal-sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Paddle API error:', errorData);
      return res.status(response.status).json({ error: 'Failed to create portal session' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error creating portal session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withPaddleCustomer(handler); 