/**
 * Seed script to initialize Inkless Is More business data
 * Run with: pnpm tsx server/seed.ts
 */

import * as db from "./db";
import { ENV } from "./_core/env";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create Inkless Is More tenant
  const existingTenant = await db.getTenantBySlug("inklessismore");
  
  let tenant;
  if (existingTenant) {
    console.log("✓ Tenant already exists");
    tenant = existingTenant;
  } else {
    tenant = await db.createTenant({
      name: "Inkless Is More",
      slug: "inklessismore",
      ownerId: ENV.ownerId,
      email: "info@inklessismore.ke",
      phone: "+254 XXX XXX XXX",
      logoUrl: "/logo.png",
      primaryColor: "#D4AF37", // Gold
      accentColor: "#000000", // Black
    });
    console.log("✓ Created tenant:", tenant.name);
  }

  // Create service packages
  const packages = [
    {
      name: "Single Session",
      description: "Perfect for trying out our service or for very small tattoos",
      price: 450000, // KSh 4,500 in cents
      originalPrice: undefined,
      sessionsIncluded: 1,
      isPopular: false,
      badge: undefined,
      displayOrder: 1,
    },
    {
      name: "Small Tattoo Package",
      description: "3 sessions - Ideal for small tattoos (up to 3x3 inches)",
      price: 1000000, // KSh 10,000
      originalPrice: 1350000, // KSh 13,500
      sessionsIncluded: 3,
      isPopular: true,
      badge: "Most Popular",
      displayOrder: 2,
    },
    {
      name: "Medium Tattoo Package",
      description: "5 sessions - Best for medium-sized tattoos (3x3 to 6x6 inches)",
      price: 1500000, // KSh 15,000
      originalPrice: 2250000, // KSh 22,500
      sessionsIncluded: 5,
      isPopular: false,
      badge: "Best Value",
      displayOrder: 3,
    },
    {
      name: "Laser Scar Removal",
      description: "Reduce the appearance of scars with advanced laser technology",
      price: 1500000, // KSh 15,000
      originalPrice: 5000000, // KSh 50,000
      sessionsIncluded: 1,
      isPopular: false,
      badge: "Limited Offer",
      displayOrder: 4,
    },
  ];

  const existingPackages = await db.getAllPackages(tenant.id);
  
  if (existingPackages.length > 0) {
    console.log("✓ Packages already exist");
  } else {
    for (const pkg of packages) {
      await db.createPackage({
        tenantId: tenant.id,
        ...pkg,
      });
      console.log(`✓ Created package: ${pkg.name}`);
    }
  }

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});

