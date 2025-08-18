"use cache";

import { db } from "@/db/drizzle";
import { product, category, productCollection, collection, inventory } from "@/db/schema";
import { eq, and, desc, asc, like, inArray, isNull, or, sql } from "drizzle-orm";
import { unstable_cacheTag as cacheTag, unstable_cacheLife as cacheLife, revalidateTag } from "next/cache";
import { nanoid } from "nanoid";

export interface ProductFilters {
  categoryId?: string;
  collectionId?: string;
  status?: string;
  isFeatured?: boolean;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  tags?: string[];
}

export interface ProductInput {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  sku: string;
  price: string;
  compareAtPrice?: string;
  categoryId?: string;
  status?: string;
  featuredImage?: string;
  images?: string[];
  isFeatured?: boolean;
  tags?: string[];
  publishedAt?: Date;
}

export interface ProductUpdate extends Partial<ProductInput> {
  id: string;
}

export const getProducts = async (
  filters: ProductFilters = {},
  limit = 20,
  offset = 0,
  sortBy: "name" | "price" | "createdAt" | "publishedAt" = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
) => {
  cacheTag("products");
  cacheLife("minutes");

  const conditions = [];

  if (filters.categoryId) {
    conditions.push(eq(product.categoryId, filters.categoryId));
  }

  if (filters.status) {
    conditions.push(eq(product.status, filters.status));
  }

  if (filters.isFeatured !== undefined) {
    conditions.push(eq(product.isFeatured, filters.isFeatured));
  }

  if (filters.priceMin !== undefined) {
    conditions.push(sql`${product.price}::numeric >= ${filters.priceMin}`);
  }

  if (filters.priceMax !== undefined) {
    conditions.push(sql`${product.price}::numeric <= ${filters.priceMax}`);
  }

  if (filters.search) {
    conditions.push(
      or(
        like(product.name, `%${filters.search}%`),
        like(product.description, `%${filters.search}%`),
        like(product.sku, `%${filters.search}%`)
      )
    );
  }

  if (filters.tags && filters.tags.length > 0) {
    conditions.push(
      sql`${product.tags} ?| array[${filters.tags.map(tag => `'${tag}'`).join(',')}]`
    );
  }

  const orderDirection = sortOrder === "asc" ? asc : desc;
  let orderByClause;
  
  switch (sortBy) {
    case "name":
      orderByClause = [orderDirection(product.name)];
      break;
    case "price":
      orderByClause = [orderDirection(sql`${product.price}::numeric`)];
      break;
    case "publishedAt":
      orderByClause = [orderDirection(product.publishedAt)];
      break;
    default:
      orderByClause = [orderDirection(product.createdAt)];
  }

  let query = db
    .select({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      sku: product.sku,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      categoryId: product.categoryId,
      status: product.status,
      featuredImage: product.featuredImage,
      images: product.images,
      isFeatured: product.isFeatured,
      tags: product.tags,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      publishedAt: product.publishedAt,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
    })
    .from(product)
    .leftJoin(category, eq(product.categoryId, category.id));

  if (filters.collectionId) {
    query = query.innerJoin(productCollection, eq(product.id, productCollection.productId));
    conditions.push(eq(productCollection.collectionId, filters.collectionId));
  }

  return await query
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(...orderByClause)
    .limit(limit)
    .offset(offset);
};

export const getProductById = async (id: string) => {
  cacheTag(`product:${id}`);
  cacheLife("minutes");

  const result = await db
    .select({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      sku: product.sku,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      categoryId: product.categoryId,
      status: product.status,
      featuredImage: product.featuredImage,
      images: product.images,
      isFeatured: product.isFeatured,
      tags: product.tags,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      publishedAt: product.publishedAt,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
    })
    .from(product)
    .leftJoin(category, eq(product.categoryId, category.id))
    .where(eq(product.id, id))
    .limit(1);

  return result[0] || null;
};

export const getProductBySlug = async (slug: string) => {
  cacheTag(`product:slug:${slug}`);
  cacheLife("minutes");

  const result = await db
    .select({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      sku: product.sku,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      categoryId: product.categoryId,
      status: product.status,
      featuredImage: product.featuredImage,
      images: product.images,
      isFeatured: product.isFeatured,
      tags: product.tags,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      publishedAt: product.publishedAt,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
    })
    .from(product)
    .leftJoin(category, eq(product.categoryId, category.id))
    .where(eq(product.slug, slug))
    .limit(1);

  return result[0] || null;
};

export const getProductsBySku = async (skus: string[]) => {
  cacheTag("products");
  cacheLife("minutes");

  return await db
    .select()
    .from(product)
    .where(inArray(product.sku, skus));
};

export const getFeaturedProducts = async (limit = 10) => {
  cacheTag("products:featured");
  cacheLife("minutes");

  return await db
    .select({
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      sku: product.sku,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      featuredImage: product.featuredImage,
      tags: product.tags,
      publishedAt: product.publishedAt,
    })
    .from(product)
    .where(and(eq(product.isFeatured, true), eq(product.status, "active")))
    .orderBy(desc(product.publishedAt))
    .limit(limit);
};

export const getProductsByCategory = async (categoryId: string, limit = 20, offset = 0) => {
  cacheTag(`products:category:${categoryId}`);
  cacheLife("minutes");

  return await db
    .select({
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      sku: product.sku,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      featuredImage: product.featuredImage,
      isFeatured: product.isFeatured,
      tags: product.tags,
      publishedAt: product.publishedAt,
    })
    .from(product)
    .where(and(eq(product.categoryId, categoryId), eq(product.status, "active")))
    .orderBy(desc(product.publishedAt))
    .limit(limit)
    .offset(offset);
};

