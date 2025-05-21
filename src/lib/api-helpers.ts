import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from './supabase';

export type User = {
  id: string;
  paddleCustomerId?: string;
};

export type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) => Promise<void>;

export const withAuth = (handler: ApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = authHeader.split(' ')[1];
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return handler(req, res, { id: user.id });
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export const withPaddleCustomer = (handler: ApiHandler) => {
  return withAuth(async (req: NextApiRequest, res: NextApiResponse, user: User) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('paddle_user_id')
        .eq('id', user.id)
        .single();

      if (userError || !userData?.paddle_user_id) {
        return res.status(400).json({ error: 'No Paddle customer ID found' });
      }

      return handler(req, res, { ...user, paddleCustomerId: userData.paddle_user_id });
    } catch (error) {
      console.error('Paddle customer error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}; 