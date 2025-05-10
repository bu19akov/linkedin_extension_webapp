import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import Image from 'next/image';

export default function Confirm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { token_hash } = router.query;

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token_hash) {
        setError('Invalid confirmation link');
        setLoading(false);
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token_hash as string,
          type: 'email'
        });

        if (error) {
          setError(error.message);
        } else {
          // Redirect to sign in page after successful verification
          router.push('/auth/signin?verified=true');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady) {
      verifyEmail();
    }
  }, [router.isReady, token_hash]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#f6fbfa] p-4 sm:p-8">
      <Card className="w-full max-w-md text-base rounded-3xl shadow-2xl border-0 bg-white px-4 py-8 sm:px-8 sm:py-10 max-h-[calc(100dvh-2rem)] overflow-auto">
        <div className="flex flex-col items-center gap-4 mb-6">
          <Image src="/logo.jpeg" alt="EngageFeed Logo" width={48} height={48} className="mb-2" />
        </div>
        <CardHeader className="flex flex-col items-center gap-3 pb-0">
          <CardTitle className="text-2xl font-extrabold tracking-tight">Email Confirmation</CardTitle>
          <CardDescription className="text-base text-muted-foreground text-center">
            {loading ? 'Verifying your email...' : error ? 'Verification failed' : 'Email verified successfully!'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {error && (
            <div className="text-red-500 text-sm text-center font-medium mb-4">{error}</div>
          )}
          <div className="flex flex-col items-center space-y-4">
            <Button
              onClick={() => router.push('/auth/signin')}
              className="w-full h-12 text-base font-semibold rounded-xl shadow-md bg-[#0073e6] hover:bg-[#005bb5] text-white"
            >
              Return to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 