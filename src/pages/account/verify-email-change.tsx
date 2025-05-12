import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { Card, CardContent } from '../../../components/ui/card';
import Image from 'next/image';

export default function VerifyEmailChange() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyEmailChange = async () => {
      const { token_hash, type, email } = router.query;

      if (!token_hash || !type || !email) {
        setError('Invalid verification link');
        setLoading(false);
        return;
      }

      try {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: token_hash as string,
          type: 'email_change'
        });

        if (verifyError) throw verifyError;

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found');

        // Update email in users table
        const { error: updateError } = await supabase
          .from('users')
          .update({ email: email as string })
          .eq('id', user.id);

        if (updateError) throw updateError;

        // Redirect to account page with success message
        router.push('/account?verified=true');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to verify email change');
        setLoading(false);
      }
    };

    if (router.isReady) {
      verifyEmailChange();
    }
  }, [router.isReady, router.query]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#f6fbfa] p-4 sm:p-8">
      <Card className="w-full max-w-md text-base rounded-3xl shadow-2xl border-0 bg-white px-4 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col items-center gap-4 mb-6">
          <Image src="/logo.jpeg" alt="EngageFeed Logo" width={48} height={48} className="mb-2" />
        </div>
        <CardContent className="pt-4">
          {loading ? (
            <p className="text-center text-gray-600">Verifying your email change...</p>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-center font-medium">{error}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
} 