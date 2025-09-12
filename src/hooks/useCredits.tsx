import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CreditBalance {
  credits_balance: number;
  updated_at: string;
}

interface CreditTransaction {
  id: string;
  transaction_type: 'purchase' | 'usage' | 'refund';
  credits_amount: number;
  description: string;
  created_at: string;
  listing_id?: string;
}

export const useCredits = () => {
  const { profile } = useAuth();
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCreditBalance = async () => {
    if (!profile?.id || profile.user_type !== 'agency') return;

    try {
      const { data, error } = await supabase
        .from('agency_credits')
        .select('credits_balance, updated_at')
        .eq('agency_id', profile.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Error fetching credits:', error);
        return;
      }

      setCreditBalance(data?.credits_balance || 0);
    } catch (error) {
      console.error('Error fetching credit balance:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!profile?.id || profile.user_type !== 'agency') return;

    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('id, transaction_type, credits_amount, description, created_at, listing_id')
        .eq('agency_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      setTransactions((data || []) as CreditTransaction[]);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const purchaseCredits = async (packageSize: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-credit-payment', {
        body: { package_size: packageSize }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating payment session:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-credit-payment', {
        body: { session_id: sessionId }
      });

      if (error) throw error;

      // Refresh balance after successful payment
      await fetchCreditBalance();
      await fetchTransactions();

      return data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  };

  const hasCredits = (required: number = 1) => {
    return creditBalance >= required;
  };

  useEffect(() => {
    if (profile?.id && profile.user_type === 'agency') {
      fetchCreditBalance();
      fetchTransactions();
    }
  }, [profile?.id, profile?.user_type]);

  return {
    creditBalance,
    transactions,
    loading,
    purchaseCredits,
    processPayment,
    hasCredits,
    refreshBalance: fetchCreditBalance,
    refreshTransactions: fetchTransactions
  };
};