import React, { useEffect } from 'react';
import { useState } from 'react';
import type { AppProps } from 'next/app';
import { supabase } from '../lib/supabase';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const handleAuthStateChange = (event: any) => {
      const { event: authEvent, session } = event.detail;
      if (authEvent === 'SIGNED_IN') {
        console.log('User signed in:', session.user);
      }
    };

    window.addEventListener('supabase.auth.stateChange', handleAuthStateChange);

    // Add message listener for extension communication
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data && event.data.type === 'FROM_EXTENSION') {
        const { session, email, supabase_user_id } = event.data;
        
        if (session) {
          localStorage.setItem('supabase_session', JSON.stringify(session));
          // Update Supabase client session with proper format
          supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token
          });
          console.log('Session updated:', session);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('supabase.auth.stateChange', handleAuthStateChange);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return <Component {...pageProps} />;
} 