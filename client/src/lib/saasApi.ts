/**
 * SaaS API Integration Service
 * 
 * This service handles all communication with the Elixir/Phoenix SaaS backend.
 * Implements all endpoints from the SaaS Backend Handoff Document.
 * 
 * Environment variables:
 * - VITE_SAAS_API_URL: Base URL of the SaaS backend (e.g., https://api.yoursaas.com)
 * - VITE_TENANT_ID: Tenant UUID for this business
 */

const SAAS_API_URL = import.meta.env.VITE_SAAS_API_URL || 'http://localhost:4000';
const TENANT_ID = import.meta.env.VITE_TENANT_ID || 'default-tenant-id';

interface ApiError {
  success: boolean;
  error?: string;
  message: string;
}

export class SaasApiError extends Error {
  constructor(public statusCode: number, public data: ApiError) {
    super(data.message);
    this.name = 'SaasApiError';
  }
}

/**
 * Helper function to build headers with optional auth token
 */
function getHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Make authenticated request to SaaS API
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const url = `${SAAS_API_URL}/api${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(token),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new SaasApiError(response.status, data);
  }

  return data.data || data;
}

// ============ AUTHENTICATION ============

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'owner' | 'staff' | 'customer';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  token: string;
  refresh_token?: string;
}

export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  return apiCall<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  return apiCall<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============ TENANT ENDPOINTS ============

export interface TenantInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp_number?: string;
  address?: string;
  description?: string;
  logo_url?: string;
  primary_color?: string;
  accent_color?: string;
  website_url?: string;
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
  updated_at: string;
}

export async function getTenantInfo(): Promise<TenantInfo> {
  return apiCall<TenantInfo>(`/tenants/${TENANT_ID}`);
}

export async function updateTenant(data: Partial<TenantInfo>, token: string): Promise<TenantInfo> {
  return apiCall<TenantInfo>(
    `/tenants/${TENANT_ID}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    token
  );
}

// ============ SERVICES/PRODUCTS ============

export interface Service {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  category: 'appointment' | 'physical' | 'digital' | 'course';
  duration_minutes?: number;
  price: number;
  original_price?: number;
  image_url?: string;
  video_url?: string;
  is_active: boolean;
  display_order?: number;
  sessions_included?: number;
  validity_days?: number;
  created_at: string;
  updated_at: string;
}

export async function getServices(): Promise<Service[]> {
  return apiCall<Service[]>(`/tenants/${TENANT_ID}/services`);
}

export async function createService(data: Partial<Service>, token: string): Promise<Service> {
  return apiCall<Service>(
    `/tenants/${TENANT_ID}/services`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    token
  );
}

