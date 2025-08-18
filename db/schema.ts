import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  integer,
  decimal,
  jsonb,
  unique,
  primaryKey,
} from "drizzle-orm/pg-core";

// ============================================
// AUTH TABLES (Better-auth)
// ============================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
  role: text("role").$defaultFn(() => "customer"),
  banned: boolean("banned").$defaultFn(() => false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  phoneNumber: text("phone_number"),
  dateOfBirth: timestamp("date_of_birth"),
  // defaultAddressId: text("default_address_id"),
  // defaultBillingAddressId: text("default_billing_address_id"),
  // stripeCustomerId: text("stripe_customer_id"),
  preferredCurrency: text("preferred_currency").$defaultFn(() => "USD"),
  preferredLanguage: text("preferred_language").$defaultFn(() => "en"),
}, (table) => ([
  index('user_email_idx').on(table.email),
  // index('user_stripe_customer_id_idx').on(table.stripeCustomerId),
]));

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
}, (table) => [
  index('session_user_id_idx').on(table.userId),
  index('session_token_idx').on(table.token),
]);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
}, (table) => ([
  index('account_user_id_idx').on(table.userId),
]));

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
}, (table) => [
  index('verification_identifier_idx').on(table.identifier),
]);

// ============================================
// PRODUCT TABLES
// ============================================

export const category = pgTable("category", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  parentId: text("parent_id"),
  displayOrder: integer("display_order").$defaultFn(() => 0),
  isActive: boolean("is_active").$defaultFn(() => true),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
}, (table) => [
  index('category_slug_idx').on(table.slug),
  index('category_parent_id_idx').on(table.parentId),
]);

export const product = pgTable("product", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  shortDescription: text("short_description"),
  sku: text("sku").notNull().unique(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
  // costPerItem: decimal("cost_per_item", { precision: 10, scale: 2 }),
  categoryId: text("category_id").references(() => category.id, { onDelete: "set null" }),
  // brandId: text("brand_id").references(() => brand.id, { onDelete: "set null" }),
  status: text("status").$defaultFn(() => "draft"), // draft, active, archived
  featuredImage: text("featured_image"),
  images: jsonb("images").$type<string[]>().$defaultFn(() => []),
  // weight: decimal("weight", { precision: 10, scale: 3 }),
  // weightUnit: text("weight_unit").$defaultFn(() => "kg"),
  // width: decimal("width", { precision: 10, scale: 2 }),
  // height: decimal("height", { precision: 10, scale: 2 }),
  // depth: decimal("depth", { precision: 10, scale: 2 }),
  // dimensionUnit: text("dimension_unit").$defaultFn(() => "cm"),
  isFeatured: boolean("is_featured").$defaultFn(() => false),
  // isDigital: boolean("is_digital").$defaultFn(() => false),
  // taxable: boolean("taxable").$defaultFn(() => true),
  // taxCode: text("tax_code"),
  // barcode: text("barcode"),
  // trackQuantity: boolean("track_quantity").$defaultFn(() => true),
  // allowBackorder: boolean("allow_backorder").$defaultFn(() => false),
  // minPurchaseQuantity: integer("min_purchase_quantity").$defaultFn(() => 1),
  // maxPurchaseQuantity: integer("max_purchase_quantity"),
  // metaTitle: text("meta_title"),
  // metaDescription: text("meta_description"),
  // metaKeywords: text("meta_keywords"),
  tags: jsonb("tags").$type<string[]>().$defaultFn(() => []),
  // customAttributes: jsonb("custom_attributes").$defaultFn(() => {}),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
  publishedAt: timestamp("published_at"),
}, (table) => [
  index('product_slug_idx').on(table.slug),
  index('product_sku_idx').on(table.sku),
  index('product_category_id_idx').on(table.categoryId),
  // index('product_brand_id_idx').on(table.brandId),
  index('product_status_idx').on(table.status),
  index('product_is_featured_idx').on(table.isFeatured),
]);

