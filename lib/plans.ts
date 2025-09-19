export const plans = {
  core: {
    name: 'Core',
    price: 'Free',
    limits: {
      directories: 3,
      hasFreeformAi: false,
    },
  },
  pro: {
    name: 'Pro',
    price: '1.29€/month',
    limits: {
      directories: Infinity,
      hasFreeformAi: false,
    },
  },
  premium: {
    name: 'Premium',
    price: '3.29€/month',
    limits: {
      directories: Infinity,
      hasFreeformAi: true,
    },
  },
};

export type PlanName = keyof typeof plans;
