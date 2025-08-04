# Stripe Production Setup Guide

## 🔑 Get Your Real Stripe Keys

### Step 1: Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete your business verification

### Step 2: Get Production Keys
1. Log into your Stripe Dashboard
2. Go to **Developers** → **API Keys**
3. Copy your **Publishable key** (starts with `pk_live_`)
4. Copy your **Secret key** (starts with `sk_live_`)

### Step 3: Add Keys to Environment
Create a `.env` file in your project root:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_publishable_key_here
VITE_STRIPE_SECRET_KEY=sk_live_your_actual_secret_key_here
```

### Step 4: Update the Code
Replace the placeholder keys in `src/integrations/stripe/client.ts`:

```typescript
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_your_actual_key_here';
```

## 🚀 Deploy with Real Keys

### For Lovable Deployment:
1. Add the environment variables in your Lovable dashboard
2. Or use the `.env` file if supported

### For Local Testing:
1. Create `.env` file with your keys
2. Restart your development server

## 💳 Test Cards for Production

Use these test cards in production mode:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Expiry**: Any future date
- **CVC**: Any 3 digits

## ⚠️ Important Notes

1. **Never commit real keys** to Git
2. **Use environment variables** for security
3. **Test thoroughly** before going live
4. **Monitor transactions** in Stripe dashboard

## 🔧 Current Status

The app is now configured for **real production payments** with Stripe. The payment form will:
- ✅ Accept real credit cards
- ✅ Process actual payments
- ✅ Show real Stripe elements
- ✅ Handle payment errors properly

**Replace the placeholder keys with your real Stripe keys to enable production payments!** 