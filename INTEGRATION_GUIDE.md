# Inkless Is More - Integration Guide

This document explains how the Next.js website integrates with your Elixir/Phoenix SaaS backend and provides guidance for making this a multi-tenant platform.

## Current Architecture

### Frontend (Next.js)
- **Location**: This repository
- **Purpose**: Customer-facing website for Inkless Is More
- **Features**:
  - Homepage with branding and testimonials
  - Services page with dynamic package loading
  - Booking page (placeholder for SaaS integration)
  - Admin panel for business owners to manage content

### Backend (Current - tRPC/Express)
- **Location**: This repository (`server/`)
- **Purpose**: Temporary backend for development
- **Database**: MySQL/TiDB with Drizzle ORM
- **Features**:
  - Tenant management
  - Service package management
  - Purchase tracking
  - Appointment scheduling
  - Coupon/affiliate system

### Backend (Future - Elixir/Phoenix SaaS)
- **Location**: Separate repository (to be created)
- **Purpose**: Multi-tenant SaaS platform serving all clients
- **Features**:
  - Real-time calendar with availability
  - M-Pesa payment integration
  - SMS/Email notifications
  - Affiliate commission tracking
  - Multi-tenant data isolation

---

## Database Schema

The database is designed to support multiple tenants (businesses) from day one.

### Core Tables

#### `tenants`
Stores business information for each client.

```sql
- id: Primary key
- name: Business name (e.g., "Inkless Is More")
- slug: URL-friendly identifier (e.g., "inklessismore")
- domain: Custom domain (optional)
- logoUrl: Logo image URL
- primaryColor: Brand primary color (hex)
- accentColor: Brand accent color (hex)
- description: Business description
- phone, email, whatsappNumber: Contact info
- address: Physical address
- currency: Default currency (e.g., "KSh")
- timezone: Business timezone
- bookingEnabled: Enable/disable booking
- ownerId: User ID of business owner
```

#### `service_packages`
Service offerings that each business can customize.

```sql
- id: Primary key
- tenantId: Foreign key to tenants
- name: Package name
- description: Package description
- price: Price in cents (e.g., 1000000 = KSh 10,000)
- originalPrice: Original price for showing discounts
- sessionsIncluded: Number of sessions in package
- isPopular: Highlight as popular
- badge: Display badge (e.g., "Best Value")
- displayOrder: Sort order
- isActive: Show/hide package
```

#### `purchases`
Customer purchases of service packages.

```sql
- id: Primary key
- tenantId: Foreign key to tenants
- packageId: Foreign key to service_packages
- customerName, customerEmail, customerPhone: Customer info
- amountPaid: Final amount paid (after discounts)
- sessionsTotal: Total sessions purchased
- sessionsRemaining: Sessions not yet used
- paymentMethod: mpesa | card | cash
- paymentStatus: pending | completed | failed | refunded
- transactionId: Payment gateway transaction ID
- couponCode: Applied coupon code
- discountAmount: Discount applied
- status: active | completed | expired | cancelled
```

#### `appointments`
Individual appointment sessions.

```sql
- id: Primary key
- tenantId: Foreign key to tenants
- purchaseId: Foreign key to purchases
- scheduledAt: Appointment date/time
- duration: Duration in minutes
- status: pending | confirmed | completed | cancelled | no_show
- confirmationSent: Email/SMS sent flag
- reminderSent: Reminder sent flag
- customerNotes: Customer notes
- staffNotes: Staff notes
```

#### `coupons` & `affiliates`
Affiliate marketing system.

```sql
coupons:
- id, tenantId, affiliateId
- code: Unique coupon code (e.g., "SALON10")
- discountType: percentage | fixed
- discountValue: Discount amount
- commissionType: percentage | fixed
- commissionValue: Affiliate commission
- maxUses: Usage limit
- usesCount: Current usage count
- validFrom, validUntil: Validity period
- isActive: Enable/disable coupon

affiliates:
- id, tenantId
- name, email, phone: Affiliate contact
- businessName: Affiliate business name
- isActive: Enable/disable affiliate
```

---

## API Endpoints (tRPC)

### Public Endpoints

