"use cache";

import { db } from "@/db/drizzle";
import { collection, product, productCollection } from "@/db/schema";
import { eq, and, desc, asc, like, sql, count, inArray } from "drizzle-orm";
import { unstable_cacheTag as cacheTag, unstable_cacheLife as cacheLife, revalidateTag } from "next/cache";
import { nanoid } from "nanoid";

export interface CollectionFilters {
  isActive?: boolean;
  search?: string;
  includeInactive?: boolean;
}

export interface CollectionInput {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  sortOrder?: string;
}

export interface CollectionUpdate extends Partial<CollectionInput> {
  id: string;
}

export interface CollectionWithStats {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: string;
  createdAt: Date;
  updatedAt: Date;
  productCount: number;
}

export interface CollectionProduct {
  productId: string;
  collectionId: string;
  position: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    featuredImage?: string;
    status: string;
  };
}

export const getCollections = async (
  filters: CollectionFilters = {},
  limit = 50,
  offset = 0,
  sortBy: "name" | "createdAt" | "updatedAt" = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
) => {
  cacheTag("collections");
  cacheLife("minutes");

  const conditions = [];

  if (filters.isActive !== undefined) {
    conditions.push(eq(collection.isActive, filters.isActive));
  }

  if (filters.search) {
    conditions.push(
      like(collection.name, `%${filters.search}%`)
    );
  }

  if (!filters.includeInactive) {
    conditions.push(eq(collection.isActive, true));
  }

  const orderDirection = sortOrder === "asc" ? asc : desc;
  let orderByClause;
  
  switch (sortBy) {
    case "name":
      orderByClause = [orderDirection(collection.name)];
      break;
    case "updatedAt":
      orderByClause = [orderDirection(collection.updatedAt)];
      break;
    default:
      orderByClause = [orderDirection(collection.createdAt)];
  }

  return await db
    .select({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      image: collection.image,
      isActive: collection.isActive,
      sortOrder: collection.sortOrder,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    })
    .from(collection)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(...orderByClause)
    .limit(limit)
    .offset(offset);
};

export const getCollectionsWithProductCount = async (filters: CollectionFilters = {}) => {
  cacheTag("collections:with-counts");
  cacheLife("minutes");

  const conditions = [];

  if (!filters.includeInactive) {
    conditions.push(eq(collection.isActive, true));
  }

  if (filters.search) {
    conditions.push(
      like(collection.name, `%${filters.search}%`)
    );
  }

  return await db
    .select({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      image: collection.image,
      isActive: collection.isActive,
      sortOrder: collection.sortOrder,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      productCount: sql<number>`count(${productCollection.productId})::int`,
    })
    .from(collection)
    .leftJoin(productCollection, eq(collection.id, productCollection.collectionId))
    .leftJoin(product, and(
      eq(productCollection.productId, product.id),
      eq(product.status, "active")
    ))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(collection.id)
    .orderBy(desc(collection.createdAt));
};

export const getCollectionById = async (id: string) => {
  cacheTag(`collection:${id}`);
  cacheLife("minutes");

  const result = await db
    .select({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      image: collection.image,
      isActive: collection.isActive,
      sortOrder: collection.sortOrder,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    })
    .from(collection)
    .where(eq(collection.id, id))
    .limit(1);

  return result[0] || null;
};

export const getCollectionBySlug = async (slug: string) => {
  cacheTag(`collection:slug:${slug}`);
  cacheLife("minutes");

  const result = await db
    .select({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      image: collection.image,
      isActive: collection.isActive,
      sortOrder: collection.sortOrder,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    })
    .from(collection)
    .where(eq(collection.slug, slug))
    .limit(1);

  return result[0] || null;
};

