import { useAuth } from '@/context/auth-context';
import { plans } from '@/lib/plans';

export type Plan = (typeof plans)[keyof typeof plans];

export function usePlan() {
  const { user, loading } = useAuth();

  if (loading) {
    return {
      plan: null,
      planName: 'core',
      isPro: false,
      isPremium: false,
      loading,
    };
  }

  const planName = user?.stripeRole || 'core';
  const plan = plans[planName as keyof typeof plans];

  return {
    plan,
    planName,
    isPro: planName === 'pro' || planName === 'premium',
    isPremium: planName === 'premium',
    loading,
  };
}