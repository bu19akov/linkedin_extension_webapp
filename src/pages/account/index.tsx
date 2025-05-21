import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Skeleton } from '../../../components/ui/skeleton';
import Image from 'next/image';
import Header from '../../components/Header';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function Account() {
  const router = useRouter();
  const { verified, type } = router.query;
  const [emailLoading, setEmailLoading] = useState(true);
  const [verificationMessage, setVerificationMessage] = useState('');
  const messageShown = useRef(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const [shouldShowMessage, setShouldShowMessage] = useState(false);
  const { t } = useTranslation();

  // Change Email
  const [email, setEmail] = useState('');
  const [emError, setEmError] = useState('');
  const [emMessage, setEmMessage] = useState('');
  const [emLoading, setEmLoading] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  // Handle initial verification
  useEffect(() => {
    if (type && !messageShown.current) {
      messageShown.current = true;
      setShouldShowMessage(true);
    } else if (verified === 'true' && !messageShown.current) {
      messageShown.current = true;
      setShouldShowMessage(true);
      const { pathname } = router;
      router.replace(pathname, undefined, { shallow: true });
    }
  }, [verified, router, type]);

  // Handle message display and cleanup
  useEffect(() => {
    if (shouldShowMessage) {
      console.log('Account page - showing message for type:', type);
      let message = t('emailVerified');
      if (type === 'subscription') {
        message = t('subscriptionThankYou');
      } else if (type === 'login') {
        message = t('loginSuccess');
      }
      setVerificationMessage(message);
      
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
  }, [shouldShowMessage, type, t]);

  useEffect(() => {
    const fetchUser = async () => {
      setEmailLoading(true);
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
      setEmailLoading(false);
    };
    fetchUser();
  }, []);

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmLoading(true);
    setEmError('');
    setEmMessage('');
    if (!emailConfirmed) {
      setEmError(t('verifyEmailFirst'));
      setEmLoading(false);
      return;
    }
    if (!email || email === currentEmail) {
      setEmError(t('enterNewEmail'));
      setEmLoading(false);
      return;
    }
    const { error, data } = await supabase.auth.updateUser({ 
      email
    });
    if (error) {
      setEmError(error.message);
      console.error('Supabase email update error:', error);
      setEmLoading(false);
      return;
    }
    setEmLoading(false);
    setEmMessage(t('checkNewEmail'));
    setCurrentEmail(email);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f6fbfa] relative overflow-x-hidden">
        <Header />
        <main className="flex items-center justify-center min-h-screen px-4 bg-[#f6fbfa]">
          <div className="max-w-sm mx-auto w-full">
            <Card className="rounded-2xl shadow-lg border-0 bg-white px-4 py-6 sm:px-6 sm:py-8 w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col items-center gap-2">
                  <Image src="/logo.svg" alt="EngageFeed Logo" width={40} height={40} />
                </div>
                <LanguageSwitcher />
              </div>
              <CardHeader className="flex flex-col items-center gap-2 pb-0" />
              <CardContent className="pt-2">
                <div className="min-h-[28px]">
                  {verificationMessage && (
                    <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-green-600 text-center font-medium text-sm">{verificationMessage}</p>
                    </div>
                  )}
                </div>
                <div className="my-6 border-t border-border" />
                <form onSubmit={handleChangeEmail} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-sm font-medium">{t('newEmail')}</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 border border-border rounded-lg px-3 py-2 text-sm transition-all" />
                    <div className="h-4">
                      {emailLoading ? (
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          {t('current')}: {currentEmail} {emailConfirmed ? `(${t('verified')})` : `(${t('notVerified')})`}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="min-h">
                    {emError && <div className="text-red-500 text-xs text-center font-medium">{emError}</div>}
                    {emMessage && <div className="text-green-600 text-xs text-center font-medium">{emMessage}</div>}
                  </div>
                  <Button type="submit" className="w-full h-10 text-sm font-semibold rounded-lg shadow bg-[#0073e6] hover:bg-[#005bb5] text-white" disabled={emLoading}>
                    {emLoading ? t('updating') : t('changeEmail')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 