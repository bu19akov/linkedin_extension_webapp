import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import Image from 'next/image';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { token_hash } = router.query;

  useEffect(() => {
    const handlePasswordReset = async () => {
      if (!token_hash) {
        setError('Invalid password reset link');
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token_hash as string,
          type: 'recovery'
        });

        if (error) {
          setError(error.message);
        }
      } catch (err) {
        setError('An unexpected error occurred');
      }
    };

    if (router.isReady) {
      handlePasswordReset();
    }
  }, [router.isReady, token_hash]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password updated successfully!');
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6fbfa] p-2">
      <Card className="w-full max-w-sm rounded-2xl shadow-lg border-0 bg-white px-4 py-6 sm:px-6 sm:py-8 max-h-[90vh] overflow-auto">
        <div className="flex flex-col items-center gap-2 mb-4">
          <Image src="/logo.svg" alt="EngageFeed Logo" width={40} height={40} />
        </div>
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          <div className="text-2xl font-extrabold tracking-tight">Reset Password</div>
          <div className="text-base text-muted-foreground text-center">Enter your new password below.</div>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoFocus className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 border border-border rounded-lg px-3 py-2 text-sm transition-all" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 border border-border rounded-lg px-3 py-2 text-sm transition-all" />
            </div>
            {error && <div className="text-red-500 text-xs text-center font-medium">{error}</div>}
            {message && <div className="text-green-600 text-xs text-center font-medium">{message}</div>}
            <Button type="submit" className="w-full h-10 text-sm font-semibold rounded-lg shadow bg-[#0073e6] hover:bg-[#005bb5] text-white" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
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