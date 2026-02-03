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
	isPublic: boolean("is_public").default(true).notNull(),
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
	videosIsPublicIdx: index("videos_is_public_idx").on(table.isPublic),
}));

/**
 * Credit holds table for freeze-settle-release pattern
 * Tracks credits frozen during video/image generation
 */
export const creditHolds = pgTable("credit_holds", {
	id: serial("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
	videoUuid: text("video_uuid").unique(), // Legacy field for video, kept for backward compatibility
	mediaUuid: text("media_uuid").unique(), // New unified field for both video and image
	mediaType: text("media_type"), // 'video' or 'image'
	credits: integer("credits").notNull(),
	status: text("status").default("HOLDING").notNull(), // HOLDING, SETTLED, RELEASED
	packageAllocation: jsonb("package_allocation").notNull(), // Array of { packageId, credits }
	createdAt: timestamp("created_at").defaultNow().notNull(),
	settledAt: timestamp("settled_at"),
}, (table) => ({
	creditHoldsUserIdIdx: index("credit_holds_user_id_idx").on(table.userId),
	creditHoldsStatusIdx: index("credit_holds_status_idx").on(table.status),
	creditHoldsVideoUuidIdx: uniqueIndex("credit_holds_video_uuid_idx").on(table.videoUuid),
	creditHoldsMediaUuidIdx: uniqueIndex("credit_holds_media_uuid_idx").on(table.mediaUuid),
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
	isPublic: boolean("is_public").default(true).notNull(),
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
	imagesIsPublicIdx: index("images_is_public_idx").on(table.isPublic),
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

// ============================================================================
// Gallery Tables
// ============================================================================

/**
 * Gallery items table
 * Stores gallery items for showcase (official examples + user featured works)
 */
export const galleryItems = pgTable("gallery_items", {
	id: serial("id").primaryKey(),
	uuid: text("uuid").notNull().unique(),

	// Media type: video or image
	mediaType: text("media_type").default("video").notNull(), // 'video' | 'image'

	// Link to user video (optional)
	videoId: integer("video_id").references(() => videos.id, { onDelete: 'set null' }),

	// Link to user image (optional)
	imageId: integer("image_id").references(() => images.id, { onDelete: 'set null' }),

	// Media content
	videoUrl: text("video_url"),
	thumbnailUrl: text("thumbnail_url").notNull(),
	imageUrls: jsonb("image_urls"), // string[] for images
	aspectRatio: text("aspect_ratio"), // e.g., "16:9", "9:16", "1:1", "4:3"
	prompt: text("prompt").notNull(),
	artStyle: text("art_style").notNull(), // cyberpunk, watercolor, oilPainting, anime, fluidArt

	// Creator info
	creatorId: text("creator_id").references(() => user.id, { onDelete: 'set null' }),
	creatorName: text("creator_name"),
	creatorAvatar: text("creator_avatar"),

	// Interaction data
	likesCount: integer("likes_count").default(0).notNull(),
	viewsCount: integer("views_count").default(0).notNull(),

	// Management fields
	sourceType: text("source_type").default("official").notNull(), // official, user
	status: text("status").default("pending").notNull(), // pending, approved, rejected
	isFeatured: boolean("is_featured").default(false).notNull(),
	sortWeight: integer("sort_weight").default(0).notNull(),

	// Review info
	reviewedAt: timestamp("reviewed_at"),
	reviewedBy: text("reviewed_by"),
	rejectReason: text("reject_reason"),

	// Timestamps
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
	galleryItemsUuidIdx: uniqueIndex("gallery_items_uuid_idx").on(table.uuid),
	galleryItemsVideoIdIdx: index("gallery_items_video_id_idx").on(table.videoId),
	galleryItemsImageIdIdx: index("gallery_items_image_id_idx").on(table.imageId),
	galleryItemsStatusIdx: index("gallery_items_status_idx").on(table.status),
	galleryItemsArtStyleIdx: index("gallery_items_art_style_idx").on(table.artStyle),
	galleryItemsIsFeaturedIdx: index("gallery_items_is_featured_idx").on(table.isFeatured),
	galleryItemsCreatorIdIdx: index("gallery_items_creator_id_idx").on(table.creatorId),
	galleryItemsSortWeightIdx: index("gallery_items_sort_weight_idx").on(table.sortWeight),
	galleryItemsCreatedAtIdx: index("gallery_items_created_at_idx").on(table.createdAt),
	galleryItemsMediaTypeIdx: index("gallery_items_media_type_idx").on(table.mediaType),
}));

/**
 * Gallery likes table
 * Tracks user likes on gallery items
 */
export const galleryLikes = pgTable("gallery_likes", {
	id: serial("id").primaryKey(),
	galleryItemId: integer("gallery_item_id").notNull().references(() => galleryItems.id, { onDelete: 'cascade' }),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
	galleryLikesUniqueIdx: uniqueIndex("gallery_likes_unique_idx").on(table.galleryItemId, table.userId),
	galleryLikesGalleryItemIdIdx: index("gallery_likes_gallery_item_id_idx").on(table.galleryItemId),
	galleryLikesUserIdIdx: index("gallery_likes_user_id_idx").on(table.userId),
}));

/**
 * Gallery favorites table
 * Tracks user favorites on gallery items
 */
export const galleryFavorites = pgTable("gallery_favorites", {
	id: serial("id").primaryKey(),
	galleryItemId: integer("gallery_item_id").notNull().references(() => galleryItems.id, { onDelete: 'cascade' }),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
	galleryFavoritesUniqueIdx: uniqueIndex("gallery_favorites_unique_idx").on(table.galleryItemId, table.userId),
	galleryFavoritesGalleryItemIdIdx: index("gallery_favorites_gallery_item_id_idx").on(table.galleryItemId),
	galleryFavoritesUserIdIdx: index("gallery_favorites_user_id_idx").on(table.userId),
}));

export type GalleryItem = typeof galleryItems.$inferSelect;
export type GalleryLike = typeof galleryLikes.$inferSelect;
export type GalleryFavorite = typeof galleryFavorites.$inferSelect;

// Gallery source type enum values
export const GallerySourceType = {
	OFFICIAL: "official",
	USER: "user",
} as const;
export type GallerySourceType = (typeof GallerySourceType)[keyof typeof GallerySourceType];

// Gallery status enum values
export const GalleryStatus = {
	PENDING: "pending",
	APPROVED: "approved",
	REJECTED: "rejected",
	REMOVED: "removed",
} as const;
export type GalleryStatus = (typeof GalleryStatus)[keyof typeof GalleryStatus];

// Gallery media type enum values
export const GalleryMediaType = {
	VIDEO: "video",
	IMAGE: "image",
} as const;
export type GalleryMediaType = (typeof GalleryMediaType)[keyof typeof GalleryMediaType];

// Art style enum values
export const ArtStyle = {
	CYBERPUNK: "cyberpunk",
	WATERCOLOR: "watercolor",
	OIL_PAINTING: "oilPainting",
	ANIME: "anime",
	FLUID_ART: "fluidArt",
} as const;
export type ArtStyle = (typeof ArtStyle)[keyof typeof ArtStyle];

// ============================================================================
// Referral System Tables
// ============================================================================

/**
 * Referral codes table
 * Stores unique referral codes for each user
 */
export const referralCodes = pgTable("referral_codes", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
	code: text("code").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
	referralCodesUserIdIdx: index("referral_codes_user_id_idx").on(table.userId),
	referralCodesCodeIdx: uniqueIndex("referral_codes_code_idx").on(table.code),
}));