export async function updateService(
  serviceId: string,
  data: Partial<Service>,
  token: string
): Promise<Service> {
  return apiCall<Service>(
    `/tenants/${TENANT_ID}/services/${serviceId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    token
  );
}

export async function deleteService(serviceId: string, token: string): Promise<void> {
  return apiCall<void>(
    `/tenants/${TENANT_ID}/services/${serviceId}`,
    { method: 'DELETE' },
    token
  );
}

// ============ AVAILABILITY & BOOKING ============

export interface AvailableSlot {
  date: string;
  time: string;
  staff_id: string;
  staff_name: string;
}

export interface AvailabilityResponse {
  available_slots: AvailableSlot[];
}

export async function getAvailableSlots(
  serviceId: string,
  staffId?: string,
  dateFrom?: string,
  dateTo?: string
): Promise<AvailabilityResponse> {
  const params = new URLSearchParams();
  params.append('service_id', serviceId);
  if (staffId) params.append('staff_id', staffId);
  if (dateFrom) params.append('date_from', dateFrom);
  if (dateTo) params.append('date_to', dateTo);

  return apiCall<AvailabilityResponse>(`/tenants/${TENANT_ID}/availability?${params}`);
}

export interface BookingRequest {
  service_id: string;
  staff_id?: string;
  customer_id?: string;
  booking_date: string;
  start_time: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  coupon_code?: string;
}

export interface BookingResponse {
  id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  amount: number;
  discount?: number;
  final_amount: number;
  payment_url?: string;
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
}

export async function createBooking(data: BookingRequest): Promise<BookingResponse> {
  return apiCall<BookingResponse>(
    `/tenants/${TENANT_ID}/bookings`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export interface Booking extends BookingResponse {
  service_id: string;
  staff_id?: string;
  customer_id?: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  notes?: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  coupon_code?: string;
  affiliate_id?: string;
  payment_method?: 'mpesa' | 'stripe' | 'card';
  payment_id?: string;
}

export async function getBooking(bookingId: string): Promise<Booking> {
  return apiCall<Booking>(`/tenants/${TENANT_ID}/bookings/${bookingId}`);
}

export async function getBookingStatus(bookingId: string): Promise<{
  status: string;
  payment_method: string;
  transaction_id?: string;
  amount: number;
}> {
  return apiCall(`/tenants/${TENANT_ID}/bookings/${bookingId}/payment-status`);
}

export async function getCustomerBookings(customerId: string, token: string): Promise<Booking[]> {
  return apiCall<Booking[]>(
    `/tenants/${TENANT_ID}/bookings?customer_id=${customerId}`,
    {},
    token
  );
}

export async function cancelBooking(bookingId: string, token: string): Promise<{
  success: boolean;
  refund_info?: any;
}> {
  return apiCall(
    `/tenants/${TENANT_ID}/bookings/${bookingId}`,
    { method: 'DELETE' },
    token
  );
}

// ============ STAFF MANAGEMENT ============

export interface Staff {
  id: string;
  tenant_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'staff';
  status: 'active' | 'inactive' | 'suspended';
  specialization?: string;
  bio?: string;
  profile_photo_url?: string;
  working_hours?: Record<string, { start: string; end: string }>;
  created_at: string;
}

export async function getStaff(): Promise<Staff[]> {
  return apiCall<Staff[]>(`/tenants/${TENANT_ID}/staff`);
}

export async function createStaff(data: Partial<Staff>, token: string): Promise<Staff> {
  return apiCall<Staff>(
    `/tenants/${TENANT_ID}/staff`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    token
  );
}

export async function updateStaffAvailability(
  staffId: string,
  data: { date: string; available_slots: Array<{ start_time: string; end_time: string }> },
  token: string
): Promise<Staff> {
  return apiCall<Staff>(
    `/tenants/${TENANT_ID}/staff/${staffId}/availability`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    token
  );
}

// ============ CUSTOMERS ============

export interface Customer {
  id: string;
  tenant_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'customer';
  status: 'active' | 'inactive' | 'suspended';
  loyalty_points: number;
  total_spent: number;
  preferred_staff_id?: string;
  created_at: string;
}

export async function getCustomers(token: string): Promise<Customer[]> {
  return apiCall<Customer[]>(`/tenants/${TENANT_ID}/customers`, {}, token);
}

export async function getCustomerProfile(customerId: string, token: string): Promise<Customer> {
  return apiCall<Customer>(`/tenants/${TENANT_ID}/customers/${customerId}`, {}, token);
}

export interface CustomerPackage {
  id: string;
  package_id: string;
  sessions_remaining: number;
  purchase_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'completed';
}

export async function getCustomerPackages(customerId: string, token: string): Promise<CustomerPackage[]> {
  return apiCall<CustomerPackage[]>(
    `/tenants/${TENANT_ID}/customers/${customerId}/packages`,
    {},
    token
  );
}

// ============ COUPONS & AFFILIATES ============

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses?: number;
  current_uses: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
}

export interface CouponValidationResponse {
  valid: boolean;
  discount_amount?: number;
  message: string;
}

export async function validateCoupon(
  couponCode: string,
  amount: number
): Promise<CouponValidationResponse> {
  return apiCall<CouponValidationResponse>(
    `/tenants/${TENANT_ID}/coupons/${couponCode}/validate?amount=${amount}`
  );
}

export async function createCoupon(data: Partial<Coupon>, token: string): Promise<Coupon> {
  return apiCall<Coupon>(
    `/tenants/${TENANT_ID}/coupons`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    token
  );
}

export interface AffiliateStats {
  referrals_count: number;
  conversion_rate: number;
  total_commission: number;
  pending_commission: number;
}

export async function getAffiliateStats(affiliateId: string, token: string): Promise<AffiliateStats> {
  return apiCall<AffiliateStats>(
    `/tenants/${TENANT_ID}/affiliates/${affiliateId}/stats`,
    {},
    token
  );
}

export interface AffiliateCommission {
  id: string;
  booking_id: string;
  commission_type: 'regular' | 'ambassador';
  commission_rate: number;
  commission_amount: number;
  status: 'pending' | 'approved' | 'paid';
  payment_date?: string;
  created_at: string;
}

export async function getAffiliateCommissions(
  affiliateId: string,
  token: string
): Promise<AffiliateCommission[]> {
  return apiCall<AffiliateCommission[]>(
    `/tenants/${TENANT_ID}/affiliates/${affiliateId}/commissions`,
    {},
    token
  );
}

// ============ PAYMENTS ============

export interface PaymentInitiateRequest {
  booking_id: string;
  phone_number?: string;
  amount: number;
}

export interface PaymentInitiateResponse {
  checkout_request_id?: string;
  payment_url?: string;
  client_secret?: string;
  payment_intent_id?: string;
}

export async function initiateMpesaPayment(
  bookingId: string,
  phoneNumber: string,
  amount: number
): Promise<PaymentInitiateResponse> {
  return apiCall<PaymentInitiateResponse>(
    `/tenants/${TENANT_ID}/payments/mpesa/initiate`,
    {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId, phone_number: phoneNumber, amount }),
    }
  );
}

export async function initiateStripePayment(
  bookingId: string,
  amount: number
): Promise<PaymentInitiateResponse> {
  return apiCall<PaymentInitiateResponse>(
    `/tenants/${TENANT_ID}/payments/stripe/create-intent`,
    {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId, amount }),
    }
  );
}

// ============ ANALYTICS ============

export interface DashboardAnalytics {
  total_bookings: number;
  total_revenue: number;
  average_booking_value: number;
  customer_count: number;
  occupancy_rate: number;
  charts?: Record<string, any>;
}

export async function getDashboardAnalytics(period: string, token: string): Promise<DashboardAnalytics> {
  return apiCall<DashboardAnalytics>(
    `/tenants/${TENANT_ID}/analytics/dashboard?period=${period}`,
    {},
    token
  );
}

export interface RevenueData {
  date: string;
  revenue: number;
  bookings_count: number;
}

export async function getRevenueAnalytics(
  dateFrom: string,
  dateTo: string,
  token: string
): Promise<RevenueData[]> {
  return apiCall<RevenueData[]>(
    `/tenants/${TENANT_ID}/analytics/revenue?date_from=${dateFrom}&date_to=${dateTo}`,
    {},
    token
  );
}

export interface CustomerAnalytics {
  new_customers: number;
  returning_customers: number;
  churn_rate: number;
}

export async function getCustomerAnalytics(period: string, token: string): Promise<CustomerAnalytics> {
  return apiCall<CustomerAnalytics>(
    `/tenants/${TENANT_ID}/analytics/customers?period=${period}`,
    {},
    token
  );
}

// ============ NOTIFICATIONS ============

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'push';
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
}

export async function getNotifications(token: string): Promise<Notification[]> {
  return apiCall<Notification[]>(`/tenants/${TENANT_ID}/notifications`, {}, token);
}

export async function markNotificationAsRead(notificationId: string, token: string): Promise<void> {
  return apiCall<void>(
    `/tenants/${TENANT_ID}/notifications/${notificationId}/read`,
    { method: 'PUT' },
    token
  );
}

export interface NotificationPreferences {
  email_enabled: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  push_enabled?: boolean;
}

export async function updateNotificationPreferences(
  preferences: NotificationPreferences,
  token: string
): Promise<void> {
  return apiCall<void>(
    `/tenants/${TENANT_ID}/notifications/preferences`,
    {
      method: 'POST',
      body: JSON.stringify(preferences),
    },
    token
  );
}

// ============ ERROR HANDLING ============

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
  tenantId: TENANT_ID,
  isConfigured: !!SAAS_API_URL && !!TENANT_ID,
};