// export const productVariant = pgTable("product_variant", {
//   id: text("id").primaryKey(),
//   productId: text("product_id").notNull().references(() => product.id, { onDelete: "cascade" }),
//   name: text("name").notNull(),
//   sku: text("sku").notNull().unique(),
//   price: decimal("price", { precision: 10, scale: 2 }),
//   compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
//   costPerItem: decimal("cost_per_item", { precision: 10, scale: 2 }),
//   quantity: integer("quantity").$defaultFn(() => 0),
//   weight: decimal("weight", { precision: 10, scale: 3 }),
//   barcode: text("barcode"),
//   image: text("image"),
//   position: integer("position").$defaultFn(() => 0),
//   options: jsonb("options").notNull(), // e.g., { size: "L", color: "Blue" }
//   isDefault: boolean("is_default").$defaultFn(() => false),
//   createdAt: timestamp("created_at").$defaultFn(() => new Date()),
//   updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
// }, (table) => [
//   index('product_variant_product_id_idx').on(table.productId),
//   index('product_variant_sku_idx').on(table.sku),
// ]);
//
// export const productOption = pgTable("product_option", {
//   id: text("id").primaryKey(),
//   productId: text("product_id").notNull().references(() => product.id, { onDelete: "cascade" }),
//   name: text("name").notNull(), // e.g., "Size", "Color"
//   position: integer("position").$defaultFn(() => 0),
//   values: jsonb("values").notNull().$type<string[]>(), // e.g., ["S", "M", "L", "XL"]
//   createdAt: timestamp("created_at").$defaultFn(() => new Date()),
//   updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
// }, (table) => [
//   index('product_option_product_id_idx').on(table.productId),
// ]);
//
// export const brand = pgTable("brand", {
//   id: text("id").primaryKey(),
//   name: text("name").notNull(),
//   slug: text("slug").notNull().unique(),
//   description: text("description"),
//   logo: text("logo"),
//   website: text("website"),
//   isActive: boolean("is_active").$defaultFn(() => true),
//   createdAt: timestamp("created_at").$defaultFn(() => new Date()),
//   updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
// }, (table) => [
//   index('brand_slug_idx').on(table.slug),
// ]);

export const collection = pgTable("collection", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  isActive: boolean("is_active").$defaultFn(() => true),
  sortOrder: text("sort_order").$defaultFn(() => "manual"), // manual, best-selling, price-asc, price-desc, newest
  // conditions: jsonb("conditions"), // For smart collections
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
}, (table) => [
  index('collection_slug_idx').on(table.slug),
]);

export const productCollection = pgTable("product_collection", {
  productId: text("product_id").notNull().references(() => product.id, { onDelete: "cascade" }),
  collectionId: text("collection_id").notNull().references(() => collection.id, { onDelete: "cascade" }),
  position: integer("position").$defaultFn(() => 0),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
}, (table) => [
  primaryKey({ columns: [table.productId, table.collectionId] }),
  index('product_collection_product_id_idx').on(table.productId),
  index('product_collection_collection_id_idx').on(table.collectionId),
]);

// ============================================
// INVENTORY TABLES
// ============================================

export const inventory = pgTable("inventory", {
  id: text("id").primaryKey(),
  productId: text("product_id").references(() => product.id, { onDelete: "cascade" }),
  // variantId: text("variant_id").references(() => productVariant.id, { onDelete: "cascade" }),
  // locationId: text("location_id").references(() => inventoryLocation.id, { onDelete: "cascade" }),
  quantity: integer("quantity").$defaultFn(() => 0),
  // reservedQuantity: integer("reserved_quantity").$defaultFn(() => 0),
  lowStockThreshold: integer("low_stock_threshold"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
}, (table) => [
  index('inventory_product_id_idx').on(table.productId),
  // index('inventory_variant_id_idx').on(table.variantId),
  // index('inventory_location_id_idx').on(table.locationId),
  // unique('inventory_unique_idx').on(table.productId, table.variantId, table.locationId),
]);

// export const inventoryLocation = pgTable("inventory_location", {
//   id: text("id").primaryKey(),
//   name: text("name").notNull(),
//   address: text("address"),
//   city: text("city"),
//   state: text("state"),
//   country: text("country"),
//   postalCode: text("postal_code"),
//   isActive: boolean("is_active").$defaultFn(() => true),
//   isDefault: boolean("is_default").$defaultFn(() => false),
//   createdAt: timestamp("created_at").$defaultFn(() => new Date()),
//   updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
// });
//
// ============================================
// SHOPPING CART & WISHLIST TABLES
// ============================================

export const cart = pgTable("cart", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  sessionId: text("session_id"), // For guest carts
  items: jsonb("items").$type<CartItem[]>().$defaultFn(() => []),
  // subtotal: decimal("subtotal", { precision: 10, scale: 2 }).$defaultFn(() => "0"),
  // taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).$defaultFn(() => "0"),
  // shippingAmount: decimal("shipping_amount", { precision: 10, scale: 2 }).$defaultFn(() => "0"),
  // discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).$defaultFn(() => "0"),
  total: decimal("total", { precision: 10, scale: 2 }).$defaultFn(() => "0"),
  // currency: text("currency").$defaultFn(() => "USD"),
  // couponCode: text("coupon_code"),
  notes: text("notes"),
  metadata: jsonb("metadata").$defaultFn(() => { }),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
}, (table) => [
  index('cart_user_id_idx').on(table.userId),
  index('cart_session_id_idx').on(table.sessionId),
]);

