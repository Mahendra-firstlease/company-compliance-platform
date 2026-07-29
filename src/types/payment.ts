/**
 * Razorpay Payment Gateway & Order Types
 */

export interface CreateOrderParams {
  amount: number;
  currency?: string;
  notes?: Record<string, string>;
}

export interface VerifyPaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  applicationIds: string[];
  amount: number;
}
