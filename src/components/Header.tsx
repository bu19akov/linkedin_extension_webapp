import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Button } from '../../components/ui/button';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

export default function Header() {
  const router = useRouter();
  const [portalLoading, setPortalLoading] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Send empty string values to extension after signing out
    window.postMessage({
      type: 'FROM_WEBAPP',
      payload: {
        session: " ",
        user: {
          email: " ",
          id: " "
        }
      }
    }, '*');
    router.push('/auth/signin');
  };

  const handlePortalSession = async () => {
    setPortalLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch('/api/paddle/portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create portal session');
      }

      const data = await response.json();
      if (data.data?.urls?.general?.overview) {
        window.location.href = data.data.urls.general.overview;
      } else {
        throw new Error('Invalid portal session response');
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
    } finally {
      setPortalLoading(false);
    }
  };

  const isActive = (path: string) => router.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/welcome" className="flex items-center">
              <Image 
                src="/logo.svg" 
                alt="EngageFeed Logo" 
                width={32} 
                height={32}
                priority
              />
            </Link>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handlePortalSession}
              disabled={portalLoading}
              className="text-gray-600 hover:text-[#0073e6]"
            >
              {portalLoading ? 'Loading...' : 'Manage Subscription'}
            </Button>
            <Link href="/account">
              <Button 
                variant="ghost" 
                className={`${isActive('/account') ? 'text-[#0073e6]' : 'text-gray-600'} hover:text-[#0073e6]`}
              >
                Account
              </Button>
            </Link>
            <Link href="/billing">
              <Button 
                variant="ghost" 
                className={`${isActive('/billing') ? 'text-[#0073e6]' : 'text-gray-600'} hover:text-[#0073e6]`}
              >
                Billing
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="ml-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-none border-0"
            >
              Sign Out
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
} 