export const wishlist = pgTable("wishlist", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => product.id, { onDelete: "cascade" }),
  // variantId: text("variant_id").references(() => productVariant.id, { onDelete: "cascade" }),
  notes: text("notes"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
}, (table) => [
  index('wishlist_user_id_idx').on(table.userId),
  index('wishlist_product_id_idx').on(table.productId),
  // unique('wishlist_unique_idx').on(table.userId, table.productId, table.variantId),
]);

// ============================================
// ORDER TABLES
// ============================================

export const order = pgTable("order", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  email: text("email").notNull(),
  phone: text("phone"),
  status: text("status").$defaultFn(() => "pending"), // pending, processing, shipped, delivered, cancelled, refunded
  // paymentStatus: text("payment_status").$defaultFn(() => "pending"), // pending, paid, failed, refunded, partially_refunded
  // fulfillmentStatus: text("fulfillment_status").$defaultFn(() => "unfulfilled"), // unfulfilled, partially_fulfilled, fulfilled
  // subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  // taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).$defaultFn(() => "0"),
  // shippingAmount: decimal("shipping_amount", { precision: 10, scale: 2 }).$defaultFn(() => "0"),
  // discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).$defaultFn(() => "0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  // currency: text("currency").$defaultFn(() => "USD"),
  shippingAddressId: text("shipping_address_id").references(() => address.id),
  // billingAddressId: text("billing_address_id").references(() => address.id),
  // shippingMethod: text("shipping_method"),
  // trackingNumber: text("tracking_number"),
  // couponCode: text("coupon_code"),
  notes: text("notes"),
  customerNotes: text("customer_notes"),
  metadata: jsonb("metadata").$defaultFn(() => { }),
  cancelledAt: timestamp("cancelled_at"),
  cancelReason: text("cancel_reason"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
}, (table) => [
  index('order_user_id_idx').on(table.userId),
  index('order_order_number_idx').on(table.orderNumber),
  index('order_status_idx').on(table.status),
  index('order_email_idx').on(table.email),
  index('order_created_at_idx').on(table.createdAt),
]);

export const orderItem = pgTable("order_item", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => order.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => product.id, { onDelete: "set null" }),
  // variantId: text("variant_id").references(() => productVariant.id, { onDelete: "set null" }),
  productName: text("product_name").notNull(),
  variantName: text("variant_name"),
  sku: text("sku"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  // subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  // taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).$defaultFn(() => "0"),
  // discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).$defaultFn(() => "0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  fulfillmentStatus: text("fulfillment_status").$defaultFn(() => "unfulfilled"),
  metadata: jsonb("metadata").$defaultFn(() => { }),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
}, (table) => [
  index('order_item_order_id_idx').on(table.orderId),
  index('order_item_product_id_idx').on(table.productId),
  // index('order_item_variant_id_idx').on(table.variantId),
]);

// ============================================
// PAYMENT TABLES
// ============================================

// export const payment = pgTable("payment", {
//   id: text("id").primaryKey(),
//   orderId: text("order_id").notNull().references(() => order.id, { onDelete: "cascade" }),
//   amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
//   currency: text("currency").$defaultFn(() => "USD"),
//   method: text("method").notNull(), // card, paypal, stripe, etc.
//   status: text("status").$defaultFn(() => "pending"), // pending, completed, failed, refunded
//   transactionId: text("transaction_id"),
//   provider: text("provider"), // stripe, paypal, square, etc.
//   providerResponse: jsonb("provider_response"),
//   failureReason: text("failure_reason"),
//   refundedAmount: decimal("refunded_amount", { precision: 10, scale: 2 }).$defaultFn(() => "0"),
//   metadata: jsonb("metadata").$defaultFn(() => {}),
//   paidAt: timestamp("paid_at"),
//   failedAt: timestamp("failed_at"),
//   createdAt: timestamp("created_at").$defaultFn(() => new Date()),
//   updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
// }, (table) => [
//   index('payment_order_id_idx').on(table.orderId),
//   index('payment_transaction_id_idx').on(table.transactionId),
//   index('payment_status_idx').on(table.status),
// ]);
//
// export const refund = pgTable("refund", {
//   id: text("id").primaryKey(),
//   orderId: text("order_id").notNull().references(() => order.id, { onDelete: "cascade" }),
//   paymentId: text("payment_id").references(() => payment.id, { onDelete: "set null" }),
//   amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
//   currency: text("currency").$defaultFn(() => "USD"),
//   reason: text("reason").notNull(),
//   status: text("status").$defaultFn(() => "pending"), // pending, processing, completed, failed
//   notes: text("notes"),
//   processedBy: text("processed_by").references(() => user.id, { onDelete: "set null" }),
//   transactionId: text("transaction_id"),
//   metadata: jsonb("metadata").$defaultFn(() => {}),
//   processedAt: timestamp("processed_at"),
//   createdAt: timestamp("created_at").$defaultFn(() => new Date()),
//   updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
// }, (table) => [
//   index('refund_order_id_idx').on(table.orderId),
//   index('refund_payment_id_idx').on(table.paymentId),
// ]);

