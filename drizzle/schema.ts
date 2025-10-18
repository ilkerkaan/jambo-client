import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tenant/Business configuration
 * Each business (like Inkless Is More) has their own tenant record
 */
export const tenants = mysqlTable("tenants", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(), // e.g., "inklessismore"
  domain: varchar("domain", { length: 255 }), // Custom domain if they have one
  
  // Branding
  logoUrl: text("logoUrl"),
  primaryColor: varchar("primaryColor", { length: 20 }).default("#D4AF37"), // Gold
  accentColor: varchar("accentColor", { length: 20 }).default("#000000"), // Black
  
  // Business info
  description: text("description"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  whatsappNumber: varchar("whatsappNumber", { length: 50 }),
  address: text("address"),
  
  // Settings
  currency: varchar("currency", { length: 10 }).default("KSh"),
  timezone: varchar("timezone", { length: 50 }).default("Africa/Nairobi"),
  bookingEnabled: boolean("bookingEnabled").default(true),
  
  // Owner
  ownerId: varchar("ownerId", { length: 64 }).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

/**
 * Service packages that businesses offer
 * Editable by business owners via admin panel
 */
export const servicePackages = mysqlTable("service_packages", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull(),
  
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Pricing
  price: int("price").notNull(), // Store in cents/smallest unit (e.g., 4500 for KSh 45.00)
  originalPrice: int("originalPrice"), // For showing discounts
  
  // Sessions
  sessionsIncluded: int("sessionsIncluded").notNull().default(1),
  
  // Display
  isPopular: boolean("isPopular").default(false),
  badge: varchar("badge", { length: 100 }), // e.g., "Best Value", "Most Popular"
  displayOrder: int("displayOrder").default(0),
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type ServicePackage = typeof servicePackages.$inferSelect;
export type InsertServicePackage = typeof servicePackages.$inferInsert;

/**
 * Customer purchases of service packages
 */
export const purchases = mysqlTable("purchases", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull(),
  packageId: varchar("packageId", { length: 64 }).notNull(),
  
  // Customer info
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 50 }).notNull(),
  
  // Purchase details
  amountPaid: int("amountPaid").notNull(),
  sessionsTotal: int("sessionsTotal").notNull(),
  sessionsRemaining: int("sessionsRemaining").notNull(),
  
  // Payment
  paymentMethod: mysqlEnum("paymentMethod", ["mpesa", "card", "cash"]).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  transactionId: varchar("transactionId", { length: 255 }),
  
  // Affiliate tracking
  couponCode: varchar("couponCode", { length: 50 }),
  discountAmount: int("discountAmount").default(0),
  
  // Status
  status: mysqlEnum("status", ["active", "completed", "expired", "cancelled"]).default("active").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;

/**
 * Individual appointments/sessions
 */
export const appointments = mysqlTable("appointments", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull(),
  purchaseId: varchar("purchaseId", { length: 64 }).notNull(),
  
  // Scheduling
  scheduledAt: timestamp("scheduledAt"),
  duration: int("duration").default(60), // minutes
  
  // Status
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled", "no_show"]).default("pending").notNull(),
  
  // Communication
  confirmationSent: boolean("confirmationSent").default(false),
  reminderSent: boolean("reminderSent").default(false),
  
  // Notes
  customerNotes: text("customerNotes"),
  staffNotes: text("staffNotes"),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Affiliate partners and their coupon codes
 */
export const affiliates = mysqlTable("affiliates", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull(),
  
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  businessName: varchar("businessName", { length: 255 }), // e.g., "Beauty Salon XYZ"
  
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;

/**
 * Coupon codes for affiliates
 */
export const coupons = mysqlTable("coupons", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull(),
  affiliateId: varchar("affiliateId", { length: 64 }),
  
  code: varchar("code", { length: 50 }).notNull().unique(),
  
  // Discount
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).notNull(),
  discountValue: int("discountValue").notNull(), // Percentage (e.g., 10 for 10%) or fixed amount in cents
  
  // Commission for affiliate
  commissionType: mysqlEnum("commissionType", ["percentage", "fixed"]).notNull(),
  commissionValue: int("commissionValue").notNull(),
  
  // Usage limits
  maxUses: int("maxUses"),
  usesCount: int("usesCount").default(0),
  
  // Validity
  validFrom: timestamp("validFrom"),
  validUntil: timestamp("validUntil"),
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

/**
 * Available time slots for booking
 */
export const availableSlots = mysqlTable("available_slots", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull(),
  
  dayOfWeek: int("dayOfWeek").notNull(), // 0 = Sunday, 1 = Monday, etc.
  startTime: varchar("startTime", { length: 10 }).notNull(), // e.g., "09:00"
  endTime: varchar("endTime", { length: 10 }).notNull(), // e.g., "17:00"
  
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow(),
});

export type AvailableSlot = typeof availableSlots.$inferSelect;
export type InsertAvailableSlot = typeof availableSlots.$inferInsert;

/**
 * Blocked dates/times (holidays, etc.)
 */
export const blockedDates = mysqlTable("blocked_dates", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull(),
  
  date: timestamp("date").notNull(),
  reason: varchar("reason", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow(),
});

export type BlockedDate = typeof blockedDates.$inferSelect;
export type InsertBlockedDate = typeof blockedDates.$inferInsert;

