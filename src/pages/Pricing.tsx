import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check, Crown } from 'lucide-react';

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = (tier: 'monthly' | 'quarterly' | 'yearly') => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/checkout/${tier}`);
  };

  const plans = [
    {
      name: 'Monthly',
      price: '1,000',
      period: '/month',
      tier: 'monthly' as const,
      features: [
        'Full access to all premium courses',
        'AI Tutor assistance (unlimited)',
        'Downloadable PDF notes',
        'Priority support',
      ],
      popular: false,
    },
    {
      name: 'Quarterly',
      price: '3,500',
      period: '/3 months',
      tier: 'quarterly' as const,
      features: [
        'Everything in Monthly',
        'Save ₨ 500 compared to monthly',
        '1-on-1 mock interview session',
        'Essay evaluation (1 per month)',
      ],
      popular: true,
    },
    {
      name: 'Yearly',
      price: '9,000',
      period: '/year',
      tier: 'yearly' as const,
      features: [
        'Everything in Quarterly',
        'Save ₨ 3,000 compared to monthly',
        'Unlimited essay evaluations',
        'Direct WhatsApp access to instructors',
      ],
      popular: false,
    },
  ];

  return (
    <div className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Invest in your future today
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Choose the plan that fits your preparation timeline. All plans include access to our AI Tutor and premium content.
        </p>

        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 ring-1 xl:p-10 ${
                plan.popular
                  ? 'bg-gray-900 ring-gray-900 text-white shadow-2xl'
                  : 'bg-white ring-gray-200 text-gray-900'
              }`}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3 className={`text-lg font-semibold leading-8 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                {plan.popular && (
                  <p className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold leading-5 text-blue-400">
                    Most popular
                  </p>
                )}
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-500">
                Perfect for dedicated CSS/PMS aspirants.
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className={`text-4xl font-bold tracking-tight ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  ₨ {plan.price}
                </span>
                <span className={`text-sm font-semibold leading-6 ${plan.popular ? 'text-gray-300' : 'text-gray-600'}`}>
                  {plan.period}
                </span>
              </p>
              <button
                onClick={() => handleSubscribe(plan.tier)}
                className={`mt-6 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  plan.popular
                    ? 'bg-blue-500 text-white hover:bg-blue-400 focus-visible:outline-blue-500'
                    : 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600'
                }`}
              >
                {user?.subscriptionTier === plan.tier ? 'Current Plan' : 'Subscribe Now'}
              </button>
              <ul className={`mt-8 space-y-3 text-sm leading-6 ${plan.popular ? 'text-gray-300' : 'text-gray-600'}`}>
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check className={`h-6 w-5 flex-none ${plan.popular ? 'text-blue-400' : 'text-blue-600'}`} aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
