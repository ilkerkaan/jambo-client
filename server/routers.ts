import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Tenant/Business management
  tenant: router({
    // Get current user's tenant
    getMy: protectedProcedure.query(async ({ ctx }) => {
      const tenant = await db.getUserTenant(ctx.user.id);
      return tenant;
    }),

    // Get tenant by slug (public)
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const tenant = await db.getTenantBySlug(input.slug);
        if (!tenant) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
        }
        return tenant;
      }),

    // Create tenant (for new businesses)
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        logoUrl: z.string().optional(),
        primaryColor: z.string().optional(),
        accentColor: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user already has a tenant
        const existing = await db.getUserTenant(ctx.user.id);
        if (existing) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You already have a business" });
        }

        const tenant = await db.createTenant({
          ...input,
          ownerId: ctx.user.id,
        });
        return tenant;
      }),

    // Update tenant settings
    update: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        logoUrl: z.string().optional(),
        primaryColor: z.string().optional(),
        accentColor: z.string().optional(),
        description: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        whatsappNumber: z.string().optional(),
        address: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const tenant = await db.getUserTenant(ctx.user.id);
        if (!tenant) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
        }

        await db.updateTenant(tenant.id, input);
        return { success: true };
      }),
  }),

  // Service Package management
  packages: router({
    // Get all active packages for a tenant (public)
    getActive: publicProcedure
      .input(z.object({ tenantSlug: z.string() }))
      .query(async ({ input }) => {
        const tenant = await db.getTenantBySlug(input.tenantSlug);
        if (!tenant) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
        }
        return db.getActivePackages(tenant.id);
      }),

    // Get all packages (including inactive) for admin
    getAll: protectedProcedure.query(async ({ ctx }) => {
      const tenant = await db.getUserTenant(ctx.user.id);
      if (!tenant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
      }
      return db.getAllPackages(tenant.id);
    }),

    // Create new package
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        price: z.number(),
        originalPrice: z.number().optional(),
        sessionsIncluded: z.number(),
        isPopular: z.boolean().optional(),
        badge: z.string().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const tenant = await db.getUserTenant(ctx.user.id);
        if (!tenant) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
        }

        const pkg = await db.createPackage({
          tenantId: tenant.id,
          ...input,
        });
        return pkg;
      }),

    // Update package
    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        originalPrice: z.number().optional(),
        sessionsIncluded: z.number().optional(),
        isPopular: z.boolean().optional(),
        badge: z.string().optional(),
        displayOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updatePackage(id, data);
        return { success: true };
      }),

    // Delete package (soft delete)
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.deletePackage(input.id);
        return { success: true };
      }),
  }),

  // Purchase/Checkout
  checkout: router({
    // Validate coupon code
    validateCoupon: publicProcedure
      .input(z.object({
        code: z.string(),
        tenantSlug: z.string(),
      }))
      .query(async ({ input }) => {
        const tenant = await db.getTenantBySlug(input.tenantSlug);
        if (!tenant) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
        }

        const coupon = await db.getCouponByCode(input.code, tenant.id);
        if (!coupon) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Invalid coupon code" });
        }

        // Check if coupon is still valid
        const now = new Date();
        if (coupon.validFrom && new Date(coupon.validFrom) > now) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Coupon not yet valid" });
        }
        if (coupon.validUntil && new Date(coupon.validUntil) < now) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Coupon expired" });
        }
        if (coupon.maxUses && (coupon.usesCount ?? 0) >= coupon.maxUses) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Coupon usage limit reached" });
        }

        return coupon;
      }),

    // Create purchase
    createPurchase: publicProcedure
      .input(z.object({
        tenantSlug: z.string(),
        packageId: z.string(),
        customerName: z.string(),
        customerEmail: z.string().email(),
        customerPhone: z.string(),
        paymentMethod: z.enum(["mpesa", "card", "cash"]),
        couponCode: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const tenant = await db.getTenantBySlug(input.tenantSlug);
        if (!tenant) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
        }

        const pkg = await db.getPackageById(input.packageId);
        if (!pkg || !pkg.isActive) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Package not found" });
        }

        let discountAmount = 0;
        let finalPrice = pkg.price;

        // Apply coupon if provided
        if (input.couponCode) {
          const coupon = await db.getCouponByCode(input.couponCode, tenant.id);
          if (coupon) {
            if (coupon.discountType === "percentage") {
              discountAmount = Math.floor((pkg.price * coupon.discountValue) / 100);
            } else {
              discountAmount = coupon.discountValue;
            }
            finalPrice = pkg.price - discountAmount;
            
            // Increment coupon usage
            await db.incrementCouponUsage(coupon.id);
          }
        }

        // Create purchase
        const purchase = await db.createPurchase({
          tenantId: tenant.id,
          packageId: pkg.id,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          amountPaid: finalPrice,
          sessionsTotal: pkg.sessionsIncluded,
          paymentMethod: input.paymentMethod,
          couponCode: input.couponCode,
          discountAmount,
        });

        // Create initial pending appointment
        await db.createAppointment({
          tenantId: tenant.id,
          purchaseId: purchase.id,
        });

        return purchase;
      }),
  }),

  // Customer portal
  customer: router({
    // Get customer's purchases
    getMyPurchases: publicProcedure
      .input(z.object({
        email: z.string().email(),
        tenantSlug: z.string(),
      }))
      .query(async ({ input }) => {
        const tenant = await db.getTenantBySlug(input.tenantSlug);
        if (!tenant) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
        }

        return db.getPurchasesByCustomer(input.email, tenant.id);
      }),

    // Get appointments for a purchase
    getAppointments: publicProcedure
      .input(z.object({ purchaseId: z.string() }))
      .query(async ({ input }) => {
        return db.getAppointmentsByPurchase(input.purchaseId);
      }),
  }),
});

export type AppRouter = typeof appRouter;

