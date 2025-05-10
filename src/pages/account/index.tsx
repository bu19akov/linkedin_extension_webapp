import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { User } from 'lucide-react';
import Image from 'next/image';

export default function Account() {
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

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentEmail(data.user.email || '');
        setUserId(data.user.id);
        setEmailConfirmed(!!data.user.email_confirmed_at);
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
    const { error, data } = await supabase.auth.updateUser({ email });
    if (error) {
      setEmError(error.message);
      // eslint-disable-next-line no-console
      console.error('Supabase email update error:', error);
      setEmLoading(false);
      return;
    }
    // Update email in users table
    const { error: dbError } = await supabase.from('users').update({ email }).eq('id', userId);
    setEmLoading(false);
    if (dbError) {
      setEmError('Email updated in auth, but failed to update in users table: ' + dbError.message);
    } else {
      setEmMessage('Check your new email to verify the change.');
      setCurrentEmail(email);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#f6fbfa] p-4 sm:p-8">
      <Card className="w-full max-w-md text-base rounded-3xl shadow-2xl border-0 bg-white px-4 py-8 sm:px-8 sm:py-10 max-h-[calc(100dvh-2rem)] overflow-auto">
        <div className="flex flex-col items-center gap-4 mb-6">
          <Image src="/logo.jpeg" alt="EngageFeed Logo" width={48} height={48} className="mb-2" />
        </div>
        <CardHeader className="flex flex-col items-center gap-3 pb-0" />
        <CardContent className="pt-4">
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="old-password" className="text-base font-medium">Old Password</Label>
              <Input id="old-password" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 border border-border rounded-xl px-4 py-3 transition-all" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium">New Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 border border-border rounded-xl px-4 py-3 transition-all" />
            </div>
            {pwError && <div className="text-red-500 text-sm text-center font-medium">{pwError}</div>}
            {pwMessage && <div className="text-green-600 text-sm text-center font-medium">{pwMessage}</div>}
            <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl shadow-md bg-[#0073e6] hover:bg-[#005bb5] text-white" disabled={pwLoading}>
              {pwLoading ? 'Updating...' : 'Change Password'}
            </Button>
          </form>
          <div className="my-8 border-t border-border" />
          <form onSubmit={handleChangeEmail} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">New Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 border border-border rounded-xl px-4 py-3 transition-all" />
              <div className="text-xs text-muted-foreground">Current: {currentEmail} {emailConfirmed ? '(verified)' : '(not verified)'}</div>
            </div>
            {emError && <div className="text-red-500 text-sm text-center font-medium">{emError}</div>}
            {emMessage && <div className="text-green-600 text-sm text-center font-medium">{emMessage}</div>}
            <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl shadow-md bg-[#0073e6] hover:bg-[#005bb5] text-white" disabled={emLoading}>
              {emLoading ? 'Updating...' : 'Change Email'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 