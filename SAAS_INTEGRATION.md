# SaaS Integration Guide

This document explains how the Inkless Is More Next.js website is prepared for integration with the Elixir/Phoenix SaaS backend.

## Architecture Overview

```
┌─────────────────────────────┐
│  Next.js Frontend           │
│  (Inkless Is More)          │
│  www.inklessismore.ke       │
└──────────────┬──────────────┘
               │ HTTPS API Calls
               ▼
┌─────────────────────────────┐
│  Elixir/Phoenix SaaS        │
│  Backend                    │
│  api.yoursaas.com           │
└─────────────────────────────┘
```

## Environment Variables

Configure these in your deployment environment:

```bash
# SaaS Backend URL
VITE_SAAS_API_URL=https://api.yoursaas.com  # or http://localhost:4000 for development

# Tenant Identifier
VITE_TENANT_SLUG=inklessismore
```

## API Integration Service

The frontend uses a centralized API service: `client/src/lib/saasApi.ts`

### Features:

- **Type-safe API calls** with TypeScript interfaces
- **Error handling** with custom `SaasApiError` class
- **Demo mode** - works without backend for development
- **Automatic error recovery** - falls back to demo data on errors

### Usage Example:

```typescript
import { getProducts, createBooking } from '@/lib/saasApi';

// Get available packages
const products = await getProducts();

// Create a booking
const booking = await createBooking({
  productId: 'pkg_123',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '+254712345678',
  appointmentDate: '2025-01-20T10:00:00Z',
  couponCode: 'AFFILIATE123',
});
```

## Booking Page Integration

The booking page (`client/src/pages/Booking.tsx`) is fully integrated with the SaaS API:

### Step 1: Product Selection
- Fetches available packages from `/api/tenants/:slug/products`
- Displays pricing and session information
- Falls back to demo products if backend unavailable

### Step 2: Date & Time Selection
- Queries `/api/tenants/:slug/availability?date=YYYY-MM-DD`
- Shows real-time available time slots
- Prevents double-booking

### Step 3: Customer Details
- Collects customer information
- Validates coupon codes via `/api/tenants/:slug/coupons/validate`
- Calculates final price with discount

### Step 4: Booking Confirmation
- Submits booking via `/api/tenants/:slug/bookings`
- Handles M-Pesa payment redirect if needed
- Shows confirmation with booking ID

## API Endpoints Required

The SaaS backend must provide these endpoints:

### Products/Services
```
GET  /api/tenants/:slug/products
GET  /api/tenants/:slug/products/:id
```

### Availability & Booking
```
GET  /api/tenants/:slug/availability?date=YYYY-MM-DD
POST /api/tenants/:slug/bookings
GET  /api/tenants/:slug/bookings/:id
PUT  /api/tenants/:slug/bookings/:id/reschedule
PUT  /api/tenants/:slug/bookings/:id/cancel
```

### Payments
```
POST /api/tenants/:slug/payments/initiate
GET  /api/tenants/:slug/payments/:id/status
```

### Coupons & Affiliates
```
POST /api/tenants/:slug/coupons/validate
GET  /api/tenants/:slug/affiliates/by-coupon/:code
```

### Customer Bookings
```
GET  /api/tenants/:slug/customer-bookings?email=...&phone=...
```

## Response Formats

### Product Response
```json
{
  "id": "pkg_123",
  "name": "3-Session Package",
  "description": "Ideal for medium-sized tattoos",
  "price": 120000,
  "currency": "KES",
  "productType": "appointment",
  "sessions": 3,
  "duration": 30,
  "images": ["https://s3.example.com/img1.jpg"],
  "videos": ["https://youtube.com/watch?v=..."],
  "active": true,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### Availability Response
```json
{
  "date": "2025-01-20",
  "slots": [
    { "date": "2025-01-20", "time": "09:00", "available": true },
    { "date": "2025-01-20", "time": "10:00", "available": true },
    { "date": "2025-01-20", "time": "11:00", "available": false }
  ]
}
```

### Booking Response
```json
{
  "id": "booking_123",
  "status": "confirmed",
  "appointmentDate": "2025-01-20T10:00:00Z",
  "paymentRequired": true,
  "paymentUrl": "https://api.yoursaas.com/pay/session_123",
  "message": "Booking confirmed. Redirecting to payment..."
}
```

### Coupon Validation Response
```json
{
  "valid": true,
  "code": "SALON123",
  "discountType": "percentage",
  "discountValue": 15,
  "affiliateName": "Beauty Salon XYZ",
  "message": "Coupon applied successfully"
}
```

## Error Handling

The API service handles errors gracefully:

```typescript
try {
  const products = await getProducts();
} catch (error) {
  if (error instanceof SaasApiError) {
    console.error(`API Error (${error.statusCode}): ${error.data.message}`);
  }
}
```

## Demo Mode

When `VITE_SAAS_API_URL` is not configured, the booking page operates in demo mode:

- Shows demo products (Single Session, 3-Pack, 5-Pack)
- Provides demo time slots
- Accepts any coupon code with 10% discount
- Creates fake bookings with demo IDs

This allows testing the UI without a backend.

## CORS Configuration

The SaaS backend must allow CORS requests from the frontend domain:

```
Access-Control-Allow-Origin: https://www.inklessismore.ke
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Authentication

Currently, the booking flow is unauthenticated (public). For admin panel access, use the existing Manus OAuth integration.

Future enhancement: Add JWT tokens for customer account management.

## Testing Checklist

- [ ] Backend API running at configured URL
- [ ] CORS headers properly configured
- [ ] All endpoints return correct response formats
- [ ] M-Pesa payment flow works
- [ ] Coupon validation works
- [ ] Email notifications sent
- [ ] SMS notifications sent
- [ ] Booking confirmation page displays correctly

## Deployment Steps

1. **Set environment variables:**
   ```bash
   VITE_SAAS_API_URL=https://api.yoursaas.com
   VITE_TENANT_SLUG=inklessismore
   ```

2. **Deploy Next.js frontend** to Vercel or your hosting

3. **Deploy Elixir backend** to Fly.io or your hosting

4. **Test booking flow** end-to-end

5. **Monitor logs** for any API errors

## Troubleshooting

### "SaaS backend not configured" warning
- Set `VITE_SAAS_API_URL` and `VITE_TENANT_SLUG` environment variables
- Restart the development server

### API calls returning 404
- Verify backend is running and accessible
- Check `VITE_SAAS_API_URL` is correct
- Verify `VITE_TENANT_SLUG` matches backend tenant

### CORS errors
- Check backend CORS configuration
- Ensure `Access-Control-Allow-Origin` header is set
- Verify frontend domain is whitelisted

### Bookings not saving
- Check backend database connection
- Verify M-Pesa integration is working
- Check backend logs for errors

## Next Steps

1. Build the Elixir/Phoenix SaaS backend
2. Implement all required API endpoints
3. Test with real M-Pesa integration
4. Deploy to production
5. Monitor performance and user feedback

---

**Status:** ✅ Frontend ready for SaaS integration
**Last Updated:** 2025-01-20

