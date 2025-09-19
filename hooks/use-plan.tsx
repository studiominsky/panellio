import { useAuth } from '@/context/auth-context';
import { plans } from '@/lib/plans';

export function usePlan() {
  const { user } = useAuth();

  const planName = user?.stripeRole || 'core';
  const plan = plans[planName];

  return {
    plan,
    planName,
    isPro: planName === 'pro' || planName === 'premium',
    isPremium: planName === 'premium',
  };
}
