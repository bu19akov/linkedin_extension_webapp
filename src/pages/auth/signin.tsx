import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import Image from 'next/image';
import Link from 'next/link';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { verified, type } = router.query;

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('Signin page - type:', type);
        router.push(`/account${type ? `?type=${type}` : ''}`);
      }
    };
    checkSession();
  }, [router, type]);

  useEffect(() => {
    if (verified === 'true') {
      console.log('Signin page - verified with type:', type);
      router.push(`/account?verified=true${type ? `&type=${type}` : ''}`);
    }
  }, [verified, router, type]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        shouldCreateUser: false
      }
    });
    setLoading(false);
    if (error) {
      if (error.message.includes('Signups not allowed')) {
        setError('Sign-ups are currently disabled. Want to upgrade to Pro? ');
      } else {
        setError(error.message);
      }
    } else {
      setMessage('Check your email for the login link.');
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6fbfa] p-2">
      <Card className="w-full max-w-sm rounded-2xl shadow-lg border-0 bg-white px-4 py-6 sm:px-6 sm:py-8 max-h-[90vh] overflow-auto">
        <div className="flex flex-col items-center gap-2 mb-4">
          <Image src="/logo.svg" alt="EngageFeed Logo" width={40} height={40} />
        </div>
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          <div className="text-2xl font-extrabold tracking-tight">Sign In</div>
          <div className="text-base text-muted-foreground text-center">Sign in to your EngageFeed account below.</div>
        </CardHeader>
        <CardContent className="pt-2">
          {message && (
            <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-600 text-center font-medium text-sm">{message}</p>
            </div>
          )}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 border border-border rounded-lg px-3 py-2 text-sm transition-all" />
            </div>
            {error && (
              <div className="text-red-500 text-xs text-center font-medium">
                {error}
                {error.includes('Sign-ups are currently disabled') && (
                  <Link href="https://engagefeed.io/pricing" className="text-blue-600 hover:underline ml-1">
                    Check our pricing
                  </Link>
                )}
              </div>
            )}
            <Button type="submit" className="w-full h-10 text-sm font-semibold rounded-lg shadow bg-[#0073e6] hover:bg-[#005bb5] text-white" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 