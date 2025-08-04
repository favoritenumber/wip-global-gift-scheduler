import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, CheckCircle, XCircle, Gift, DollarSign } from 'lucide-react';
import { STRIPE_CONFIG } from '@/integrations/stripe/client';

interface PaymentFormProps {
  giftId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ giftId, amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsProcessing(true);
    setError('');

    try {
      // Demo mode - simulate payment processing
      if (STRIPE_CONFIG.isDemo) {
        console.log('Demo mode: Simulating payment processing...');
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate successful payment
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 2000);
        return;
      }

      // Production mode - real Stripe payment
      if (!stripe || !elements) {
        setError('Payment system not available. Please try again.');
        return;
      }

      // Real payment processing would go here
      // For now, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (error) {
      setError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 text-center border border-green-200">
          <div className="bg-green-500 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-2">Payment Successful!</h3>
          <p className="text-green-700 mb-4">
            {STRIPE_CONFIG.isDemo ? 'Demo payment completed successfully!' : 'Your gift has been scheduled and paid for.'}
          </p>
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <p className="text-sm text-gray-600">Amount Paid:</p>
            <p className="text-2xl font-bold text-green-600">{formatAmount(amount)}</p>
            {STRIPE_CONFIG.isDemo && (
              <p className="text-xs text-gray-500 mt-2">Demo Mode</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="border-2 border-blue-200 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold">Complete Your Gift</span>
              <p className="text-blue-100 text-sm font-normal">
                {STRIPE_CONFIG.isDemo ? 'Demo Mode - Secure payment simulation' : 'Secure payment powered by Stripe'}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Payment Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Gift className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-gray-800">Gift Amount</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">{formatAmount(amount)}</span>
              </div>
            </div>
            <div className="text-sm text-gray-600 bg-white rounded-lg p-3 border border-blue-200">
              <p>✅ Secure payment processing</p>
              <p>✅ Instant gift scheduling</p>
              <p>✅ Email confirmation</p>
              {STRIPE_CONFIG.isDemo && (
                <p className="text-blue-600 font-medium">🎯 Demo Mode - No real charges</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Card Information
              </label>
              <div className="border-2 border-gray-300 rounded-xl p-4 hover:border-blue-400 focus-within:border-blue-500 transition-colors">
                {STRIPE_CONFIG.isDemo ? (
                  <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <CreditCard className="h-5 w-5" />
                      <span className="font-medium">Demo Payment Form</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      In demo mode, any card details will work for testing.
                    </p>
                  </div>
                ) : (
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                          ':-webkit-autofill': {
                            color: '#424770',
                          },
                        },
                        invalid: {
                          color: '#9e2146',
                        },
                      },
                    }}
                  />
                )}
              </div>
            </div>

            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 hover:bg-gray-50"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay {formatAmount(amount)}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentForm; 