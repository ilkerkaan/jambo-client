/**
 * SaaS API Integration Service
 * 
 * This service handles all communication with the Elixir/Phoenix SaaS backend.
 * Implements flexible booking flow with token-based links.
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
    headers: getHeaders(token),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new SaasApiError(response.status, data);
  }

  return response.json();
}

/**
 * Service class for all SaaS API interactions
 */
export class SaasService {
  private baseUrl = SAAS_API_URL;
  private tenantId = TENANT_ID;

  // ============ AUTHENTICATION ============

  async register(data: {
    email: string;
    password: string;
    name: string;
    businessName: string;
  }): Promise<{ token: string; user: any }> {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // ============ FLEXIBLE BOOKING - PURCHASE ============

  /**
   * Create a purchase (service package)
   * Returns booking token and links for later use
   */
  async createPurchase(data: {
    serviceId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    payNow: boolean;
    couponCode?: string;
  }): Promise<{
    success: boolean;
    data: {
      purchaseId: string;
      bookingToken: string;
      bookingLink: string;
      paymentToken: string;
      paymentLink: string;
      statusLink: string;
      whatsappShareLink: string;
      totalAmount: number;
      sessionsIncluded: number;
      expiresAt: string;
    };
  }> {
    return apiCall('/purchases', {
      method: 'POST',
      body: JSON.stringify({ ...data, tenantId: this.tenantId }),
    });
  }

  /**
   * Verify booking token and get purchase info
   */
  async verifyBookingToken(token: string): Promise<{
    success: boolean;
    data: {
      purchaseId: string;
      customer: { name: string; email: string; phone: string };
      service: { name: string; durationMinutes: number };
      sessionsRemaining: number;
      paymentStatus: 'pending' | 'paid';
      canBookWithoutPayment: boolean;
      tokenValid: boolean;
      expiresAt: string;
    };
  }> {
    return apiCall(`/book/verify-token?token=${token}`);
  }

  /**
   * Create appointment with token
   */
  async createAppointmentWithToken(data: {
    token: string;
    bookingDate: string;
    startTime: string;
  }): Promise<{
    success: boolean;
    data: {
      appointmentId: string;
      rescheduleToken: string;
      rescheduleLink: string;
      status: 'pending' | 'confirmed';
      requiresPayment: boolean;
    };
  }> {
    return apiCall('/book/create-appointment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============ FLEXIBLE BOOKING - RESCHEDULE ============

  /**
   * Get reschedule information
   */
  async getRescheduleInfo(token: string): Promise<{
    success: boolean;
    data: {
      appointmentId: string;
      currentBooking: { date: string; time: string };
      rescheduleCount: number;
      maxReschedules: number;
      canReschedule: boolean;
    };
  }> {
    return apiCall(`/book/reschedule-info?token=${token}`);
  }

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(data: {
    token: string;
    newDate: string;
    newTime: string;
  }): Promise<{
    success: boolean;
    data: {
      appointmentId: string;
      newDate: string;
      newTime: string;
      rescheduleCount: number;
      message: string;
    };
  }> {
    return apiCall('/book/reschedule', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============ FLEXIBLE BOOKING - PAYMENT ============

  /**
   * Verify payment token
   */
  async verifyPaymentToken(token: string): Promise<{
    success: boolean;
    data: {
      purchaseId: string;
      amount: number;
      currency: string;
      service: string;
      customer: { name: string; phone: string };
      paymentStatus: 'pending' | 'paid';
    };
  }> {
    return apiCall(`/pay/verify-token?token=${token}`);
  }

  /**
   * Process M-Pesa payment
   */
  async processMpesaPayment(data: {
    token: string;
    phoneNumber: string;
  }): Promise<{
    success: boolean;
    data: {
      checkoutRequestId: string;
      message: string;
    };
  }> {
    return apiCall('/pay/mpesa', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============ FLEXIBLE BOOKING - STATUS ============

  /**
   * Get booking status (all appointments and purchase info)
   */
  async getBookingStatus(token: string): Promise<{
    success: boolean;
    data: {
      purchase: {
        id: string;
        service: string;
        totalSessions: number;
        remainingSessions: number;
        paymentStatus: 'pending' | 'paid';
        expiresAt: string;
      };
      appointments: Array<{
        id: string;
        date: string;
        time: string;
        status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
        rescheduleLink?: string;
      }>;
      bookingLink: string;
      paymentLink?: string;
    };
  }> {
    return apiCall(`/booking/status?token=${token}`);
  }

  // ============ AVAILABILITY ============

  /**
   * Get available dates for a service
   */
  async getAvailableDates(serviceId: string): Promise<{
    success: boolean;
    data: {
      availableDates: Array<{
        date: string;
        isAvailable: boolean;
        availableSlots: number;
      }>;
    };
  }> {
    return apiCall(
      `/availability/dates?service_id=${serviceId}&tenant_id=${this.tenantId}`
    );
  }

  /**
   * Get available slots for a specific date
   */
  async getAvailableSlots(serviceId: string, date: string): Promise<{
    success: boolean;
    data: {
      slots: Array<{
        time: string;
        available: boolean;
        staffId: string;
        staffName: string;
      }>;
    };
  }> {
    return apiCall(
      `/availability/slots?service_id=${serviceId}&date=${date}&tenant_id=${this.tenantId}`
    );
  }

  // ============ SERVICES/PRODUCTS ============

  /**
   * Get all services for this tenant
   */
  async getServices(): Promise<{
    success: boolean;
    data: {
      services: Array<{
        id: string;
        name: string;
        description: string;
        price: number;
        currency: string;
        durationMinutes: number;
        sessionsIncluded: number;
        isActive: boolean;
      }>;
    };
  }> {
    return apiCall(`/services?tenant_id=${this.tenantId}`);
  }

  /**
   * Get single service details
   */
  async getService(serviceId: string): Promise<{
    success: boolean;
    data: {
      id: string;
      name: string;
      description: string;
      price: number;
      currency: string;
      durationMinutes: number;
      sessionsIncluded: number;
      isActive: boolean;
    };
  }> {
    return apiCall(`/services/${serviceId}?tenant_id=${this.tenantId}`);
  }

  // ============ COUPONS ============

  /**
   * Validate coupon code
   */
  async validateCoupon(code: string): Promise<{
    success: boolean;
    data: {
      code: string;
      discountType: 'percentage' | 'fixed';
      discountValue: number;
      isValid: boolean;
      message: string;
    };
  }> {
    return apiCall(`/coupons/validate?code=${code}&tenant_id=${this.tenantId}`);
  }

  // ============ AFFILIATES ============

  /**
   * Track affiliate referral
   */
  async trackAffiliateReferral(data: {
    affiliateCode: string;
    purchaseId: string;
    amount: number;
  }): Promise<{
    success: boolean;
    data: {
      referralId: string;
      commission: number;
      message: string;
    };
  }> {
    return apiCall('/affiliates/track-referral', {
      method: 'POST',
      body: JSON.stringify({ ...data, tenantId: this.tenantId }),
    });
  }

  // ============ ADMIN OPERATIONS ============

  /**
   * Get all purchases for admin
   */
  async getPurchases(token: string): Promise<{
    success: boolean;
    data: {
      purchases: Array<{
        id: string;
        customerName: string;
        customerEmail: string;
        service: string;
        amount: number;
        paymentStatus: 'pending' | 'paid';
        createdAt: string;
      }>;
    };
  }> {
    return apiCall(`/admin/purchases?tenant_id=${this.tenantId}`, {}, token);
  }

  /**
   * Get all appointments for admin
   */
  async getAppointments(token: string): Promise<{
    success: boolean;
    data: {
      appointments: Array<{
        id: string;
        customerName: string;
        date: string;
        time: string;
        status: string;
        service: string;
      }>;
    };
  }> {
    return apiCall(`/admin/appointments?tenant_id=${this.tenantId}`, {}, token);
  }

  /**
   * Manually create booking link for customer
   */
  async createManualBookingLink(data: {
    customerEmail: string;
    customerPhone: string;
    serviceId: string;
  }, token: string): Promise<{
    success: boolean;
    data: {
      bookingLink: string;
      paymentLink: string;
      whatsappLink: string;
    };
  }> {
    return apiCall('/admin/create-booking-link', {
      method: 'POST',
      body: JSON.stringify({ ...data, tenantId: this.tenantId }),
    }, token);
  }

  /**
   * Send WhatsApp message to customer
   */
  async sendWhatsappMessage(data: {
    phoneNumber: string;
    message: string;
    link?: string;
  }, token: string): Promise<{
    success: boolean;
    data: {
      messageId: string;
      status: string;
    };
  }> {
    return apiCall('/admin/send-whatsapp', {
      method: 'POST',
      body: JSON.stringify({ ...data, tenantId: this.tenantId }),
    }, token);
  }
}

// Export singleton instance
export const saasApi = new SaasService();