```typescript
// Get tenant by slug
trpc.tenant.getBySlug.useQuery({ slug: "inklessismore" })

// Get active packages
trpc.packages.getActive.useQuery({ tenantSlug: "inklessismore" })

// Validate coupon
trpc.checkout.validateCoupon.useQuery({ code: "SALON10", tenantSlug: "inklessismore" })

// Create purchase
trpc.checkout.createPurchase.useMutation({
  tenantSlug: "inklessismore",
  packageId: "pkg_123",
  customerName: "John Doe",
  customerEmail: "john@example.com",
  customerPhone: "+254712345678",
  paymentMethod: "mpesa",
  couponCode: "SALON10" // optional
})

// Get customer purchases
trpc.customer.getMyPurchases.useQuery({
  email: "john@example.com",
  tenantSlug: "inklessismore"
})

// Get appointments for purchase
trpc.customer.getAppointments.useQuery({ purchaseId: "pur_123" })
```

### Protected Endpoints (Admin)

```typescript
// Get my tenant
trpc.tenant.getMy.useQuery()

// Update tenant
trpc.tenant.update.useMutation({
  name: "New Name",
  logoUrl: "https://...",
  primaryColor: "#D4AF37",
  // ... other fields
})

// Package management
trpc.packages.getAll.useQuery() // All packages including inactive
trpc.packages.create.useMutation({ ... })
trpc.packages.update.useMutation({ id: "pkg_123", ... })
trpc.packages.delete.useMutation({ id: "pkg_123" })
```

---

## Elixir/Phoenix Integration Plan

### Phase 1: API Migration
Replace the tRPC backend with Elixir/Phoenix REST or GraphQL API.

**Recommended approach**: GraphQL with Absinthe
- Better for complex queries
- Type-safe like tRPC
- Real-time subscriptions for calendar updates

### Phase 2: Payment Integration
Integrate M-Pesa STK Push for payments.

```elixir
# Example M-Pesa integration
defmodule Payments.Mpesa do
  def initiate_stk_push(phone_number, amount, account_reference) do
    # Call M-Pesa API
    # Return transaction_id
  end
  
  def verify_payment(transaction_id) do
    # Check payment status
  end
end
```

### Phase 3: Notification System
Send SMS and email confirmations.

```elixir
# Example notification
defmodule Notifications do
  def send_booking_confirmation(purchase) do
    # Send email via SendGrid/Mailgun
    # Send SMS via Africa's Talking/Twilio
  end
  
  def send_appointment_reminder(appointment) do
    # Send 24h before appointment
  end
end
```

### Phase 4: Real-time Calendar
Implement real-time availability using Phoenix Channels.

```elixir
# Example channel
defmodule BookingChannel do
  use Phoenix.Channel
  
  def join("calendar:" <> tenant_id, _params, socket) do
    {:ok, socket}
  end
  
  def handle_in("get_available_slots", %{"date" => date}, socket) do
    slots = Calendar.get_available_slots(socket.assigns.tenant_id, date)
    {:reply, {:ok, slots}, socket}
  end
end
```

---

## Multi-Tenant Architecture

### Data Isolation
Each tenant's data is isolated by `tenantId` foreign key.

```elixir
# Example Ecto query with tenant scoping
def list_packages(tenant_id) do
  from p in Package,
    where: p.tenant_id == ^tenant_id and p.is_active == true,
    order_by: p.display_order
end
```

### Subdomain Routing
Each client can have their own subdomain or custom domain.

```elixir
# Example router
defmodule Router do
  pipeline :browser do
    plug :fetch_tenant_from_subdomain
  end
  
  defp fetch_tenant_from_subdomain(conn, _opts) do
    host = conn.host
    tenant = Tenants.get_by_domain(host)
    assign(conn, :tenant, tenant)
  end
end
```

### White-Label Frontend
Generate Next.js sites for each client with their branding.

**Option 1**: Single Next.js app with dynamic theming
```typescript
// Load tenant config at runtime
const tenant = await fetch(`/api/tenant/${slug}`)
document.documentElement.style.setProperty('--primary', tenant.primaryColor)
```

**Option 2**: Generate separate Next.js apps per client
```bash
# Build script
for tenant in tenants:
  create_nextjs_app(tenant)
  deploy_to_vercel(tenant.domain)
```

---

## Customer Booking Flow

### Current Flow (Placeholder)
1. Customer visits website
2. Selects package
3. Fills booking form
4. Submits request
5. Business owner contacts customer manually

### Future Flow (SaaS Integrated)
1. Customer visits website
2. Selects package
3. Enters coupon code (optional)
4. Sees discounted price
5. Pays via M-Pesa
6. Receives confirmation email/SMS with booking link
7. Clicks link to view available time slots
8. Selects appointment time
9. Receives appointment confirmation
10. Gets reminder 24h before appointment

### Implementation

