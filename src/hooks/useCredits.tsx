import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface CreditInfo {
  creditsRemaining: number;
  dailyLimit: number;
  role: string;
}

export const useCredits = () => {
  const { user } = useAuth();
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get user credits
      const { data: creditsData, error: creditsError } = await supabase
        .rpc('get_user_credits', { user_id: user.id })
        .single();

      if (creditsError) throw creditsError;

      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError) throw roleError;

      setCreditInfo({
        creditsRemaining: creditsData.credits_remaining,
        dailyLimit: creditsData.daily_limit,
        role: roleData.role
      });
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [user]);

  const useCredit = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('use_credit', { user_id: user.id });

      if (error) throw error;

      if (data) {
        await fetchCredits(); // Refresh credit info
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error using credit:', error);
      return false;
    }
  };

  return {
    creditInfo,
    loading,
    fetchCredits,
    useCredit
  };
};