export const getCollectionProducts = async (
  collectionId: string,
  limit = 20,
  offset = 0,
  includeInactive = false
) => {
  cacheTag(`collection:${collectionId}:products`);
  cacheLife("minutes");

  const conditions = [eq(productCollection.collectionId, collectionId)];

  if (!includeInactive) {
    conditions.push(eq(product.status, "active"));
  }

  return await db
    .select({
      productId: productCollection.productId,
      collectionId: productCollection.collectionId,
      position: productCollection.position,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        sku: product.sku,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        featuredImage: product.featuredImage,
        status: product.status,
        isFeatured: product.isFeatured,
        tags: product.tags,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    })
    .from(productCollection)
    .innerJoin(product, eq(productCollection.productId, product.id))
    .where(and(...conditions))
    .orderBy(asc(productCollection.position), desc(product.createdAt))
    .limit(limit)
    .offset(offset);
};

export const getProductCollections = async (productId: string) => {
  cacheTag(`product:${productId}:collections`);
  cacheLife("minutes");

  return await db
    .select({
      productId: productCollection.productId,
      collectionId: productCollection.collectionId,
      position: productCollection.position,
      collection: {
        id: collection.id,
        name: collection.name,
        slug: collection.slug,
        description: collection.description,
        image: collection.image,
        isActive: collection.isActive,
      },
    })
    .from(productCollection)
    .innerJoin(collection, eq(productCollection.collectionId, collection.id))
    .where(eq(productCollection.productId, productId))
    .orderBy(asc(productCollection.position));
};

