import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../../components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import Header from '../components/Header';
import Image from 'next/image';
import { countries, Country } from '../lib/countries';
import ProtectedRoute from '../components/auth/ProtectedRoute';

export default function Billing() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [addressId, setAddressId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  // Auth check before rendering
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

  // Fetch user data and billing information
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (user) {
        setUserId(user.id);

        // Get user's paddle_user_id and name from Supabase
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('paddle_user_id, name')
          .eq('id', user.id)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          setError('Failed to load user information');
          return;
        }

        if (!userData?.paddle_user_id) {
          setError('No billing information found');
          return;
        }

        setCustomerId(userData.paddle_user_id);
        setFormData(prev => ({ ...prev, name: userData.name || '' }));
        fetchAddress(userData.paddle_user_id);

        // Send message to extension when user is logged in
        window.postMessage({
          type: 'FROM_WEBAPP',
          payload: {
            session,
            user
          }
        }, '*');
      }
    };
    fetchUser();
  }, []);

  const fetchAddress = async (customerId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const addressResponse = await fetch(`/api/paddle/addresses?customerId=${customerId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!addressResponse.ok) {
        throw new Error('Failed to fetch address');
      }
      const data = await addressResponse.json();
      if (data.data && data.data.length > 0) {
        const address: {
          id: string;
          first_line: string;
          second_line?: string;
          city: string;
          region: string;
          postal_code: string;
          country_code: string;
        } = data.data[0];
        setAddressId(address.id);
        setFormData(prev => ({
          ...prev,
          address: address.first_line || '',
          address2: address.second_line || '',
          city: address.city || '',
          state: address.region || '',
          zipCode: address.postal_code || '',
          country: address.country_code || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setError('Failed to load billing information. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !addressId) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Update name in Supabase users table
      const { error: nameError } = await supabase
        .from('users')
        .update({ name: formData.name })
        .eq('id', userId);

      if (nameError) {
        throw new Error('Failed to update name');
      }

      // Update customer name in Paddle
      const customerResponse = await fetch(`/api/paddle/customers?customerId=${customerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          name: formData.name
        })
      });

      if (!customerResponse.ok) {
        throw new Error('Failed to update customer name');
      }

      // Update address in Paddle
      const updateResponse = await fetch(`/api/paddle/addresses?customerId=${customerId}&addressId=${addressId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          first_line: formData.address,
          second_line: formData.address2 || null,
          city: formData.city,
          postal_code: formData.zipCode,
          region: formData.state,
          country_code: formData.country,
          status: 'active'
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update address');
      }

      setMessage('Billing information updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating information:', error);
      setError('Failed to update billing information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Don't render sensitive content until auth is checked
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f6fbfa]">Loading...</div>;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f6fbfa]">
        <Header />
        <main className="pt-20 pb-8 px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="rounded-2xl shadow-lg border-0 bg-white px-4 py-6 sm:px-6 sm:py-8">
              <div className="flex flex-col items-center gap-4 mb-6">
                <Image src="/logo.svg" alt="EngageFeed Logo" width={60} height={60} />
                <CardTitle className="text-3xl font-bold text-center">Billing Information</CardTitle>
                <CardDescription className="text-lg text-muted-foreground text-center">
                  Update your billing address information
                </CardDescription>
              </div>

              {message && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <p className="text-green-600 font-medium">{message}</p>
                </div>
              )}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                  <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 rounded-lg border border-border px-3 py-2 text-base transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">Address Line 1</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 rounded-lg border border-border px-3 py-2 text-base transition-all"
                      placeholder="Enter your street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address2" className="text-sm font-medium">Address Line 2 (Optional)</Label>
                    <Input
                      id="address2"
                      value={formData.address2}
                      onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                      className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 rounded-lg border border-border px-3 py-2 text-base transition-all"
                      placeholder="Apartment, suite, unit, etc."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                        className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 rounded-lg border border-border px-3 py-2 text-base transition-all"
                        placeholder="Enter your city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-sm font-medium">State/Region</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        required
                        className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 rounded-lg border border-border px-3 py-2 text-base transition-all"
                        placeholder="Enter your state"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode" className="text-sm font-medium">ZIP/Postal Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        required
                        className="bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 rounded-lg border border-border px-3 py-2 text-base transition-all"
                        placeholder="Enter your ZIP code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                      <div className="relative">
                        <button
                          type="button"
                          className="w-full flex items-center justify-between bg-muted/60 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/30 rounded-lg border border-border px-3 py-2 text-base transition-all"
                          onClick={() => setOpen(!open)}
                          aria-haspopup="listbox"
                          aria-expanded={open}
                        >
                          {formData.country
                            ? (<span className="flex items-center gap-2">{countries.find((c) => c.code === formData.country)?.flag} {countries.find((c) => c.code === formData.country)?.name}</span>)
                            : <span className="text-muted-foreground">Select country...</span>}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </button>
                        {open && (
                          <ul className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-white border border-border rounded-lg shadow-lg" role="listbox">
                            {countries.map((country) => (
                              <li
                                key={country.code}
                                className={cn(
                                  'flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/10',
                                  formData.country === country.code && 'bg-primary/10 font-semibold'
                                )}
                                onClick={() => {
                                  setFormData({ ...formData, country: country.code });
                                  setOpen(false);
                                }}
                                role="option"
                                aria-selected={formData.country === country.code}
                              >
                                <span className="text-xl mr-2">{country.flag}</span>
                                <span>{country.name}</span>
                                <span className="ml-auto text-xs text-muted-foreground">{country.code}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold rounded-lg shadow bg-[#0073e6] hover:bg-[#005bb5] text-white transition-colors"
                  disabled={saving}
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Update Billing Information'
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 