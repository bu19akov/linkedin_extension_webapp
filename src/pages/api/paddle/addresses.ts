import { NextApiRequest, NextApiResponse } from 'next';
import { withPaddleCustomer } from '../../../lib/api-helpers';

async function handler(req: NextApiRequest, res: NextApiResponse, user: { id: string; paddleCustomerId: string }) {
  const { searchParams } = new URL(req.url!, `http://${req.headers.host}`);
  const customerId = searchParams.get('customerId');
  const addressId = searchParams.get('addressId');

  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID is required' });
  }

  // Verify user has access to this customer ID
  if (customerId !== user.paddleCustomerId) {
    return res.status(403).json({ error: 'Unauthorized access to customer data' });
  }

  try {
    if (req.method === 'GET') {
      const response = await fetch(
        `${process.env.PADDLE_URL}/customers/${customerId}/addresses`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Paddle API error:', errorData);
        return res.status(response.status).json({ error: 'Failed to fetch addresses' });
      }

      const data = await response.json();
      return res.status(200).json(data);
    }

    if (req.method === 'PATCH') {
      if (!addressId) {
        return res.status(400).json({ error: 'Address ID is required' });
      }

      const response = await fetch(
        `${process.env.PADDLE_URL}/customers/${customerId}/addresses/${addressId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(req.body),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Paddle API error:', errorData);
        return res.status(response.status).json({ error: 'Failed to update address' });
      }

      const data = await response.json();
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in addresses API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withPaddleCustomer(handler); 