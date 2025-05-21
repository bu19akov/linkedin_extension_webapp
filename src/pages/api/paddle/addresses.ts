import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { customerId, addressId } = req.query;

  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID is required' });
  }

  try {
    if (req.method === 'GET') {
      const response = await fetch(`https://sandbox-api.paddle.com/customers/${customerId}/addresses`, {
        headers: {
          'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return res.status(response.status).json(data);
    }

    if (req.method === 'PATCH' && addressId) {
      const response = await fetch(`https://sandbox-api.paddle.com/customers/${customerId}/addresses/${addressId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
      });

      const data = await response.json();
      return res.status(response.status).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Paddle API error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
} 