// ============================================
// ADDRESS TABLE
// ============================================

export const address = pgTable("address", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  type: text("type").$defaultFn(() => "shipping"), // shipping, billing
  isDefault: boolean("is_default").$defaultFn(() => false),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  company: text("company"),
  addressLine1: text("address_line_1").notNull(),
  addressLine2: text("address_line_2"),
  city: text("city").notNull(),
  state: text("state"),
  country: text("country").notNull(),
  postalCode: text("postal_code").notNull(),
  phone: text("phone"),
  instructions: text("instructions"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
}, (table) => [
  index('address_user_id_idx').on(table.userId),
]);

// ============================================
// REVIEW & RATING TABLES
// ============================================

export const review = pgTable("review", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => product.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  orderId: text("order_id").references(() => order.id, { onDelete: "set null" }),
  rating: integer("rating").notNull(), // 1-5
  title: text("title"),
  comment: text("comment"),
  images: jsonb("images").$type<string[]>().$defaultFn(() => []),
  isVerifiedPurchase: boolean("is_verified_purchase").$defaultFn(() => false),
  isApproved: boolean("is_approved").$defaultFn(() => false),
  helpfulCount: integer("helpful_count").$defaultFn(() => 0),
  unhelpfulCount: integer("unhelpful_count").$defaultFn(() => 0),
  adminResponse: text("admin_response"),
  adminResponseAt: timestamp("admin_response_at"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
}, (table) => [
  index('review_product_id_idx').on(table.productId),
  index('review_user_id_idx').on(table.userId),
  index('review_rating_idx').on(table.rating),
  index('review_is_approved_idx').on(table.isApproved),
]);

