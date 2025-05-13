import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import Image from 'next/image';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { verified } = router.query;

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
    if (verified === 'true') {
      router.push('/account?verified=true');
    }
  }, [verified, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6fbfa] p-2">
      <Card className="w-full max-w-sm rounded-2xl shadow-lg border-0 bg-white px-4 py-6 sm:px-6 sm:py-8 max-h-[90vh] overflow-auto">
        <div className="flex flex-col items-center gap-2 mb-4">
          <Image src="/logo.jpeg" alt="EngageFeed Logo" width={40} height={40} />
        </div>
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          <div className="text-2xl font-extrabold tracking-tight">Sign In</div>
          <div className="text-base text-muted-foreground text-center">Sign in to your EngageFeed account below.</div>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 border border-border rounded-lg px-3 py-2 text-sm transition-all" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 border border-border rounded-lg px-3 py-2 text-sm transition-all" />
            </div>
            {error && <div className="text-red-500 text-xs text-center font-medium">{error}</div>}
            <Button type="submit" className="w-full h-10 text-sm font-semibold rounded-lg shadow bg-[#0073e6] hover:bg-[#005bb5] text-white" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="flex flex-col items-center mt-6 space-y-2">
            <a href="/auth/forgot" className="text-sm text-muted-foreground hover:underline transition-colors font-medium">Forgot your password?</a>
            <a href="/auth/signup" className="text-sm text-muted-foreground hover:underline transition-colors font-medium">Don't have an account? <span className="text-primary font-semibold">Sign Up</span></a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 