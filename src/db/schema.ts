import { boolean, integer, jsonb, pgTable, serial, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	normalizedEmail: text('normalized_email').unique(),
	emailVerified: boolean('email_verified').notNull(),
	image: text('image'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	role: text('role'),
	banned: boolean('banned'),
	banReason: text('ban_reason'),
	banExpires: timestamp('ban_expires'),
	customerId: text('customer_id'),
}, (table) => ({
	userIdIdx: index("user_id_idx").on(table.id),
	userCustomerIdIdx: index("user_customer_id_idx").on(table.customerId),
	userRoleIdx: index("user_role_idx").on(table.role),
}));

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	impersonatedBy: text('impersonated_by')
}, (table) => ({
	sessionTokenIdx: index("session_token_idx").on(table.token),
	sessionUserIdIdx: index("session_user_id_idx").on(table.userId),
}));

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
}, (table) => ({
	accountUserIdIdx: index("account_user_id_idx").on(table.userId),
	accountAccountIdIdx: index("account_account_id_idx").on(table.accountId),
	accountProviderIdIdx: index("account_provider_id_idx").on(table.providerId),
}));

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at'),
	updatedAt: timestamp('updated_at')
});

export const payment = pgTable("payment", {
	id: text("id").primaryKey(),
	priceId: text('price_id').notNull(),
	type: text('type').notNull(),
	scene: text('scene'), // payment scene: 'credit', 'subscription'
	interval: text('interval'),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	customerId: text('customer_id').notNull(),
	subscriptionId: text('subscription_id'),
	sessionId: text('session_id'),
	invoiceId: text('invoice_id').unique(), // unique constraint for avoiding duplicate processing
	status: text('status').notNull(),
	paid: boolean('paid').notNull().default(false), // indicates whether payment is completed (set in invoice.paid event)
	periodStart: timestamp('period_start'),
	periodEnd: timestamp('period_end'),
	cancelAtPeriodEnd: boolean('cancel_at_period_end'),
	trialStart: timestamp('trial_start'),
	trialEnd: timestamp('trial_end'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
	paymentTypeIdx: index("payment_type_idx").on(table.type),
	paymentSceneIdx: index("payment_scene_idx").on(table.scene),
	paymentPriceIdIdx: index("payment_price_id_idx").on(table.priceId),
	paymentUserIdIdx: index("payment_user_id_idx").on(table.userId),
	paymentCustomerIdIdx: index("payment_customer_id_idx").on(table.customerId),
	paymentStatusIdx: index("payment_status_idx").on(table.status),
	paymentPaidIdx: index("payment_paid_idx").on(table.paid),
	paymentSubscriptionIdIdx: index("payment_subscription_id_idx").on(table.subscriptionId),
	paymentSessionIdIdx: index("payment_session_id_idx").on(table.sessionId),
	paymentInvoiceIdIdx: index("payment_invoice_id_idx").on(table.invoiceId),
}));

export const userCredit = pgTable("user_credit", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
	currentCredits: integer("current_credits").notNull().default(0),
	lastRefreshAt: timestamp("last_refresh_at"), // deprecated
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
	userCreditUserIdIdx: index("user_credit_user_id_idx").on(table.userId),
}));

export const creditTransaction = pgTable("credit_transaction", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
	type: text("type").notNull(),
	description: text("description"),
	amount: integer("amount").notNull(),
	remainingAmount: integer("remaining_amount"),
	paymentId: text("payment_id"), // field name is paymentId, but actually it's invoiceId
	expirationDate: timestamp("expiration_date"),
	expirationDateProcessedAt: timestamp("expiration_date_processed_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
	creditTransactionUserIdIdx: index("credit_transaction_user_id_idx").on(table.userId),
	creditTransactionTypeIdx: index("credit_transaction_type_idx").on(table.type),
}));

// ============================================================================
// Video Generation Tables
// ============================================================================

/**
 * Video generation records table
 * Stores all video generation tasks and their results
 */
