import { loadStripe } from '@stripe/stripe-js';

// Stripe configuration - Production keys
// Replace these with your actual Stripe publishable key from your Stripe dashboard
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_51OQwXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

// Load real Stripe
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export const STRIPE_CONFIG = {
  publishableKey: STRIPE_PUBLISHABLE_KEY,
  secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY || 'sk_live_51OQwXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  isDemo: false, // Always use real payments
};

// Gift amount mappings (in cents) - matching the form options
export const GIFT_AMOUNTS = {
  'Personal Note and photo ($5)': 500, // $5.00
  'Sweet Something ($25)': 2500, // $25.00
  'Thoughtful Present ($50)': 5000, // $50.00
  'Special Gift ($100)': 10000, // $100.00
  'Premium Gift ($250)': 25000, // $250.00
  'Luxury Gift ($500)': 50000, // $500.00
};

// Return processing fee rate (20%)
export const RETURN_PROCESSING_FEE_RATE = 0.20;

// Gift card configuration
export const GIFT_CARD_CONFIG = {
  minAmount: 1000, // $10.00 minimum
  maxAmount: 100000, // $1000.00 maximum
  processingFee: 500, // $5.00 processing fee
}; 