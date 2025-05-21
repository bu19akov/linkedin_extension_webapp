import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import Image from 'next/image';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6fbfa]">
        <Card className="w-full max-w-sm rounded-2xl shadow-lg border-0 bg-white px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex flex-col items-center gap-2 mb-4">
            <Image src="/logo.svg" alt="EngageFeed Logo" width={40} height={40} />
          </div>
          <CardHeader className="flex flex-col items-center gap-2 pb-0">
            <div className="text-2xl font-extrabold tracking-tight">Loading...</div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-base text-muted-foreground text-center">
              Please wait while we verify your session...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
} 