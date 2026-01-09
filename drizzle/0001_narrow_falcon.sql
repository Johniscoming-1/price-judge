CREATE TABLE `ai_analysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`priceStatus` enum('high','reasonable','low') NOT NULL,
	`analysis` text NOT NULL,
	`confidence` decimal(5,2),
	`analyzedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_analysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`targetPrice` decimal(10,2) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`notifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `price_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `price_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('jd','taobao','pinduoduo','douyin','meituan') NOT NULL,
	`productId` varchar(128) NOT NULL,
	`productUrl` text NOT NULL,
	`title` text NOT NULL,
	`imageUrl` text,
	`currentPrice` decimal(10,2) NOT NULL,
	`originalPrice` decimal(10,2),
	`shop` text,
	`category` varchar(128),
	`lastFetchedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `isVip` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `vipExpireAt` timestamp;--> statement-breakpoint
ALTER TABLE `ai_analysis` ADD CONSTRAINT `ai_analysis_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `price_alerts` ADD CONSTRAINT `price_alerts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `price_alerts` ADD CONSTRAINT `price_alerts_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `price_history` ADD CONSTRAINT `price_history_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `product_id_idx` ON `ai_analysis` (`productId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `favorites` (`userId`);--> statement-breakpoint
CREATE INDEX `user_product_idx` ON `favorites` (`userId`,`productId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `price_alerts` (`userId`);--> statement-breakpoint
CREATE INDEX `product_id_idx` ON `price_alerts` (`productId`);--> statement-breakpoint
CREATE INDEX `is_active_idx` ON `price_alerts` (`isActive`);--> statement-breakpoint
CREATE INDEX `product_id_idx` ON `price_history` (`productId`);--> statement-breakpoint
CREATE INDEX `recorded_at_idx` ON `price_history` (`recordedAt`);--> statement-breakpoint
CREATE INDEX `platform_product_id_idx` ON `products` (`platform`,`productId`);