export const getProductsByCollection = async (collectionId: string, limit = 20, offset = 0) => {
  cacheTag(`products:collection:${collectionId}`);
  cacheLife("minutes");

  return await db
    .select({
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      sku: product.sku,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      featuredImage: product.featuredImage,
      isFeatured: product.isFeatured,
      tags: product.tags,
      publishedAt: product.publishedAt,
      position: productCollection.position,
    })
    .from(product)
    .innerJoin(productCollection, eq(product.id, productCollection.productId))
    .where(and(
      eq(productCollection.collectionId, collectionId),
      eq(product.status, "active")
    ))
    .orderBy(asc(productCollection.position), desc(product.publishedAt))
    .limit(limit)
    .offset(offset);
};

export const createProduct = async (input: ProductInput) => {
  const id = nanoid();
  const now = new Date();

  const result = await db
    .insert(product)
    .values({
      id,
      name: input.name,
      slug: input.slug,
      description: input.description,
      shortDescription: input.shortDescription,
      sku: input.sku,
      price: input.price,
      compareAtPrice: input.compareAtPrice,
      categoryId: input.categoryId,
      status: input.status || "draft",
      featuredImage: input.featuredImage,
      images: input.images || [],
      isFeatured: input.isFeatured || false,
      tags: input.tags || [],
      publishedAt: input.publishedAt,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  revalidateTag("products");
  if (input.categoryId) {
    revalidateTag(`products:category:${input.categoryId}`);
  }
  if (input.isFeatured) {
    revalidateTag("products:featured");
  }

  return result[0];
};

export const updateProduct = async (input: ProductUpdate) => {
  const { id, ...updateData } = input;
  const now = new Date();

  const existingProduct = await getProductById(id);
  if (!existingProduct) {
    throw new Error("Product not found");
  }

  const result = await db
    .update(product)
    .set({
      ...updateData,
      updatedAt: now,
    })
    .where(eq(product.id, id))
    .returning();

  revalidateTag("products");
  revalidateTag(`product:${id}`);
  revalidateTag(`product:slug:${existingProduct.slug}`);

  if (existingProduct.categoryId) {
    revalidateTag(`products:category:${existingProduct.categoryId}`);
  }
  if (updateData.categoryId && updateData.categoryId !== existingProduct.categoryId) {
    revalidateTag(`products:category:${updateData.categoryId}`);
  }
  if (existingProduct.isFeatured || updateData.isFeatured) {
    revalidateTag("products:featured");
  }

  if (updateData.slug && updateData.slug !== existingProduct.slug) {
    revalidateTag(`product:slug:${updateData.slug}`);
  }

  return result[0];
};

export const deleteProduct = async (id: string) => {
  const existingProduct = await getProductById(id);
  if (!existingProduct) {
    throw new Error("Product not found");
  }

  await db.delete(product).where(eq(product.id, id));

  revalidateTag("products");
  revalidateTag(`product:${id}`);
  revalidateTag(`product:slug:${existingProduct.slug}`);

  if (existingProduct.categoryId) {
    revalidateTag(`products:category:${existingProduct.categoryId}`);
  }
  if (existingProduct.isFeatured) {
    revalidateTag("products:featured");
  }

  return { success: true };
};

export const publishProduct = async (id: string) => {
  const now = new Date();

  return await updateProduct({
    id,
    status: "active",
    publishedAt: now,
  });
};

export const unpublishProduct = async (id: string) => {
  return await updateProduct({
    id,
    status: "draft",
    publishedAt: undefined,
  });
};

export const addProductToCollection = async (productId: string, collectionId: string, position = 0) => {
  const now = new Date();

  await db
    .insert(productCollection)
    .values({
      productId,
      collectionId,
      position,
      createdAt: now,
    })
    .onConflictDoUpdate({
      target: [productCollection.productId, productCollection.collectionId],
      set: { position },
    });

  revalidateTag(`products:collection:${collectionId}`);
  revalidateTag(`product:${productId}`);

  return { success: true };
};

export const removeProductFromCollection = async (productId: string, collectionId: string) => {
  await db
    .delete(productCollection)
    .where(
      and(
        eq(productCollection.productId, productId),
        eq(productCollection.collectionId, collectionId)
      )
    );

  revalidateTag(`products:collection:${collectionId}`);
  revalidateTag(`product:${productId}`);

  return { success: true };
};

export const getProductInventory = async (productId: string) => {
  cacheTag(`product:${productId}:inventory`);
  cacheLife("minutes");

  const result = await db
    .select()
    .from(inventory)
    .where(eq(inventory.productId, productId))
    .limit(1);

  return result[0] || null;
};

export const updateProductInventory = async (
  productId: string,
  quantity: number,
  lowStockThreshold?: number
) => {
  const now = new Date();
  const id = nanoid();

  const result = await db
    .insert(inventory)
    .values({
      id,
      productId,
      quantity,
      lowStockThreshold,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [inventory.productId],
      set: {
        quantity,
        lowStockThreshold,
        updatedAt: now,
      },
    })
    .returning();

  revalidateTag(`product:${productId}:inventory`);

  return result[0];
};

export const bulkUpdateProductStatus = async (ids: string[], status: string) => {
  const now = new Date();

  await db
    .update(product)
    .set({
      status,
      updatedAt: now,
      ...(status === "active" ? { publishedAt: now } : {}),
    })
    .where(inArray(product.id, ids));

  revalidateTag("products");
  ids.forEach(id => {
    revalidateTag(`product:${id}`);
  });

  return { success: true };
};
