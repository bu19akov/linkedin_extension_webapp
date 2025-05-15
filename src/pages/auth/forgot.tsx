import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import Image from 'next/image';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/account');
      }
    };
    checkSession();
  }, [router]);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMessage('Check your email for a password reset link.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6fbfa] p-2">
      <Card className="w-full max-w-sm rounded-2xl shadow-lg border-0 bg-white px-4 py-6 sm:px-6 sm:py-8 max-h-[90vh] overflow-auto">
        <div className="flex flex-col items-center gap-2 mb-4">
          <Image src="/logo.svg" alt="EngageFeed Logo" width={40} height={40} />
        </div>
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          <div className="text-2xl font-extrabold tracking-tight">Forgot Password</div>
          <div className="text-base text-muted-foreground text-center">Enter your email to reset your password.</div>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleForgot} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 border border-border rounded-lg px-3 py-2 text-sm transition-all" />
            </div>
            {error && <div className="text-red-500 text-xs text-center font-medium">{error}</div>}
            {message && <div className="text-green-600 text-xs text-center font-medium">{message}</div>}
            <Button type="submit" className="w-full h-10 text-sm font-semibold rounded-lg shadow bg-[#0073e6] hover:bg-[#005bb5] text-white" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
          <div className="flex flex-col items-center mt-6 space-y-2">
            <a href="/auth/signin" className="text-sm text-muted-foreground hover:underline transition-colors font-medium">Back to <span className="text-primary font-semibold">Sign In</span></a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 