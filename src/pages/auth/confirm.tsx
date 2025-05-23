import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export default function Confirm() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { token_hash, type } = router.query;

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token_hash as string,
          type: 'email'
        });

        if (error) {
          setError(error.message);
        } else {
          console.log('Confirm page - type:', type);
          // Get user's language preference from database
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: userData } = await supabase
              .from('users')
              .select('language')
              .eq('id', session.user.id)
              .single();

            if (userData?.language) {
              // Update language if different from current
              if (i18n.language !== userData.language) {
                await i18n.changeLanguage(userData.language);
              }
              // Clear localStorage language preference
              localStorage.removeItem('preferredLanguage');
            }
          }

          // Redirect to welcome page for new subscriptions, otherwise to sign in
          if (type === 'subscription') {
            router.push('/welcome');
          } else {
            router.push(`/auth/signin?verified=true&type=${type || 'login'}`);
          }
        }
      } catch (err) {
        setError(t('errorConfirmingEmail'));
      } finally {
        setLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [router.isReady, t, type, token_hash, i18n]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6fbfa] p-2">
      <Card className="w-full max-w-sm rounded-2xl shadow-lg border-0 bg-white px-4 py-6 sm:px-6 sm:py-8 max-h-[90vh] overflow-auto">
        <div className="flex flex-col items-center gap-2 mb-4">
          <Image src="/logo.svg" alt="EngageFeed Logo" width={40} height={40} />
        </div>
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          <div className="text-2xl font-extrabold tracking-tight">{t('confirmingEmail')}</div>
          <div className="text-base text-muted-foreground text-center">{t('pleaseWait')}</div>
        </CardHeader>
        <CardContent className="pt-2">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0073e6] mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">{t('confirmingYourEmail')}</p>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-red-500 text-sm">{error}</p>
              <Button
                onClick={() => router.push('/auth/signin')}
                className="mt-4 w-full h-10 text-sm font-semibold rounded-lg shadow bg-[#0073e6] hover:bg-[#005bb5] text-white"
              >
                {t('backToSignIn')}
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-green-600 text-sm font-medium">{t('emailConfirmed')}</p>
              <Button
                onClick={() => router.push('/')}
                className="mt-4 w-full h-10 text-sm font-semibold rounded-lg shadow bg-[#0073e6] hover:bg-[#005bb5] text-white"
              >
                {t('continueToDashboard')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 