import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/auth/ProtectedRoute';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/account');
  }, [router]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center bg-[#f6fbfa]">
        Loading...
      </div>
    </ProtectedRoute>
  );
} 