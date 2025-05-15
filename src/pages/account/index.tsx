import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { User } from 'lucide-react';
import Image from 'next/image';

export default function Account() {
  const router = useRouter();
  const { verified } = router.query;
  const [loading, setLoading] = useState(true);
  const [verificationMessage, setVerificationMessage] = useState('');
  const messageShown = useRef(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const [shouldShowMessage, setShouldShowMessage] = useState(false);

  // Change Password
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Change Email
  const [email, setEmail] = useState('');
  const [emError, setEmError] = useState('');
  const [emMessage, setEmMessage] = useState('');
  const [emLoading, setEmLoading] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  // Auth check before rendering
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/auth/signin');
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, [router]);

  // Handle initial verification
  useEffect(() => {
    if (verified === 'true' && !messageShown.current) {
      messageShown.current = true;
      setShouldShowMessage(true);
      const { pathname } = router;
      router.replace(pathname, undefined, { shallow: true });
    }
  }, [verified, router]);

  // Handle message display and cleanup
  useEffect(() => {
    if (shouldShowMessage) {
      setVerificationMessage('Email verified successfully!');
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      timerRef.current = setTimeout(() => {
        setVerificationMessage('');
        setShouldShowMessage(false);
        messageShown.current = false;
      }, 5000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [shouldShowMessage]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (user) {
        setCurrentEmail(user.email || '');
        setUserId(user.id);
        setEmailConfirmed(!!user.email_confirmed_at);

        // Send message to extension when user is logged in
        window.postMessage({
          type: 'FROM_WEBAPP',
          payload: {
            session,
            user
          }
        }, '*');
      }
    };
    fetchUser();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwLoading(true);
    setPwError('');
    setPwMessage('');
    // Re-authenticate user with old password
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: currentEmail, password: oldPassword });
    if (signInError) {
      setPwError('Old password is incorrect.');
      setPwLoading(false);
      return;
    }
    // If old password is correct, update to new password
    const { error } = await supabase.auth.updateUser({ password });
    setPwLoading(false);
    if (error) {
      setPwError(error.message);
    } else {
      setPwMessage('Password updated successfully.');
      setOldPassword('');
      setPassword('');
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmLoading(true);
    setEmError('');
    setEmMessage('');
    if (!emailConfirmed) {
      setEmError('Please verify your current email before changing it.');
      setEmLoading(false);
      return;
    }
    if (!email || email === currentEmail) {
      setEmError('Please enter a new email address different from your current one.');
      setEmLoading(false);
      return;
    }
    const { error, data } = await supabase.auth.updateUser({ 
      email
    });
    if (error) {
      setEmError(error.message);
      // eslint-disable-next-line no-console
      console.error('Supabase email update error:', error);
      setEmLoading(false);
      return;
    }
    setEmLoading(false);
    setEmMessage('Please check your new email to verify the change. You will be redirected back here after verification.');
    setCurrentEmail(email);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    
    // Send empty string values to extension after signing out
    window.postMessage({
      type: 'FROM_WEBAPP',
      payload: {
        session: "",
        user: {
          email: "",
          id: ""
        }
      }
    }, '*');
    
    router.push('/auth/signin');
  };

  // Don't render sensitive content until auth is checked
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f6fbfa]">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6fbfa] p-2">
      <Card className="w-full max-w-sm rounded-2xl shadow-lg border-0 bg-white px-4 py-6 sm:px-6 sm:py-8 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col items-center gap-2">
            <Image src="/logo.svg" alt="EngageFeed Logo" width={40} height={40} />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="ml-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-none border-0"
          >
            Sign Out
          </Button>
        </div>
        <CardHeader className="flex flex-col items-center gap-2 pb-0" />
        <CardContent className="pt-2">
          {verificationMessage && (
            <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-600 text-center font-medium text-sm">{verificationMessage}</p>
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="old-password" className="text-sm font-medium">Old Password</Label>
              <Input id="old-password" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 border border-border rounded-lg px-3 py-2 text-sm transition-all" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 border border-border rounded-lg px-3 py-2 text-sm transition-all" />
            </div>
            {pwError && <div className="text-red-500 text-xs text-center font-medium">{pwError}</div>}
            {pwMessage && <div className="text-green-600 text-xs text-center font-medium">{pwMessage}</div>}
            <Button type="submit" className="w-full h-10 text-sm font-semibold rounded-lg shadow bg-[#0073e6] hover:bg-[#005bb5] text-white" disabled={pwLoading}>
              {pwLoading ? 'Updating...' : 'Change Password'}
            </Button>
          </form>
          <div className="my-6 border-t border-border" />
          <form onSubmit={handleChangeEmail} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium">New Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 border border-border rounded-lg px-3 py-2 text-sm transition-all" />
              <div className="text-xs text-muted-foreground">Current: {currentEmail} {emailConfirmed ? '(verified)' : '(not verified)'}</div>
            </div>
            {emError && <div className="text-red-500 text-xs text-center font-medium">{emError}</div>}
            {emMessage && <div className="text-green-600 text-xs text-center font-medium">{emMessage}</div>}
            <Button type="submit" className="w-full h-10 text-sm font-semibold rounded-lg shadow bg-[#0073e6] hover:bg-[#005bb5] text-white" disabled={emLoading}>
              {emLoading ? 'Updating...' : 'Change Email'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 