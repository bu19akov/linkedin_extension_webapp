import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { LogIn } from 'lucide-react';
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
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#f6fbfa] p-4 sm:p-8">
      <Card className="w-full max-w-md text-base rounded-3xl shadow-2xl border-0 bg-white px-4 py-8 sm:px-8 sm:py-10 max-h-[calc(100dvh-2rem)] overflow-auto">
        <div className="flex flex-col items-center gap-4 mb-6">
          <Image src="/logo.jpeg" alt="EngageFeed Logo" width={48} height={48} className="mb-2" />
        </div>
        <CardHeader className="flex flex-col items-center gap-3 pb-0">
          <CardTitle className="text-2xl font-extrabold tracking-tight">Sign In</CardTitle>
          <CardDescription className="text-base text-muted-foreground text-center">Welcome back! Please sign in to your account.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 border border-border rounded-xl px-4 py-3 transition-all" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 border border-border rounded-xl px-4 py-3 transition-all" />
            </div>
            {error && <div className="text-red-500 text-sm text-center font-medium">{error}</div>}
            {message && <div className="text-green-600 text-sm text-center font-medium">{message}</div>}
            <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl shadow-md bg-[#0073e6] hover:bg-[#005bb5] text-white" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="my-6 border-t border-border" />
          <div className="flex flex-col items-center space-y-2">
            <a href="/auth/signup" className="text-sm text-muted-foreground hover:underline transition-colors font-medium">Don&apos;t have an account? <span className="text-primary font-semibold">Sign Up</span></a>
            <a href="/auth/forgot" className="text-sm text-muted-foreground hover:underline transition-colors">Forgot password?</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 