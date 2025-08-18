"use cache";

import { db } from "@/db/drizzle";
import { cart, product, user } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { unstable_cacheTag as cacheTag, unstable_cacheLife as cacheLife, revalidateTag } from "next/cache";
import { nanoid } from "nanoid";

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: string;
  productName: string;
  variantName?: string;
  image?: string;
  metadata?: Record<string, unknown>;
}

export interface CartFilters {
  userId?: string;
  sessionId?: string;
}

export interface CartInput {
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  total: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  expiresAt?: Date;
}

export interface CartUpdate extends Partial<CartInput> {
  id: string;
}

export interface AddToCartInput {
  cartId?: string;
  userId?: string;
  sessionId?: string;
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  cartId: string;
  productId: string;
  variantId?: string;
  quantity: number;
}

export const getCarts = async (
  filters: CartFilters = {},
  limit = 20,
  offset = 0
) => {
  cacheTag("carts");
  cacheLife("minutes");

  const conditions = [];

  if (filters.userId) {
    conditions.push(eq(cart.userId, filters.userId));
  }

  if (filters.sessionId) {
    conditions.push(eq(cart.sessionId, filters.sessionId));
  }

  return await db
    .select({
      id: cart.id,
      userId: cart.userId,
      sessionId: cart.sessionId,
      items: cart.items,
      total: cart.total,
      notes: cart.notes,
      metadata: cart.metadata,
      expiresAt: cart.expiresAt,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
    .from(cart)
    .leftJoin(user, eq(cart.userId, user.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(cart.updatedAt))
    .limit(limit)
    .offset(offset);
};

export const getCartById = async (id: string) => {
  cacheTag(`cart:${id}`);
  cacheLife("minutes");

  const result = await db
    .select({
      id: cart.id,
      userId: cart.userId,
      sessionId: cart.sessionId,
      items: cart.items,
      total: cart.total,
      notes: cart.notes,
      metadata: cart.metadata,
      expiresAt: cart.expiresAt,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    })
    .from(cart)
    .where(eq(cart.id, id))
    .limit(1);

  return result[0] || null;
};

export const getCartByUser = async (userId: string) => {
  cacheTag(`cart:user:${userId}`);
  cacheLife("minutes");

  const result = await db
    .select()
    .from(cart)
    .where(eq(cart.userId, userId))
    .orderBy(desc(cart.updatedAt))
    .limit(1);

  return result[0] || null;
};

export const getCartBySession = async (sessionId: string) => {
  cacheTag(`cart:session:${sessionId}`);
  cacheLife("minutes");

  const result = await db
    .select()
    .from(cart)
    .where(eq(cart.sessionId, sessionId))
    .orderBy(desc(cart.updatedAt))
    .limit(1);

  return result[0] || null;
};

export const getOrCreateCart = async (userId?: string, sessionId?: string) => {
  if (!userId && !sessionId) {
    throw new Error("Either userId or sessionId must be provided");
  }

  let existingCart;

  if (userId) {
    existingCart = await getCartByUser(userId);
  } else if (sessionId) {
    existingCart = await getCartBySession(sessionId);
  }

  if (existingCart) {
    return existingCart;
  }

  return await createCart({
    userId,
    sessionId,
    items: [],
    total: "0.00",
  });
};

export const createCart = async (input: CartInput) => {
  const id = nanoid();
  const now = new Date();

  const result = await db
    .insert(cart)
    .values({
      id,
      userId: input.userId,
      sessionId: input.sessionId,
      items: input.items,
      total: input.total,
      notes: input.notes,
      metadata: input.metadata || {},
      expiresAt: input.expiresAt,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  revalidateTag("carts");
  if (input.userId) {
    revalidateTag(`cart:user:${input.userId}`);
  }
  if (input.sessionId) {
    revalidateTag(`cart:session:${input.sessionId}`);
  }

  return result[0];
};

export const updateCart = async (input: CartUpdate) => {
  const { id, ...updateData } = input;
  const now = new Date();

  const existingCart = await getCartById(id);
  if (!existingCart) {
    throw new Error("Cart not found");
  }

  const result = await db
    .update(cart)
    .set({
      ...updateData,
      updatedAt: now,
    })
    .where(eq(cart.id, id))
    .returning();

  revalidateTag("carts");
  revalidateTag(`cart:${id}`);
  if (existingCart.userId) {
    revalidateTag(`cart:user:${existingCart.userId}`);
  }
  if (existingCart.sessionId) {
    revalidateTag(`cart:session:${existingCart.sessionId}`);
  }

  return result[0];
};

export const addToCart = async (input: AddToCartInput) => {
  const { cartId, userId, sessionId, productId, variantId, quantity } = input;

  let targetCart;

  if (cartId) {
    targetCart = await getCartById(cartId);
    if (!targetCart) {
      throw new Error("Cart not found");
    }
  } else {
    targetCart = await getOrCreateCart(userId, sessionId);
  }

  const productResult = await db
    .select({
      id: product.id,
      name: product.name,
      price: product.price,
      featuredImage: product.featuredImage,
    })
    .from(product)
    .where(eq(product.id, productId))
    .limit(1);

  if (!productResult[0]) {
    throw new Error("Product not found");
  }

  const productData = productResult[0];
  const currentItems = targetCart.items as CartItem[];

  const existingItemIndex = currentItems.findIndex(
    item => item.productId === productId && item.variantId === variantId
  );

  let updatedItems: CartItem[];

  if (existingItemIndex >= 0) {
    updatedItems = [...currentItems];
    updatedItems[existingItemIndex] = {
      ...updatedItems[existingItemIndex],
      quantity: updatedItems[existingItemIndex].quantity + quantity,
    };
  } else {
    const newItem: CartItem = {
      productId,
      variantId,
      quantity,
      price: productData.price,
      productName: productData.name,
      image: productData.featuredImage || undefined,
    };
    updatedItems = [...currentItems, newItem];
  }

  const total = updatedItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  ).toFixed(2);

  return await updateCart({
    id: targetCart.id,
    items: updatedItems,
    total,
  });
};

export const updateCartItem = async (input: UpdateCartItemInput) => {
  const { cartId, productId, variantId, quantity } = input;

  const targetCart = await getCartById(cartId);
  if (!targetCart) {
    throw new Error("Cart not found");
  }

  const currentItems = targetCart.items as CartItem[];
  const itemIndex = currentItems.findIndex(
    item => item.productId === productId && item.variantId === variantId
  );

  if (itemIndex === -1) {
    throw new Error("Item not found in cart");
  }

  let updatedItems: CartItem[];

  if (quantity <= 0) {
    updatedItems = currentItems.filter((_, index) => index !== itemIndex);
  } else {
    updatedItems = [...currentItems];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      quantity,
    };
  }

  const total = updatedItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  ).toFixed(2);

  return await updateCart({
    id: cartId,
    items: updatedItems,
    total,
  });
};

export const removeFromCart = async (
  cartId: string,
  productId: string,
  variantId?: string
) => {
  return await updateCartItem({
    cartId,
    productId,
    variantId,
    quantity: 0,
  });
};

export const clearCart = async (cartId: string) => {
  return await updateCart({
    id: cartId,
    items: [],
    total: "0.00",
  });
};

export const deleteCart = async (id: string) => {
  const existingCart = await getCartById(id);
  if (!existingCart) {
    throw new Error("Cart not found");
  }

  await db.delete(cart).where(eq(cart.id, id));

  revalidateTag("carts");
  revalidateTag(`cart:${id}`);
  if (existingCart.userId) {
    revalidateTag(`cart:user:${existingCart.userId}`);
  }
  if (existingCart.sessionId) {
    revalidateTag(`cart:session:${existingCart.sessionId}`);
  }

  return { success: true };
};

export const mergeGuestCartToUser = async (sessionId: string, userId: string) => {
  const guestCart = await getCartBySession(sessionId);
  if (!guestCart || !guestCart.items || (guestCart.items as CartItem[]).length === 0) {
    return null;
  }

  const userCart = await getCartByUser(userId);

  if (!userCart) {
    return await updateCart({
      id: guestCart.id,
      userId,
      sessionId: undefined,
    });
  }

  const guestItems = guestCart.items as CartItem[];
  const userItems = userCart.items as CartItem[];

  const mergedItems = [...userItems];

  for (const guestItem of guestItems) {
    const existingIndex = mergedItems.findIndex(
      item => item.productId === guestItem.productId && item.variantId === guestItem.variantId
    );

    if (existingIndex >= 0) {
      mergedItems[existingIndex].quantity += guestItem.quantity;
    } else {
      mergedItems.push(guestItem);
    }
  }

  const total = mergedItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  ).toFixed(2);

  await deleteCart(guestCart.id);

  return await updateCart({
    id: userCart.id,
    items: mergedItems,
    total,
  });
};

export const getCartItemCount = async (cartId: string) => {
  cacheTag(`cart:${cartId}:count`);
  cacheLife("minutes");

  const cartData = await getCartById(cartId);
  if (!cartData) return 0;

  const items = cartData.items as CartItem[];
  return items.reduce((count, item) => count + item.quantity, 0);
};
