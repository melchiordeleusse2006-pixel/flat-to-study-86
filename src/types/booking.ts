export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type PaymentType = 'security_deposit' | 'first_month' | 'monthly_rent';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Booking {
  id: string;
  listing_id: string;
  tenant_id: string;
  landlord_id: string;
  status: BookingStatus;
  check_in_date: string;
  check_out_date: string;
  monthly_rent: number;
  security_deposit: number;
  total_amount: number;
  stripe_payment_intent_id?: string;
  contract_signed_at?: string;
  contract_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentSchedule {
  id: string;
  booking_id: string;
  payment_type: PaymentType;
  amount: number;
  due_date: string;
  status: PaymentStatus;
  stripe_payment_intent_id?: string;
  paid_at?: string;
  created_at: string;
}

export interface ListingAvailability {
  id: string;
  listing_id: string;
  date: string;
  is_available: boolean;
  price_override?: number;
  created_at: string;
}

export interface BookingFormData {
  check_in_date: string;
  check_out_date: string;
  message?: string;
}