export const reviewVote = pgTable("review_vote", {
  id: text("id").primaryKey(),
  reviewId: text("review_id").notNull().references(() => review.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  isHelpful: boolean("is_helpful").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
}, (table) => [
  index('review_vote_review_id_idx').on(table.reviewId),
  unique('review_vote_unique_idx').on(table.reviewId, table.userId),
]);

// ============================================
// COUPON & DISCOUNT TABLES
// ============================================

// export const coupon = pgTable("coupon", {
//   id: text("id").primaryKey(),
//   code: text("code").notNull().unique(),
//   description: text("description"),
//   type: text("type").notNull(), // percentage, fixed_amount, free_shipping
//   value: decimal("value", { precision: 10, scale: 2 }).notNull(),
//   minimumAmount: decimal("minimum_amount", { precision: 10, scale: 2 }),
//   usageLimit: integer("usage_limit"),
//   usageCount: integer("usage_count").$defaultFn(() => 0),
//   usageLimitPerCustomer: integer("usage_limit_per_customer"),
//   applicableProducts: jsonb("applicable_products").$type<string[]>(),
//   applicableCategories: jsonb("applicable_categories").$type<string[]>(),
//   excludedProducts: jsonb("excluded_products").$type<string[]>(),
//   excludedCategories: jsonb("excluded_categories").$type<string[]>(),
//   isActive: boolean("is_active").$defaultFn(() => true),
//   startsAt: timestamp("starts_at"),
//   expiresAt: timestamp("expires_at"),
//   createdAt: timestamp("created_at").$defaultFn(() => new Date()),
//   updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
// }, (table) => [
//   index('coupon_code_idx').on(table.code),
//   index('coupon_is_active_idx').on(table.isActive),
// ]);
//
// export const couponUsage = pgTable("coupon_usage", {
//   id: text("id").primaryKey(),
//   couponId: text("coupon_id").notNull().references(() => coupon.id, { onDelete: "cascade" }),
//   userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
//   orderId: text("order_id").references(() => order.id, { onDelete: "set null" }),
//   discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull(),
//   createdAt: timestamp("created_at").$defaultFn(() => new Date()),
// }, (table) => [
//   index('coupon_usage_coupon_id_idx').on(table.couponId),
//   index('coupon_usage_user_id_idx').on(table.userId),
//   index('coupon_usage_order_id_idx').on(table.orderId),
// ]);
//
// ============================================
// SHIPPING TABLES
// ============================================

// export const shippingZone = pgTable("shipping_zone", {
//   id: text("id").primaryKey(),
//   name: text("name").notNull(),
//   countries: jsonb("countries").$type<string[]>().notNull(),
//   states: jsonb("states").$type<string[]>(),
//   postalCodes: jsonb("postal_codes").$type<string[]>(),
//   isDefault: boolean("is_default").$defaultFn(() => false),
//   createdAt: timestamp("created_at").$defaultFn(() => new Date()),
//   updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
// });
//
// export const shippingMethod = pgTable("shipping_method", {
//   id: text("id").primaryKey(),
//   zoneId: text("zone_id").notNull().references(() => shippingZone.id, { onDelete: "cascade" }),
//   name: text("name").notNull(),
//   description: text("description"),
//   type: text("type").notNull(), // flat_rate, weight_based, price_based, free
//   price: decimal("price", { precision: 10, scale: 2 }),
//   minWeight: decimal("min_weight", { precision: 10, scale: 3 }),
//   maxWeight: decimal("max_weight", { precision: 10, scale: 3 }),
//   minPrice: decimal("min_price", { precision: 10, scale: 2 }),
//   maxPrice: decimal("max_price", { precision: 10, scale: 2 }),
//   estimatedDays: integer("estimated_days"),
//   isActive: boolean("is_active").$defaultFn(() => true),
//   displayOrder: integer("display_order").$defaultFn(() => 0),
//   createdAt: timestamp("created_at").$defaultFn(() => new Date()),
//   updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
// }, (table) => [
//   index('shipping_method_zone_id_idx').on(table.zoneId),
// ]);

// ============================================
// NOTIFICATION TABLES
// ============================================

export const notification = pgTable("notification", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // order_placed, order_shipped, price_drop, back_in_stock, etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data").$defaultFn(() => { }),
  isRead: boolean("is_read").$defaultFn(() => false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
}, (table) => [
  index('notification_user_id_idx').on(table.userId),
  index('notification_is_read_idx').on(table.isRead),
]);

// export const emailSubscription = pgTable("email_subscription", {
//   id: text("id").primaryKey(),
//   email: text("email").notNull().unique(),
//   userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
//   isActive: boolean("is_active").$defaultFn(() => true),
//   preferences: jsonb("preferences").$defaultFn(() => ({
//     newsletter: true,
//     orderUpdates: true,
//     promotions: true,
//     priceDrops: false,
//     backInStock: false,
//   })),
//   unsubscribeToken: text("unsubscribe_token").notNull().unique(),
//   subscribedAt: timestamp("subscribed_at").$defaultFn(() => new Date()),
//   unsubscribedAt: timestamp("unsubscribed_at"),
// }, (table) => [
//   index('email_subscription_email_idx').on(table.email),
//   index('email_subscription_user_id_idx').on(table.userId),
// ]);

// ============================================
// ANALYTICS TABLES
// ============================================

// export const productView = pgTable("product_view", {
//   id: text("id").primaryKey(),
//   productId: text("product_id").notNull().references(() => product.id, { onDelete: "cascade" }),
//   userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
//   sessionId: text("session_id"),
//   ipAddress: text("ip_address"),
//   userAgent: text("user_agent"),
//   referrer: text("referrer"),
//   createdAt: timestamp("created_at").$defaultFn(() => new Date()),
// }, (table) => [
//   index('product_view_product_id_idx').on(table.productId),
//   index('product_view_user_id_idx').on(table.userId),
//   index('product_view_created_at_idx').on(table.createdAt),
// ]);
//
// export const searchQuery = pgTable("search_query", {
//   id: text("id").primaryKey(),
//   query: text("query").notNull(),
//   userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
//   sessionId: text("session_id"),
//   resultsCount: integer("results_count"),
//   clickedProductId: text("clicked_product_id").references(() => product.id, { onDelete: "set null" }),
//   createdAt: timestamp("created_at").$defaultFn(() => new Date()),
// }, (table) => [
//   index('search_query_query_idx').on(table.query),
//   index('search_query_user_id_idx').on(table.userId),
// ]);
//
// ============================================
// TYPE DEFINITIONS
// ============================================

type CartItem = {
  productId: string;
  variantId?: string;
  quantity: number;
  price: string;
  productName: string;
  variantName?: string;
  image?: string;
  metadata?: Record<string, any>;
};
