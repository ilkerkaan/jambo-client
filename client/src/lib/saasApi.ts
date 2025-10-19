/**
 * SaaS API Integration Service
 * 
 * This service handles all communication with the Elixir/Phoenix SaaS backend.
 * Environment variables:
 * - VITE_SAAS_API_URL: Base URL of the SaaS backend (e.g., https://api.yoursaas.com)
 * - VITE_TENANT_SLUG: Tenant identifier for this business (e.g., inklessismore)
 */

const SAAS_API_URL = import.meta.env.VITE_SAAS_API_URL || 'http://localhost:4000';
const TENANT_SLUG = import.meta.env.VITE_TENANT_SLUG || 'inklessismore';

interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

class SaasApiError extends Error {
  constructor(public statusCode: number, public data: ApiError) {
    super(data.message);
    this.name = 'SaasApiError';
  }
}

/**
 * Make authenticated request to SaaS API
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${SAAS_API_URL}/api/tenants/${TENANT_SLUG}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new SaasApiError(response.status, data);
  }

  return data;
}

// ============ PRODUCTS/SERVICES ============

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number; // in cents
  currency: string;
  productType: 'appointment' | 'physical' | 'digital' | 'dropshipping' | 'education' | 'subscription';
  sessions?: number; // for appointment packages
  duration?: number; // in minutes
  images?: string[];
  videos?: string[];
  category?: string;
  active: boolean;
  createdAt: string;
}

export async function getProducts(): Promise<Product[]> {
  return apiCall<Product[]>('/products');
}

export async function getProductById(id: string): Promise<Product> {
  return apiCall<Product>(`/products/${id}`);
}

// ============ AVAILABILITY & BOOKING ============

export interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}

export interface AvailabilityResponse {
  date: string;
  slots: TimeSlot[];
}

export async function getAvailability(date: string): Promise<AvailabilityResponse> {
  return apiCall<AvailabilityResponse>(`/availability?date=${date}`);
}

export interface BookingRequest {
  productId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  appointmentDate: string; // ISO 8601 format
  couponCode?: string;
  notes?: string;
}

export interface BookingResponse {
  id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  appointmentDate: string;
  paymentRequired: boolean;
  paymentUrl?: string;
  message: string;
}

export async function createBooking(booking: BookingRequest): Promise<BookingResponse> {
  return apiCall<BookingResponse>('/bookings', {
    method: 'POST',
    body: JSON.stringify(booking),
  });
}

export async function getBookingStatus(bookingId: string): Promise<BookingResponse> {
  return apiCall<BookingResponse>(`/bookings/${bookingId}`);
}

export interface RescheduleRequest {
  newAppointmentDate: string;
  reason?: string;
}

export async function rescheduleBooking(
  bookingId: string,
  request: RescheduleRequest
): Promise<BookingResponse> {
  return apiCall<BookingResponse>(`/bookings/${bookingId}/reschedule`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });
}

export async function cancelBooking(bookingId: string, reason?: string): Promise<BookingResponse> {
  return apiCall<BookingResponse>(`/bookings/${bookingId}/cancel`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });
}

// ============ PAYMENTS ============

export interface PaymentInitiateRequest {
  bookingId: string;
  amount: number; // in cents
  paymentMethod: 'mpesa' | 'card' | 'paypal';
  mpesaPhone?: string; // required for M-Pesa
}

export interface PaymentInitiateResponse {
  paymentId: string;
  status: 'pending' | 'processing';
  message: string;
  checkoutUrl?: string; // for card payments
}

export async function initiatePayment(
  request: PaymentInitiateRequest
): Promise<PaymentInitiateResponse> {
  return apiCall<PaymentInitiateResponse>('/payments/initiate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export interface PaymentStatusResponse {
  paymentId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  paymentReference?: string;
  completedAt?: string;
}

export async function getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
  return apiCall<PaymentStatusResponse>(`/payments/${paymentId}/status`);
}

// ============ COUPONS & AFFILIATES ============

export interface CouponValidationRequest {
  code: string;
}

export interface CouponValidationResponse {
  valid: boolean;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  affiliateName?: string;
  message: string;
}

export async function validateCoupon(
  request: CouponValidationRequest
): Promise<CouponValidationResponse> {
  return apiCall<CouponValidationResponse>('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export interface AffiliateInfo {
  id: string;
  name: string;
  businessName?: string;
  businessType?: string;
  tier: 'standard' | 'trained_ambassador' | 'premium';
  commissionRate: number;
}

export async function getAffiliateInfo(couponCode: string): Promise<AffiliateInfo | null> {
  try {
    return await apiCall<AffiliateInfo>(`/affiliates/by-coupon/${couponCode}`);
  } catch (error) {
    if (error instanceof SaasApiError && error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

// ============ CUSTOMER BOOKINGS ============

export interface CustomerBooking {
  id: string;
  productName: string;
  appointmentDate: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  sessionsRemaining?: number;
  totalSessions?: number;
}

export async function getCustomerBookings(
  email: string,
  phone: string
): Promise<CustomerBooking[]> {
  return apiCall<CustomerBooking[]>(`/customer-bookings?email=${email}&phone=${phone}`);
}

// ============ ERROR HANDLING ============

export { SaasApiError };

export function getErrorMessage(error: unknown): string {
  if (error instanceof SaasApiError) {
    return error.data.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

// ============ CONFIGURATION ============

export const saasConfig = {
  apiUrl: SAAS_API_URL,
  tenantSlug: TENANT_SLUG,
  isConfigured: !!SAAS_API_URL && !!TENANT_SLUG,
};

