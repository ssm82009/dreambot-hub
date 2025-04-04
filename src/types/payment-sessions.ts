
export interface PaymentSession {
  id: string;
  user_id: string;
  plan_type: string;
  amount: number;
  session_id: string | null;
  transaction_identifier: string | null;
  payment_method: string;
  created_at: string;
  expires_at: string;
  completed: boolean | null;
  status: string | null;
}

export interface CreatePaymentSessionData {
  user_id: string;
  plan_type: string;
  amount: number;
  session_id: string;
  payment_method: string;
}

export interface UpdatePaymentSessionData {
  transaction_identifier?: string;
  completed?: boolean;
  status?: string;
}
