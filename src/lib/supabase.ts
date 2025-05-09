import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storageKey: 'webapp-supabase-auth',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'implicit'
    },
    cookies: {
        get: (name) => {
            if (typeof window === 'undefined') return '';
            return document.cookie.split('; ').find(row => row.startsWith(name))?.split('=')[1] || '';
        },
        set: (name, value, options) => {
            if (typeof window === 'undefined') return;
            document.cookie = `${name}=${value}; path=/`;
        },
        remove: (name) => {
            if (typeof window === 'undefined') return;
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
    }
}); 