/**
 * Referrals table
 * Tracks referral relationships between users
 */
export const referrals = pgTable("referrals", {
	id: text("id").primaryKey(),
	referrerId: text("referrer_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
	referredId: text("referred_id").notNull().references(() => user.id, { onDelete: 'cascade' }).unique(),
	status: text("status").notNull().default("pending"), // pending | registered | purchased
	registrationRewardPaid: boolean("registration_reward_paid").default(false),
	purchaseRewardPaid: boolean("purchase_reward_paid").default(false),
	referredIp: text("referred_ip"),
	referredEmailDomain: text("referred_email_domain"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	registeredAt: timestamp("registered_at"),
	purchasedAt: timestamp("purchased_at"),
}, (table) => ({
	referralsReferrerIdIdx: index("referrals_referrer_id_idx").on(table.referrerId),
	referralsReferredIdIdx: uniqueIndex("referrals_referred_id_idx").on(table.referredId),
	referralsStatusIdx: index("referrals_status_idx").on(table.status),
	// Composite indexes for anti-abuse queries
	referralsIpCreatedAtIdx: index("referrals_ip_created_at_idx").on(table.referredIp, table.createdAt),
	referralsDomainCreatedAtIdx: index("referrals_domain_created_at_idx").on(table.referredEmailDomain, table.createdAt),
}));

export type ReferralCode = typeof referralCodes.$inferSelect;
export type Referral = typeof referrals.$inferSelect;

// Referral status enum values
export const ReferralStatus = {
	PENDING: "pending",
	REGISTERED: "registered",
	PURCHASED: "purchased",
} as const;
export type ReferralStatus = (typeof ReferralStatus)[keyof typeof ReferralStatus];
