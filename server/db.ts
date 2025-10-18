import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, tenants, servicePackages, purchases, appointments,
  affiliates, coupons, availableSlots, blockedDates,
  Tenant, ServicePackage, Purchase, Appointment, Affiliate, Coupon
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { nanoid } from 'nanoid';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER MANAGEMENT ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { id: user.id };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ TENANT MANAGEMENT ============

export async function getTenantBySlug(slug: string): Promise<Tenant | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
  return result[0];
}

export async function getTenantById(id: string): Promise<Tenant | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
  return result[0];
}

export async function getUserTenant(userId: string): Promise<Tenant | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(tenants).where(eq(tenants.ownerId, userId)).limit(1);
  return result[0];
}

export async function createTenant(data: {
  name: string;
  slug: string;
  ownerId: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
}): Promise<Tenant> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = nanoid();
  await db.insert(tenants).values({
    id,
    ...data,
  });
  
  const result = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
  return result[0]!;
}

export async function updateTenant(id: string, data: Partial<Tenant>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(tenants).set(data).where(eq(tenants.id, id));
}

// ============ SERVICE PACKAGE MANAGEMENT ============

export async function getActivePackages(tenantId: string): Promise<ServicePackage[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(servicePackages)
    .where(and(
      eq(servicePackages.tenantId, tenantId),
      eq(servicePackages.isActive, true)
    ))
    .orderBy(servicePackages.displayOrder);
}

export async function getAllPackages(tenantId: string): Promise<ServicePackage[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(servicePackages)
    .where(eq(servicePackages.tenantId, tenantId))
    .orderBy(servicePackages.displayOrder);
}

export async function getPackageById(id: string): Promise<ServicePackage | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(servicePackages).where(eq(servicePackages.id, id)).limit(1);
  return result[0];
}

export async function createPackage(data: {
  tenantId: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  sessionsIncluded: number;
  isPopular?: boolean;
  badge?: string;
  displayOrder?: number;
}): Promise<ServicePackage> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = nanoid();
  await db.insert(servicePackages).values({
    id,
    ...data,
  });
  
  const result = await db.select().from(servicePackages).where(eq(servicePackages.id, id)).limit(1);
  return result[0]!;
}

export async function updatePackage(id: string, data: Partial<ServicePackage>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(servicePackages).set(data).where(eq(servicePackages.id, id));
}

export async function deletePackage(id: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Soft delete by marking as inactive
  await db.update(servicePackages).set({ isActive: false }).where(eq(servicePackages.id, id));
}

// ============ PURCHASE MANAGEMENT ============

export async function createPurchase(data: {
  tenantId: string;
  packageId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amountPaid: number;
  sessionsTotal: number;
  paymentMethod: "mpesa" | "card" | "cash";
  couponCode?: string;
  discountAmount?: number;
}): Promise<Purchase> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = nanoid();
  await db.insert(purchases).values({
    id,
    ...data,
    sessionsRemaining: data.sessionsTotal,
    paymentStatus: "completed",
    status: "active",
  });
  
  const result = await db.select().from(purchases).where(eq(purchases.id, id)).limit(1);
  return result[0]!;
}

export async function getPurchaseById(id: string): Promise<Purchase | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(purchases).where(eq(purchases.id, id)).limit(1);
  return result[0];
}

export async function getPurchasesByCustomer(email: string, tenantId: string): Promise<Purchase[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(purchases)
    .where(and(
      eq(purchases.customerEmail, email),
      eq(purchases.tenantId, tenantId)
    ))
    .orderBy(desc(purchases.createdAt));
}

export async function updatePurchaseSessionsRemaining(id: string, sessionsRemaining: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const status = sessionsRemaining <= 0 ? "completed" : "active";
  await db.update(purchases).set({ sessionsRemaining, status }).where(eq(purchases.id, id));
}

// ============ APPOINTMENT MANAGEMENT ============

export async function createAppointment(data: {
  tenantId: string;
  purchaseId: string;
  scheduledAt?: Date;
  customerNotes?: string;
}): Promise<Appointment> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = nanoid();
  await db.insert(appointments).values({
    id,
    ...data,
    status: "pending",
  });
  
  const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  return result[0]!;
}

export async function getAppointmentsByPurchase(purchaseId: string): Promise<Appointment[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(appointments)
    .where(eq(appointments.purchaseId, purchaseId))
    .orderBy(desc(appointments.scheduledAt));
}

export async function updateAppointmentStatus(
  id: string, 
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(appointments).set({ status }).where(eq(appointments.id, id));
}

// ============ COUPON MANAGEMENT ============

export async function getCouponByCode(code: string, tenantId: string): Promise<Coupon | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(coupons)
    .where(and(
      eq(coupons.code, code.toUpperCase()),
      eq(coupons.tenantId, tenantId),
      eq(coupons.isActive, true)
    ))
    .limit(1);
  
  return result[0];
}

export async function incrementCouponUsage(id: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const coupon = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
  if (coupon[0]) {
    await db.update(coupons).set({ 
      usesCount: (coupon[0].usesCount || 0) + 1 
    }).where(eq(coupons.id, id));
  }
}

