import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import Image from 'next/image';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const { error, data } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`
      }
    });
    
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Insert user data into users table
      const { error: insertError } = await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email,
        name: name || data.user.email?.split('@')[0] || '',
        marketing_consent: marketingConsent,
        subscription_plan: 'Free'
      });

      if (insertError) {
        setError('Account created but failed to set up user profile: ' + insertError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setMessage('Check your email to verify your account.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6fbfa] p-2">
      <Card className="w-full max-w-sm rounded-2xl shadow-lg border-0 bg-white px-4 py-6 sm:px-6 sm:py-8 max-h-[90vh] overflow-auto">
        <div className="flex flex-col items-center gap-2 mb-4">
          <Image src="/logo.svg" alt="EngageFeed Logo" width={40} height={40} />
        </div>
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          <div className="text-2xl font-extrabold tracking-tight">Sign Up</div>
          <div className="text-base text-muted-foreground text-center">Create your EngageFeed account below.</div>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-sm font-medium">Name</Label>
              <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required autoFocus className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 border border-border rounded-lg px-3 py-2 text-sm transition-all" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 border border-border rounded-lg px-3 py-2 text-sm transition-all" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 border border-border rounded-lg px-3 py-2 text-sm transition-all" />
            </div>
            <div className="flex items-center space-x-3 py-2">
              <Checkbox
                id="marketing"
                checked={marketingConsent}
                onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
                className="h-5 w-5 min-w-[1.25rem] min-h-[1.25rem] border-2 border-primary bg-white"
              />
              <Label
                htmlFor="marketing"
                className="text-sm text-muted-foreground cursor-pointer select-none"
                style={{ marginBottom: 0 }}
              >
                I'd like to receive updates about new features and offers
              </Label>
            </div>
            {error && <div className="text-red-500 text-xs text-center font-medium">{error}</div>}
            {message && <div className="text-green-600 text-xs text-center font-medium">{message}</div>}
            <Button type="submit" className="w-full h-10 text-sm font-semibold rounded-lg shadow bg-[#0073e6] hover:bg-[#005bb5] text-white" disabled={loading}>
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