export const createCollection = async (input: CollectionInput) => {
  const id = nanoid();
  const now = new Date();

  const result = await db
    .insert(collection)
    .values({
      id,
      name: input.name,
      slug: input.slug,
      description: input.description,
      image: input.image,
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? "manual",
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  revalidateTag("collections");
  revalidateTag("collections:with-counts");

  return result[0];
};

export const updateCollection = async (input: CollectionUpdate) => {
  const { id, ...updateData } = input;
  const now = new Date();

  const existingCollection = await getCollectionById(id);
  if (!existingCollection) {
    throw new Error("Collection not found");
  }

  const result = await db
    .update(collection)
    .set({
      ...updateData,
      updatedAt: now,
    })
    .where(eq(collection.id, id))
    .returning();

  revalidateTag("collections");
  revalidateTag("collections:with-counts");
  revalidateTag(`collection:${id}`);
  revalidateTag(`collection:slug:${existingCollection.slug}`);
  revalidateTag(`collection:${id}:products`);

  if (updateData.slug && updateData.slug !== existingCollection.slug) {
    revalidateTag(`collection:slug:${updateData.slug}`);
  }

  return result[0];
};

export const deleteCollection = async (id: string) => {
  const existingCollection = await getCollectionById(id);
  if (!existingCollection) {
    throw new Error("Collection not found");
  }

  // Delete all product-collection relationships first
  await db.delete(productCollection).where(eq(productCollection.collectionId, id));

  // Delete the collection
  await db.delete(collection).where(eq(collection.id, id));

  revalidateTag("collections");
  revalidateTag("collections:with-counts");
  revalidateTag(`collection:${id}`);
  revalidateTag(`collection:slug:${existingCollection.slug}`);
  revalidateTag(`collection:${id}:products`);

  return { success: true };
};

export const addProductToCollection = async (
  productId: string,
  collectionId: string,
  position?: number
) => {
  const now = new Date();

  // If no position specified, add to the end
  if (position === undefined) {
    const maxPosition = await db
      .select({
        maxPos: sql<number>`coalesce(max(${productCollection.position}), -1)`
      })
      .from(productCollection)
      .where(eq(productCollection.collectionId, collectionId));

    position = (maxPosition[0]?.maxPos ?? -1) + 1;
  }

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

  revalidateTag(`collection:${collectionId}:products`);
  revalidateTag(`product:${productId}:collections`);
  revalidateTag("collections:with-counts");

  return { success: true };
};

export const removeProductFromCollection = async (
  productId: string,
  collectionId: string
) => {
  await db
    .delete(productCollection)
    .where(
      and(
        eq(productCollection.productId, productId),
        eq(productCollection.collectionId, collectionId)
      )
    );

  revalidateTag(`collection:${collectionId}:products`);
  revalidateTag(`product:${productId}:collections`);
  revalidateTag("collections:with-counts");

  return { success: true };
};

export const updateProductPositionInCollection = async (
  productId: string,
  collectionId: string,
  newPosition: number
) => {
  await db
    .update(productCollection)
    .set({ position: newPosition })
    .where(
      and(
        eq(productCollection.productId, productId),
        eq(productCollection.collectionId, collectionId)
      )
    );

  revalidateTag(`collection:${collectionId}:products`);
  revalidateTag(`product:${productId}:collections`);

  return { success: true };
};

export const bulkAddProductsToCollection = async (
  productIds: string[],
  collectionId: string
) => {
  const now = new Date();

  // Get current max position
  const maxPosition = await db
    .select({
      maxPos: sql<number>`coalesce(max(${productCollection.position}), -1)`
    })
    .from(productCollection)
    .where(eq(productCollection.collectionId, collectionId));

  let position = (maxPosition[0]?.maxPos ?? -1) + 1;

  const values = productIds.map((productId) => ({
    productId,
    collectionId,
    position: position++,
    createdAt: now,
  }));

  await db
    .insert(productCollection)
    .values(values)
    .onConflictDoNothing();

  revalidateTag(`collection:${collectionId}:products`);
  revalidateTag("collections:with-counts");

  // Revalidate each product's collections
  productIds.forEach(productId => {
    revalidateTag(`product:${productId}:collections`);
  });

  return { success: true };
};

export const bulkRemoveProductsFromCollection = async (
  productIds: string[],
  collectionId: string
) => {
  await db
    .delete(productCollection)
    .where(
      and(
        inArray(productCollection.productId, productIds),
        eq(productCollection.collectionId, collectionId)
      )
    );

  revalidateTag(`collection:${collectionId}:products`);
  revalidateTag("collections:with-counts");

  // Revalidate each product's collections
  productIds.forEach(productId => {
    revalidateTag(`product:${productId}:collections`);
  });

  return { success: true };
};

export const reorderCollectionProducts = async (
  collectionId: string,
  productPositions: { productId: string; position: number }[]
) => {
  for (const { productId, position } of productPositions) {
    await db
      .update(productCollection)
      .set({ position })
      .where(
        and(
          eq(productCollection.productId, productId),
          eq(productCollection.collectionId, collectionId)
        )
      );
  }

  revalidateTag(`collection:${collectionId}:products`);

  return { success: true };
};

export const searchCollections = async (query: string, limit = 10) => {
  cacheTag(`collections:search:${query}`);
  cacheLife("minutes");

  return await db
    .select({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      image: collection.image,
    })
    .from(collection)
    .where(
      and(
        like(collection.name, `%${query}%`),
        eq(collection.isActive, true)
      )
    )
    .orderBy(asc(collection.name))
    .limit(limit);
};

export const getFeaturedCollections = async (limit = 10) => {
  cacheTag("collections:featured");
  cacheLife("minutes");

  // Since there's no featured flag in collections, we'll return recent active collections
  return await db
    .select({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      image: collection.image,
      createdAt: collection.createdAt,
    })
    .from(collection)
    .where(eq(collection.isActive, true))
    .orderBy(desc(collection.createdAt))
    .limit(limit);
};

export const getCollectionStats = async (collectionId: string) => {
  cacheTag(`collection:${collectionId}:stats`);
  cacheLife("minutes");

  const stats = await db
    .select({
      totalProducts: count(productCollection.productId),
      activeProducts: sql<number>`count(case when ${product.status} = 'active' then 1 end)::int`,
    })
    .from(productCollection)
    .leftJoin(product, eq(productCollection.productId, product.id))
    .where(eq(productCollection.collectionId, collectionId));

  return stats[0] || { totalProducts: 0, activeProducts: 0 };
};
