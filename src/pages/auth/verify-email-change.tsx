import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export default function VerifyEmailChange() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const handleEmailChangeVerification = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) throw error;

        // Redirect to account page after successful verification
        router.push('/account');
      } catch (error) {
        console.error('Error:', error);
        setError(t('errorVerifyingEmailChange'));
      } finally {
        setLoading(false);
      }
    };

    handleEmailChangeVerification();
  }, [router, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6fbfa] p-2">
      <Card className="w-full max-w-sm rounded-2xl shadow-lg border-0 bg-white px-4 py-6 sm:px-6 sm:py-8 max-h-[90vh] overflow-auto">
        <div className="flex flex-col items-center gap-2 mb-4">
          <Image src="/logo.svg" alt="EngageFeed Logo" width={40} height={40} />
        </div>
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          <div className="text-2xl font-extrabold tracking-tight">{t('verifyingEmailChange')}</div>
          <div className="text-base text-muted-foreground text-center">{t('pleaseWait')}</div>
        </CardHeader>
        <CardContent className="pt-2">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0073e6] mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">{t('verifyingYourEmailChange')}</p>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-red-500 text-sm">{error}</p>
              <Button
                onClick={() => router.push('/account')}
                className="mt-4 w-full h-10 text-sm font-semibold rounded-lg shadow bg-[#0073e6] hover:bg-[#005bb5] text-white"
              >
                {t('backToAccount')}
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-green-600 text-sm font-medium">{t('emailChangeVerified')}</p>
              <Button
                onClick={() => router.push('/account')}
                className="mt-4 w-full h-10 text-sm font-semibold rounded-lg shadow bg-[#0073e6] hover:bg-[#005bb5] text-white"
              >
                {t('continueToAccount')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 