export const videos = pgTable("videos", {
	id: serial("id").primaryKey(),
	uuid: text("uuid").notNull().unique(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
	prompt: text("prompt").notNull(),
	model: text("model").notNull(),
	parameters: jsonb("parameters"),
	status: text("status").default("PENDING").notNull(), // PENDING, GENERATING, UPLOADING, COMPLETED, FAILED
	provider: text("provider"),
	externalTaskId: text("external_task_id"),
	errorMessage: text("error_message"),
	startImageUrl: text("start_image_url"),
	originalVideoUrl: text("original_video_url"),
	videoUrl: text("video_url"),
	thumbnailUrl: text("thumbnail_url"),
	duration: integer("duration"),
	resolution: text("resolution"),
	aspectRatio: text("aspect_ratio"),
	fileSize: integer("file_size"),
	creditsUsed: integer("credits_used").default(0).notNull(),
	isFavorite: boolean("is_favorite").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
	completedAt: timestamp("completed_at"),
	generationTime: integer("generation_time"),
	isDeleted: boolean("is_deleted").default(false).notNull(),
}, (table) => ({
	videosUserIdIdx: index("videos_user_id_idx").on(table.userId),
	videosStatusIdx: index("videos_status_idx").on(table.status),
	videosCreatedAtIdx: index("videos_created_at_idx").on(table.createdAt),
	videosUuidIdx: uniqueIndex("videos_uuid_idx").on(table.uuid),
	videosFavoriteIdx: index("videos_favorite_idx").on(table.isFavorite),
}));

/**
 * Credit holds table for freeze-settle-release pattern
 * Tracks credits frozen during video generation
 */
export const creditHolds = pgTable("credit_holds", {
	id: serial("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
	videoUuid: text("video_uuid").notNull().unique(),
	credits: integer("credits").notNull(),
	status: text("status").default("HOLDING").notNull(), // HOLDING, SETTLED, RELEASED
	packageAllocation: jsonb("package_allocation").notNull(), // Array of { packageId, credits }
	createdAt: timestamp("created_at").defaultNow().notNull(),
	settledAt: timestamp("settled_at"),
}, (table) => ({
	creditHoldsUserIdIdx: index("credit_holds_user_id_idx").on(table.userId),
	creditHoldsStatusIdx: index("credit_holds_status_idx").on(table.status),
	creditHoldsVideoUuidIdx: uniqueIndex("credit_holds_video_uuid_idx").on(table.videoUuid),
}));

// ============================================================================
// Type Exports
// ============================================================================

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Payment = typeof payment.$inferSelect;
export type UserCredit = typeof userCredit.$inferSelect;
export type CreditTransaction = typeof creditTransaction.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type CreditHold = typeof creditHolds.$inferSelect;

// Video status enum values
export const VideoStatus = {
	PENDING: "PENDING",
	GENERATING: "GENERATING",
	UPLOADING: "UPLOADING",
	COMPLETED: "COMPLETED",
	FAILED: "FAILED",
} as const;
export type VideoStatus = (typeof VideoStatus)[keyof typeof VideoStatus];

// Credit hold status enum values
export const CreditHoldStatus = {
	HOLDING: "HOLDING",
	SETTLED: "SETTLED",
	RELEASED: "RELEASED",
} as const;
export type CreditHoldStatus = (typeof CreditHoldStatus)[keyof typeof CreditHoldStatus];

// ============================================================================
// Image Generation Tables
// ============================================================================

/**
 * Image generation records table
 * Stores all image generation tasks and their results
 */
export const images = pgTable("images", {
	id: serial("id").primaryKey(),
	uuid: text("uuid").notNull().unique(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),

	// Generation parameters
	prompt: text("prompt").notNull(),
	model: text("model").notNull(),
	provider: text("provider").default("evolink"),
	externalTaskId: text("external_task_id"),
	parameters: jsonb("parameters"), // { aspectRatio, quality, numberOfImages, size }

	// Status
	status: text("status").default("PENDING").notNull(), // PENDING, GENERATING, COMPLETED, FAILED
	errorMessage: text("error_message"),

	// Image data
	imageUrls: jsonb("image_urls"), // string[]
	thumbnailUrl: text("thumbnail_url"),

	// Metadata
	creditsUsed: integer("credits_used").default(0).notNull(),

	// User management
	isFavorite: boolean("is_favorite").default(false).notNull(),
	tags: jsonb("tags"), // string[]

	// Timestamps
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
	completedAt: timestamp("completed_at"),
	generationTime: integer("generation_time"), // in milliseconds

	// Soft delete
	isDeleted: boolean("is_deleted").default(false).notNull(),
}, (table) => ({
	imagesUserIdIdx: index("images_user_id_idx").on(table.userId),
	imagesStatusIdx: index("images_status_idx").on(table.status),
	imagesCreatedAtIdx: index("images_created_at_idx").on(table.createdAt),
	imagesUuidIdx: uniqueIndex("images_uuid_idx").on(table.uuid),
	imagesFavoriteIdx: index("images_favorite_idx").on(table.isFavorite),
	imagesModelIdx: index("images_model_idx").on(table.model),
}));

export type Image = typeof images.$inferSelect;

// Image status enum values
export const ImageStatus = {
	PENDING: "PENDING",
	GENERATING: "GENERATING",
	COMPLETED: "COMPLETED",
	FAILED: "FAILED",
} as const;
export type ImageStatus = (typeof ImageStatus)[keyof typeof ImageStatus];
