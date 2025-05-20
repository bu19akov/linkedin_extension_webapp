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
  const { token_hash, type } = router.query;

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/account');
      }
    };
    checkSession();
  }, [router]);

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
          console.log('Confirm page - type:', type);
          // Redirect to sign in page after successful verification with type parameter
          router.push(`/auth/signin?verified=true&type=${type || 'login'}`);
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
  }, [router.isReady, token_hash, type]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6fbfa] p-2">
      <Card className="w-full max-w-sm rounded-2xl shadow-lg border-0 bg-white px-4 py-6 sm:px-6 sm:py-8 max-h-[90vh] overflow-auto">
        <div className="flex flex-col items-center gap-2 mb-4">
          <Image src="/logo.svg" alt="EngageFeed Logo" width={40} height={40} />
        </div>
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          <div className="text-2xl font-extrabold tracking-tight">Check Your Email</div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-base text-muted-foreground text-center mb-4">
            We sent you a confirmation link. Please check your email to verify your account.
          </div>
          {error && <div className="text-red-500 text-xs text-center font-medium mt-4">{error}</div>}
          <div className="flex flex-col items-center mt-6 space-y-2">
            <a href="/auth/signin" className="text-sm text-muted-foreground hover:underline transition-colors font-medium">Back to <span className="text-primary font-semibold">Sign In</span></a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 