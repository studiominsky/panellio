export const plans = {
  core: {
    name: 'Core',
    price: 'Free',
    limits: {
      directories: 3,
      hasFreeformAi: false,
      storage: 0,
    },
  },
  pro: {
    name: 'Pro',
    price: '1.29€/month',
    limits: {
      directories: Infinity,
      hasFreeformAi: false,
      storage: 1073741824,
    },
  },
  premium: {
    name: 'Premium',
    price: '3.29€/month',
    limits: {
      directories: Infinity,
      hasFreeformAi: true,
      storage: 10737418240,
    },
  },
};

export type PlanName = keyof typeof plans;
