import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../components/Header';
import confetti from 'canvas-confetti';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useTranslation } from 'react-i18next';

export default function Welcome() {
  const router = useRouter();
  const glowRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/auth/signin');
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    // Initial confetti burst
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      zIndex: 9999,
    });
    // Side cannons
    setTimeout(() => {
      confetti({
        angle: 60,
        spread: 55,
        particleCount: 60,
        origin: { x: 0, y: 0.7 },
        zIndex: 9999,
      });
      confetti({
        angle: 120,
        spread: 55,
        particleCount: 60,
        origin: { x: 1, y: 0.7 },
        zIndex: 9999,
      });
    }, 700);
    setTimeout(() => {
      confetti({
        angle: 90,
        spread: 80,
        particleCount: 80,
        origin: { x: 0.5, y: 0.1 },
        zIndex: 9999,
      });
    }, 1400);
    // Animate glow
    if (glowRef.current) {
      glowRef.current.animate([
        { opacity: 0.7, filter: 'blur(32px)' },
        { opacity: 1, filter: 'blur(48px)' },
        { opacity: 0.7, filter: 'blur(32px)' }
      ], {
        duration: 3000,
        iterations: Infinity
      });
    }
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f6fbfa] relative overflow-x-hidden">
        <Header />
        <main className="flex items-center justify-center min-h-screen px-4 bg-[#f6fbfa]">
          <div className="max-w-2xl mx-auto relative">
            {/* Animated Glow */}
            <div ref={glowRef} className="absolute -inset-4 sm:-inset-8 rounded-3xl bg-gradient-to-tr from-blue-300 via-purple-200 to-pink-200 opacity-70 blur-3xl z-0 animate-pulse" aria-hidden="true" />
            <Card className="rounded-2xl shadow-lg border-0 bg-white px-4 py-6 sm:px-6 sm:py-8 relative z-10">
              <div className="flex flex-col items-center gap-4">
                <Image src="/logo.svg" alt="EngageFeed Logo" width={60} height={60} />
                <h1 className="text-3xl font-bold text-center">{t('welcomeToEngageFeed')}</h1>
                <p className="text-lg text-muted-foreground text-center">
                  {t('thankYouForSubscribing')}
                </p>
                <div className="w-full aspect-video bg-black rounded-xl overflow-hidden my-4">
                  <video 
                    className="w-full h-full object-cover"
                    controls
                    poster="/video-poster.jpg"
                  >
                    <source src="/welcome-video.mp4" type="video/mp4" />
                    {t('videoNotSupported')}
                  </video>
                </div>
              </div>
            </Card>
          </div>
        </main>
        <style jsx global>{`
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(24px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.2s both;
          }
          @keyframes pop {
            0% { transform: scale(0.7); }
            60% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          .animate-pop {
            animation: pop 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.3s both;
          }
          .animate-bounce {
            animation: bounce 1.2s infinite alternate cubic-bezier(0.23, 1, 0.32, 1);
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
} 