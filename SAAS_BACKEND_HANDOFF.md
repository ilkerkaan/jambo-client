# SaaS Backend Handoff Document
## Elixir/Phoenix Multi-Tenant Booking & Affiliate Platform

**Project:** Inkless Is More + Multi-Tenant SaaS
**Frontend:** Next.js (separate repository)
**Backend:** Elixir/Phoenix (this project)
**Database:** PostgreSQL
**First Client:** Inkless Is More (www.inklessismore.ke)

---

## 📋 TABLE OF CONTENTS

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Authentication & Authorization](#authentication--authorization)
5. [Integration Points](#integration-points)
6. [Third-Party Integrations](#third-party-integrations)
7. [Deployment & Infrastructure](#deployment--infrastructure)
8. [Development Workflow](#development-workflow)

---

## 🏗️ ARCHITECTURE OVERVIEW

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS FRONTEND (Per Client)             │
│  (inklessismore.ke, client2.com, client3.com, etc.)         │
└────────────────────────┬────────────────────────────────────┘
                         │
                    REST/GraphQL API
                         │
┌────────────────────────▼────────────────────────────────────┐
│              ELIXIR/PHOENIX BACKEND (Shared SaaS)            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Multi-Tenant Layer                                   │  │
│  │ - Tenant isolation                                   │  │
│  │ - Domain routing (studio1.saas.com → tenant_id)     │  │
│  │ - Row-level security                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Core Services                                        │  │
│  │ - Booking Engine                                     │  │
│  │ - Payment Processing                                 │  │
│  │ - Customer Management                                │  │
│  │ - Affiliate Tracking                                 │  │
│  │ - Notification System                                │  │
│  │ - Reporting & Analytics                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ External Integrations                                │  │
│  │ - M-Pesa (Kenya payments)                            │  │
│  │ - Stripe (International)                             │  │
│  │ - Twilio (SMS/WhatsApp)                              │  │
│  │ - SendGrid (Email)                                   │  │
│  │ - Google Calendar (sync)                             │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    POSTGRESQL DATABASE                       │
│  (Shared across all tenants with row-level security)       │
└────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Multi-Tenant:** One SaaS instance serves unlimited clients
2. **Isolation:** Each tenant's data is completely isolated
3. **Scalability:** Horizontal scaling via Elixir's concurrency
4. **Real-time:** WebSocket support for live calendar updates
5. **Reliability:** Fault tolerance and automatic recovery

---

## 📊 DATABASE SCHEMA

### Core Tables

#### 1. **tenants** - Business/Studio Information
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  whatsapp_number VARCHAR(20),
  address TEXT,
  description TEXT,
  logo_url VARCHAR(500),
  primary_color VARCHAR(7),      -- Hex color
  accent_color VARCHAR(7),       -- Hex color
  website_url VARCHAR(255),      -- Custom domain
  subscription_plan VARCHAR(50), -- "starter", "pro", "enterprise"
  subscription_status VARCHAR(50), -- "active", "paused", "cancelled"
  subscription_end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. **users** - All Users (Owner, Staff, Customers)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(50), -- "owner", "staff", "customer"
  status VARCHAR(50), -- "active", "inactive", "suspended"
  
  -- Staff specific
  specialization VARCHAR(255),
  bio TEXT,
  profile_photo_url VARCHAR(500),
  working_hours JSONB, -- {"monday": {"start": "09:00", "end": "17:00"}, ...}
  
  -- Customer specific
  loyalty_points INT DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  preferred_staff_id UUID REFERENCES users(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(tenant_id, email)
);
```

#### 3. **services** - Service/Product Offerings
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- "appointment", "physical", "digital", "course"
  duration_minutes INT,  -- For appointments
  price DECIMAL(10, 2),
  original_price DECIMAL(10, 2), -- For discounts
  image_url VARCHAR(500),
  video_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT,
  
  -- For packages/bundles
  sessions_included INT,
  validity_days INT, -- Days until package expires
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. **bookings** - Appointments/Reservations
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES users(id),
  service_id UUID REFERENCES services(id),
  staff_id UUID REFERENCES users(id),
  
  booking_date DATE,
  start_time TIME,
  end_time TIME,
  duration_minutes INT,
  
  status VARCHAR(50), -- "pending", "confirmed", "completed", "cancelled", "no-show"
  notes TEXT,
  
  -- Customer info (if not registered)
  guest_name VARCHAR(255),
  guest_email VARCHAR(255),
  guest_phone VARCHAR(20),
  
  -- Payment
  amount DECIMAL(10, 2),
  payment_status VARCHAR(50), -- "pending", "paid", "refunded"
  payment_method VARCHAR(50), -- "mpesa", "stripe", "card"
  payment_id VARCHAR(255), -- External payment ID
  
  -- Affiliate/Coupon
  coupon_code VARCHAR(50),
  discount_amount DECIMAL(10, 2),
  affiliate_id UUID REFERENCES users(id), -- Who referred this customer
  
  reminder_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. **packages** - Service Packages (3-pack, 5-pack, etc.)
```sql
CREATE TABLE packages (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  
  name VARCHAR(255), -- "3-Pack", "5-Pack"
  description TEXT,
  sessions_included INT,
  price DECIMAL(10, 2),
  original_price DECIMAL(10, 2),
  validity_days INT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 6. **customer_packages** - Customer Package Ownership
```sql
CREATE TABLE customer_packages (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES users(id),
  package_id UUID REFERENCES packages(id),
  
  sessions_remaining INT,
  purchase_date TIMESTAMP,
  expiry_date TIMESTAMP,
  status VARCHAR(50), -- "active", "expired", "completed"
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 7. **coupons** - Affiliate/Discount Codes
```sql
CREATE TABLE coupons (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  affiliate_id UUID REFERENCES users(id), -- Who created this coupon
  
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(50), -- "percentage", "fixed"
  discount_value DECIMAL(10, 2),
  max_uses INT,
  current_uses INT DEFAULT 0,
  
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 8. **affiliate_commissions** - Affiliate Earnings
```sql
CREATE TABLE affiliate_commissions (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  affiliate_id UUID REFERENCES users(id),
  booking_id UUID REFERENCES bookings(id),
  
  commission_type VARCHAR(50), -- "regular", "ambassador"
  commission_rate DECIMAL(5, 2), -- 5.00 = 5%
  commission_amount DECIMAL(10, 2),
  
  status VARCHAR(50), -- "pending", "approved", "paid"
  payment_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 9. **notifications** - Notification Queue
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  
  type VARCHAR(50), -- "booking_reminder", "payment_confirmation", "coupon_alert"
  title VARCHAR(255),
  message TEXT,
  
  channel VARCHAR(50), -- "email", "sms", "whatsapp", "push"
  recipient VARCHAR(255), -- Email or phone
  
  status VARCHAR(50), -- "pending", "sent", "failed"
  sent_at TIMESTAMP,
  error_message TEXT,
  
  scheduled_for TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 10. **analytics_events** - User Activity Tracking
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  
  event_type VARCHAR(100), -- "page_view", "booking_started", "payment_completed"
  event_data JSONB,
  
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 API ENDPOINTS

### Authentication

```
POST /api/auth/register
  Body: { email, password, first_name, last_name, role }
  Response: { user, token }

POST /api/auth/login
  Body: { email, password }
  Response: { user, token }

POST /api/auth/logout
  Headers: { Authorization: "Bearer {token}" }

POST /api/auth/refresh-token
  Body: { refresh_token }
  Response: { token }

POST /api/auth/forgot-password
  Body: { email }

POST /api/auth/reset-password
  Body: { token, new_password }
```

### Tenants (Multi-Tenant Management)

```
GET /api/tenants/:id
  Response: { id, name, email, phone, logo_url, colors, ... }

PUT /api/tenants/:id
  Headers: { Authorization: "Bearer {token}" }
  Body: { name, email, phone, logo_url, primary_color, ... }
  Response: { updated tenant }

GET /api/tenants/:id/settings
  Response: { subscription_plan, subscription_status, features_enabled, ... }
```

### Services

```
GET /api/tenants/:tenant_id/services
  Response: [{ id, name, price, duration_minutes, image_url, ... }]

POST /api/tenants/:tenant_id/services
  Headers: { Authorization: "Bearer {token}" }
  Body: { name, description, price, duration_minutes, image_url }
  Response: { created service }

PUT /api/tenants/:tenant_id/services/:id
  Headers: { Authorization: "Bearer {token}" }
  Body: { name, price, ... }

DELETE /api/tenants/:tenant_id/services/:id
  Headers: { Authorization: "Bearer {token}" }
```

### Bookings (Core Functionality)

```
GET /api/tenants/:tenant_id/availability
  Query: { service_id, staff_id, date_from, date_to }
  Response: { available_slots: [{ date, time, staff_id }, ...] }

POST /api/tenants/:tenant_id/bookings
  Body: {
    service_id,
    staff_id,
    customer_id,
    booking_date,
    start_time,
    guest_name,
    guest_email,
    guest_phone,
    coupon_code
  }
  Response: { booking_id, status, amount, payment_url }

GET /api/tenants/:tenant_id/bookings/:id
  Response: { full booking details }

PUT /api/tenants/:tenant_id/bookings/:id
  Headers: { Authorization: "Bearer {token}" }
  Body: { status, notes, ... }

DELETE /api/tenants/:tenant_id/bookings/:id
  Headers: { Authorization: "Bearer {token}" }
  Response: { success, refund_info }

GET /api/tenants/:tenant_id/bookings
  Query: { customer_id, staff_id, status, date_from, date_to }
  Response: [{ bookings }]
```

### Customers

```
GET /api/tenants/:tenant_id/customers
  Headers: { Authorization: "Bearer {token}" }
  Response: [{ customer profiles }]

GET /api/tenants/:tenant_id/customers/:id
  Response: { profile, booking_history, packages, loyalty_points }

PUT /api/tenants/:tenant_id/customers/:id
  Headers: { Authorization: "Bearer {token}" }
  Body: { first_name, last_name, phone, ... }

GET /api/tenants/:tenant_id/customers/:id/packages
  Response: [{ active packages with remaining sessions }]
```

### Payments

```
POST /api/tenants/:tenant_id/payments/mpesa/initiate
  Body: { booking_id, phone_number, amount }
  Response: { checkout_request_id, payment_url }

POST /api/tenants/:tenant_id/payments/mpesa/callback
  Body: { stk_callback_response }
  Response: { success }

POST /api/tenants/:tenant_id/payments/stripe/create-intent
  Body: { booking_id, amount }
  Response: { client_secret, payment_intent_id }

GET /api/tenants/:tenant_id/payments/:id/status
  Response: { status, amount, method, ... }
```

### Coupons & Affiliates

```
POST /api/tenants/:tenant_id/coupons
  Headers: { Authorization: "Bearer {token}" }
  Body: { code, discount_type, discount_value, valid_until }
  Response: { coupon }

GET /api/tenants/:tenant_id/coupons/:code/validate
  Query: { amount }
  Response: { valid, discount_amount, message }

GET /api/tenants/:tenant_id/affiliates/:id/commissions
  Headers: { Authorization: "Bearer {token}" }
  Response: { total_earned, pending, paid, commissions: [...] }

GET /api/tenants/:tenant_id/affiliates/:id/stats
  Response: { referrals_count, conversion_rate, total_commission, ... }
```

### Staff Management

```
GET /api/tenants/:tenant_id/staff
  Response: [{ staff profiles with availability }]

POST /api/tenants/:tenant_id/staff
  Headers: { Authorization: "Bearer {token}" }
  Body: { first_name, last_name, email, specialization, working_hours }
  Response: { staff member }

PUT /api/tenants/:tenant_id/staff/:id
  Headers: { Authorization: "Bearer {token}" }
  Body: { working_hours, specialization, ... }

PUT /api/tenants/:tenant_id/staff/:id/availability
  Headers: { Authorization: "Bearer {token}" }
  Body: { date, available_slots: [{ start_time, end_time }, ...] }
```

### Analytics & Reporting

```
GET /api/tenants/:tenant_id/analytics/dashboard
  Query: { period: "day|week|month|year" }
  Response: {
    total_bookings,
    total_revenue,
    average_booking_value,
    customer_count,
    occupancy_rate,
    charts: { ... }
  }

GET /api/tenants/:tenant_id/analytics/revenue
  Query: { date_from, date_to, group_by: "day|week|month" }
  Response: [{ date, revenue, bookings_count, ... }]

GET /api/tenants/:tenant_id/analytics/customers
  Query: { period }
  Response: { new_customers, returning_customers, churn_rate, ... }
```

### Notifications

```
GET /api/tenants/:tenant_id/notifications
  Headers: { Authorization: "Bearer {token}" }
  Response: [{ notifications }]

PUT /api/tenants/:tenant_id/notifications/:id/read
  Headers: { Authorization: "Bearer {token}" }

POST /api/tenants/:tenant_id/notifications/preferences
  Headers: { Authorization: "Bearer {token}" }
  Body: { email_enabled, sms_enabled, whatsapp_enabled, ... }
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Token Strategy
- **JWT tokens** with 1-hour expiration
- **Refresh tokens** with 30-day expiration
- **Stored in secure HTTP-only cookies**

### Role-Based Access Control (RBAC)

```elixir
# Roles and permissions
owner:
  - All operations on tenant
  - Staff management
  - Financial reports
  - Subscription management

staff:
  - View own bookings
  - Update booking status
  - View customer info
  - Cannot access financial data

customer:
  - View own bookings
  - Book appointments
  - Update own profile
  - View own packages
```

### Multi-Tenant Isolation

```elixir
# Every query must include tenant_id
# Row-level security enforced at database level

# Example: User can only see their tenant's data
def get_bookings(user_id, tenant_id) do
  Booking
  |> where([b], b.tenant_id == ^tenant_id)
  |> where([b], b.customer_id == ^user_id or b.staff_id == ^user_id)
  |> Repo.all()
end
```

---

## 🔗 INTEGRATION POINTS

### Frontend to Backend

**The Next.js frontend expects these API responses:**

1. **Booking Availability**
   ```json
   GET /api/tenants/{tenant_id}/availability
   Response: {
     "available_slots": [
       {
         "date": "2025-10-25",
         "time": "09:00",
         "staff_id": "uuid",
         "staff_name": "John Doe"
       }
     ]
   }
   ```

2. **Create Booking**
   ```json
   POST /api/tenants/{tenant_id}/bookings
   Request: {
     "service_id": "uuid",
     "staff_id": "uuid",
     "booking_date": "2025-10-25",
     "start_time": "09:00",
     "guest_name": "Jane Smith",
     "guest_email": "jane@example.com",
     "guest_phone": "+254700000000",
     "coupon_code": "AFFILIATE10"
   }
   Response: {
     "id": "uuid",
     "status": "pending",
     "amount": 5000,
     "discount": 500,
     "final_amount": 4500,
     "payment_url": "https://..."
   }
   ```

3. **Payment Confirmation**
   ```json
   GET /api/tenants/{tenant_id}/bookings/{id}/payment-status
   Response: {
     "status": "paid",
     "payment_method": "mpesa",
     "transaction_id": "MPesa123456",
     "amount": 4500
   }
   ```

### Admin Panel Integration

**Admin panel expects:**
- Staff list with availability
- Booking history
- Customer list
- Revenue reports
- Coupon management
- Affiliate commissions

---

## 🌐 THIRD-PARTY INTEGRATIONS

### 1. M-Pesa (Kenya Payments)

```elixir
# Configuration
config :mpesa,
  business_shortcode: System.get_env("MPESA_SHORTCODE"),
  passkey: System.get_env("MPESA_PASSKEY"),
  consumer_key: System.get_env("MPESA_CONSUMER_KEY"),
  consumer_secret: System.get_env("MPESA_CONSUMER_SECRET"),
  api_url: "https://api.safaricom.co.ke"

# Usage
{:ok, response} = MpesaService.initiate_stk_push(
  phone: "+254700000000",
  amount: 5000,
  reference: "BOOKING-123",
  description: "Tattoo Removal Session"
)

# Callback handling
def handle_mpesa_callback(callback_data) do
  # Verify signature
  # Update booking status
  # Send confirmation email/SMS
end
```

### 2. Stripe (International Payments)

```elixir
# Configuration
config :stripity_stripe,
  api_key: System.get_env("STRIPE_SECRET_KEY"),
  public_key: System.get_env("STRIPE_PUBLIC_KEY")

# Usage
{:ok, intent} = Stripe.PaymentIntent.create(%{
  amount: 5000,
  currency: "usd",
  metadata: %{"booking_id" => booking_id}
})
```

### 3. Twilio (SMS/WhatsApp)

```elixir
# Configuration
config :twilio,
  account_sid: System.get_env("TWILIO_ACCOUNT_SID"),
  auth_token: System.get_env("TWILIO_AUTH_TOKEN"),
  from_number: System.get_env("TWILIO_PHONE_NUMBER")

# SMS
{:ok, message} = Twilio.Messages.create(%{
  to: "+254700000000",
  body: "Your booking is confirmed for 2025-10-25 at 09:00"
})

# WhatsApp
{:ok, message} = Twilio.Messages.create(%{
  to: "whatsapp:+254700000000",
  body: "Your booking is confirmed for 2025-10-25 at 09:00"
})
```

### 4. SendGrid (Email)

```elixir
# Configuration
config :sendgrid,
  api_key: System.get_env("SENDGRID_API_KEY")

# Usage
{:ok, response} = SendGrid.Mail.send(%{
  to: "customer@example.com",
  subject: "Booking Confirmation",
  html: "<h1>Your booking is confirmed</h1>...",
  from: "noreply@inklessismore.ke"
})
```

### 5. Google Calendar (Sync)

```elixir
# Configuration
config :google_calendar,
  client_id: System.get_env("GOOGLE_CLIENT_ID"),
  client_secret: System.get_env("GOOGLE_CLIENT_SECRET")

# Usage
{:ok, event} = GoogleCalendar.create_event(%{
  calendar_id: staff.google_calendar_id,
  title: "Tattoo Removal Session - Jane Smith",
  start_time: "2025-10-25T09:00:00",
  end_time: "2025-10-25T10:30:00",
  description: "Customer: Jane Smith, Phone: +254700000000"
})
```

---

## 🚀 DEPLOYMENT & INFRASTRUCTURE

### Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost/saas_db

# Authentication
JWT_SECRET=your-secret-key-here
REFRESH_TOKEN_SECRET=your-refresh-secret-key

# M-Pesa
MPESA_SHORTCODE=123456
MPESA_PASSKEY=your-passkey
MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid
SENDGRID_API_KEY=SG...

# Google Calendar
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Server
PORT=4000
MIX_ENV=prod
SECRET_KEY_BASE=your-secret-key-base
```

### Deployment Platforms

**Recommended:** Fly.io (Elixir-native)

```bash
# Deploy
fly deploy

# Monitor
fly logs
fly status
```

**Alternative:** Heroku, AWS EC2, DigitalOcean

---

## 💻 DEVELOPMENT WORKFLOW

### Project Setup

```bash
# Clone repository
git clone <repo-url>
cd saas-backend

# Install dependencies
mix deps.get

# Create database
mix ecto.create

# Run migrations
mix ecto.migrate

# Seed initial data (optional)
mix run priv/repo/seeds.exs

# Start development server
mix phx.server
```

### Testing

```bash
# Run tests
mix test

# With coverage
mix test --cover

# Specific test file
mix test test/saas_backend/bookings_test.exs
```

### Code Quality

```bash
# Format code
mix format

# Lint
mix credo

# Type checking
mix dialyzer
```

### Database Migrations

```bash
# Create migration
mix ecto.gen.migration add_new_field_to_bookings

# Run migrations
mix ecto.migrate

# Rollback
mix ecto.rollback
```

---

## 📝 DEVELOPMENT PRIORITIES

### Phase 1 (Week 1-2): Core Infrastructure
- [ ] Set up Elixir/Phoenix project
- [ ] Configure PostgreSQL
- [ ] Implement authentication (JWT)
- [ ] Create core database schema
- [ ] Set up multi-tenant isolation

### Phase 2 (Week 3-4): Booking Engine
- [ ] Implement availability calculation
- [ ] Create booking endpoints
- [ ] Add booking status management
- [ ] Implement cancellation logic
- [ ] Add booking history

### Phase 3 (Week 5-6): Payments
- [ ] Integrate M-Pesa
- [ ] Integrate Stripe
- [ ] Implement payment verification
- [ ] Add refund logic
- [ ] Create payment reports

### Phase 4 (Week 7-8): Notifications
- [ ] Set up email (SendGrid)
- [ ] Set up SMS (Twilio)
- [ ] Set up WhatsApp (Twilio)
- [ ] Create notification templates
- [ ] Implement scheduled notifications

### Phase 5 (Week 9-10): Affiliate System
- [ ] Create coupon system
- [ ] Implement commission tracking
- [ ] Add affiliate dashboard
- [ ] Create commission reports
- [ ] Implement payout system

### Phase 6 (Week 11-12): Analytics & Polish
- [ ] Create analytics endpoints
- [ ] Build reporting system
- [ ] Add monitoring/logging
- [ ] Performance optimization
- [ ] Security audit

---

## 🔗 FRONTEND COMMUNICATION

### Expected Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error code",
  "message": "Human-readable error message"
}
```

### CORS Configuration

```elixir
config :cors_plug,
  origins: [
    "http://localhost:3000",
    "https://inklessismore.ke",
    "https://*.myapp.com"
  ],
  max_age: 86400
```

---

## 📞 SUPPORT & QUESTIONS

**For questions about:**
- Frontend integration → Contact frontend developer
- Database schema → Check schema.sql
- Payment flows → See payment integration docs
- Deployment → Check deployment guide

---

## 🎯 SUCCESS CRITERIA

By the end of development:

✅ All endpoints documented and tested
✅ Multi-tenant isolation verified
✅ Payment processing working (M-Pesa + Stripe)
✅ Notifications sending reliably
✅ Analytics dashboard functional
✅ Affiliate system tracking commissions
✅ 99.9% uptime on staging
✅ < 200ms API response time (p95)
✅ Security audit passed
✅ Load testing passed (1000 concurrent users)

---

**Last Updated:** October 2025
**Status:** Ready for Development
**Next Step:** Backend developer starts Phase 1

