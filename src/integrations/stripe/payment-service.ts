import { supabase } from '@/integrations/supabase/client';
import { GIFT_AMOUNTS } from './client';

export class PaymentService {
  static async createPaymentIntent(giftId: string, amount: number) {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          giftId,
          amount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  static async processGiftPayment(giftId: string, paymentIntentId: string) {
    try {
      // Update gift status to paid
      const { error } = await supabase
        .from('gifts')
        .update({ 
          status: 'paid',
          payment_intent_id: paymentIntentId,
          paid_at: new Date().toISOString()
        })
        .eq('id', giftId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error processing gift payment:', error);
      throw error;
    }
  }

  static async processReturn(giftId: string, returnAmount: number) {
    try {
      const response = await fetch('/api/process-refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          giftId,
          returnAmount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process refund');
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing return:', error);
      throw error;
    }
  }

  static async createGiftCard(giftId: string, amount: number) {
    try {
      // Gift card functionality would be implemented here
      // For now, just log the gift ID
      console.log('Gift card would be created for:', giftId);

      return { success: true };
    } catch (error) {
      console.error('Error creating gift card:', error);
      throw error;
    }
  }
} 