**Frontend (Next.js)**
```typescript
// Booking page
const handleCheckout = async () => {
  // 1. Create purchase
  const purchase = await trpc.checkout.createPurchase.mutate({...})
  
  // 2. Redirect to payment (M-Pesa)
  window.location.href = `/payment?purchase=${purchase.id}`
}

// Payment callback page
const handlePaymentSuccess = async (transactionId) => {
  // 3. Show appointment scheduler
  router.push(`/schedule?purchase=${purchaseId}`)
}
```

**Backend (Elixir)**
```elixir
# Purchase controller
def create_purchase(conn, params) do
  with {:ok, purchase} <- Purchases.create(params),
       {:ok, payment} <- Payments.initiate_mpesa(purchase),
       {:ok, _} <- Notifications.send_confirmation(purchase) do
    json(conn, purchase)
  end
end

# M-Pesa callback
def mpesa_callback(conn, %{"TransactionID" => tx_id, "ResultCode" => "0"}) do
  Purchases.mark_paid(tx_id)
  Notifications.send_booking_link(tx_id)
  json(conn, %{status: "ok"})
end
```

---

## Affiliate System

### How It Works
1. Business owner creates affiliate partner (e.g., "Beauty Salon XYZ")
2. System generates coupon code (e.g., "SALON10")
3. Affiliate shares code with their customers
4. Customer uses code during checkout
5. Customer gets discount
6. Affiliate earns commission
7. Business owner pays affiliate monthly

### Implementation

**Admin Panel**
```typescript
// Create affiliate
trpc.affiliates.create.useMutation({
  name: "Jane Doe",
  businessName: "Beauty Salon XYZ",
  email: "jane@salon.com"
})

// Create coupon for affiliate
trpc.coupons.create.useMutation({
  affiliateId: "aff_123",
  code: "SALON10",
  discountType: "percentage",
  discountValue: 10, // 10%
  commissionType: "percentage",
  commissionValue: 5, // 5% commission to affiliate
})
```

**Customer Checkout**
```typescript
// Validate and apply coupon
const coupon = await trpc.checkout.validateCoupon.useQuery({
  code: "SALON10",
  tenantSlug: "inklessismore"
})

const finalPrice = package.price - calculateDiscount(package.price, coupon)
```

**Commission Tracking**
```sql
-- Query to calculate affiliate earnings
SELECT 
  a.name,
  COUNT(p.id) as total_sales,
  SUM(p.discount_amount) as total_discounts,
  SUM(c.commission_value) as total_commission
FROM affiliates a
JOIN coupons c ON c.affiliate_id = a.id
JOIN purchases p ON p.coupon_code = c.code
WHERE p.created_at >= '2025-01-01'
GROUP BY a.id
```

---

## Next Steps

### For Inkless Is More (Current Client)
1. ✅ Website is ready with editable content
2. ✅ Admin panel for managing packages
3. ⏳ Add real M-Pesa payment integration
4. ⏳ Add calendar for appointment scheduling
5. ⏳ Add SMS/Email notifications

### For SaaS Platform
1. ⏳ Build Elixir/Phoenix backend
2. ⏳ Implement multi-tenant data isolation
3. ⏳ Create tenant onboarding flow
4. ⏳ Build white-label website generator
5. ⏳ Add affiliate dashboard for partners
6. ⏳ Implement commission payout system

### For New Clients
1. ⏳ Sign up flow for new businesses
2. ⏳ Automated website generation
3. ⏳ Custom domain setup
4. ⏳ Pricing tiers (Basic, Pro, Enterprise)

---

## Environment Variables

### Current (Next.js + tRPC)
```env
DATABASE_URL=mysql://...
JWT_SECRET=...
VITE_APP_TITLE=Inkless Is More
VITE_APP_LOGO=/logo.png
```

### Future (Elixir + Next.js)
```env
# Elixir Backend
DATABASE_URL=...
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_PASSKEY=...
SENDGRID_API_KEY=...
AFRICAS_TALKING_API_KEY=...

# Next.js Frontend
NEXT_PUBLIC_API_URL=https://api.yoursaas.com
NEXT_PUBLIC_TENANT_SLUG=inklessismore
```

---

## Cost Estimate

### Per Client (50 clients)
- Next.js hosting (Vercel): $0-20/month
- Database (shared): $1/month
- SMS/Email: $2/month
- **Total per client**: ~$5/month

### SaaS Platform
- Elixir hosting (Fly.io): $50/month
- Database (TiDB/PlanetScale): $30/month
- CDN (Cloudflare): $0-20/month
- **Total platform cost**: ~$100/month

### Revenue Model
- Charge $30-50/month per client
- 50 clients = $1,500-2,500/month
- Platform cost = $100/month
- **Profit margin**: 85-95%

---

## Support

For questions or issues, contact the development team.

