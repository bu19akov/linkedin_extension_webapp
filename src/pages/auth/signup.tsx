import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import Image from 'next/image';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/confirm`
      }
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMessage('Check your email to verify your account.');
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#f6fbfa] p-4 sm:p-8">
      <Card className="w-full max-w-md text-base rounded-3xl shadow-2xl border-0 bg-white px-4 py-8 sm:px-8 sm:py-10 max-h-[calc(100dvh-2rem)] overflow-auto">
        <div className="flex flex-col items-center gap-4 mb-6">
          <Image src="/logo.jpeg" alt="EngageFeed Logo" width={48} height={48} className="mb-2" />
        </div>
        <CardHeader className="flex flex-col items-center gap-3 pb-0">
          <div className="text-2xl font-extrabold tracking-tight">Sign Up</div>
          <div className="text-base text-muted-foreground text-center">Create your Kleo account below.</div>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSignUp} className="space-y-6">
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
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>
          <div className="flex flex-col items-center mt-6 space-y-2">
            <a href="/auth/signin" className="text-sm text-muted-foreground hover:underline transition-colors font-medium">Already have an account? <span className="text-primary font-semibold">Sign In</span></a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 