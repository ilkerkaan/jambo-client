CREATE TABLE `affiliates` (
	`id` varchar(64) NOT NULL,
	`tenantId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(50),
	`businessName` varchar(255),
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `appointments` (
	`id` varchar(64) NOT NULL,
	`tenantId` varchar(64) NOT NULL,
	`purchaseId` varchar(64) NOT NULL,
	`scheduledAt` timestamp,
	`duration` int DEFAULT 60,
	`status` enum('pending','confirmed','completed','cancelled','no_show') NOT NULL DEFAULT 'pending',
	`confirmationSent` boolean DEFAULT false,
	`reminderSent` boolean DEFAULT false,
	`customerNotes` text,
	`staffNotes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `available_slots` (
	`id` varchar(64) NOT NULL,
	`tenantId` varchar(64) NOT NULL,
	`dayOfWeek` int NOT NULL,
	`startTime` varchar(10) NOT NULL,
	`endTime` varchar(10) NOT NULL,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `available_slots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blocked_dates` (
	`id` varchar(64) NOT NULL,
	`tenantId` varchar(64) NOT NULL,
	`date` timestamp NOT NULL,
	`reason` varchar(255),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `blocked_dates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` varchar(64) NOT NULL,
	`tenantId` varchar(64) NOT NULL,
	`affiliateId` varchar(64),
	`code` varchar(50) NOT NULL,
	`discountType` enum('percentage','fixed') NOT NULL,
	`discountValue` int NOT NULL,
	`commissionType` enum('percentage','fixed') NOT NULL,
	`commissionValue` int NOT NULL,
	`maxUses` int,
	`usesCount` int DEFAULT 0,
	`validFrom` timestamp,
	`validUntil` timestamp,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` varchar(64) NOT NULL,
	`tenantId` varchar(64) NOT NULL,
	`packageId` varchar(64) NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`customerPhone` varchar(50) NOT NULL,
	`amountPaid` int NOT NULL,
	`sessionsTotal` int NOT NULL,
	`sessionsRemaining` int NOT NULL,
	`paymentMethod` enum('mpesa','card','cash') NOT NULL,
	`paymentStatus` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`transactionId` varchar(255),
	`couponCode` varchar(50),
	`discountAmount` int DEFAULT 0,
	`status` enum('active','completed','expired','cancelled') NOT NULL DEFAULT 'active',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_packages` (
	`id` varchar(64) NOT NULL,
	`tenantId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`originalPrice` int,
	`sessionsIncluded` int NOT NULL DEFAULT 1,
	`isPopular` boolean DEFAULT false,
	`badge` varchar(100),
	`displayOrder` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_packages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`domain` varchar(255),
	`logoUrl` text,
	`primaryColor` varchar(20) DEFAULT '#D4AF37',
	`accentColor` varchar(20) DEFAULT '#000000',
	`description` text,
	`phone` varchar(50),
	`email` varchar(320),
	`whatsappNumber` varchar(50),
	`address` text,
	`currency` varchar(10) DEFAULT 'KSh',
	`timezone` varchar(50) DEFAULT 'Africa/Nairobi',
	`bookingEnabled` boolean DEFAULT true,
	`ownerId` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenants_slug_unique` UNIQUE(`slug`)
);
