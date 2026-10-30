import { JwtPayload } from "jsonwebtoken";

export interface ipJobItem {
  ip: {
    remote: {
      address: string;
      addressType: string;
      port: number;
    };
  };
  purpose: "upload" | "link-create";
  fileId: number;
  linkId: number;
}

export interface FlatIpLog {
  ip: string;
  purpose: "upload" | "link-create";
  fileId: number;
  linkId: number;
}

export interface Ip {
  ip: {
    remote: {
      address: string;
      addressType: string;
      port: number;
    };
  };
  purpose: "upload" | "link-create";
  fileId?: number;
  linkId?: number;
}

export interface MailPayload {
  to: string;
  subject: string;
  html: string;
}

export interface jwtToken extends JwtPayload {
  id: string;
  username: string;
}

export interface Billing {
  city: string;
  country: string;
  state: string;
  street: string;
  zipcode: string;
}

export interface Customer {
  customer_id: string;
  email: string;
  name: string;
}

export interface PaymentSucceededData {
  payload_type: "Payment";
  billing: Billing;
  brand_id: string;
  business_id: string;
  card_issuing_country: string;
  card_last_four: string;
  card_network: string;
  card_type: string;
  created_at: string;
  currency: string;
  customer: Customer;
  digital_products_delivered: boolean;
  discount_id: string | null;
  disputes: unknown[];
  error_code: string | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  payment_id: string;
  payment_link: string;
  payment_method: string;
  payment_method_type: string | null;
  product_cart: unknown[];
  refunds: unknown[];
  settlement_amount: number;
  settlement_currency: string;
  settlement_tax: number | null;
  status: string;
  subscription_id: string | null;
  tax: number | null;
  total_amount: number;
  updated_at: string | null;
}

export interface WebhookEvent {
  business_id: string;
  type: "payment.succeeded";
  timestamp: string;
  data: PaymentSucceededData;
}
