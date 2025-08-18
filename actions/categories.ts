"use cache";

import { db } from "@/db/drizzle";
import { category, product } from "@/db/schema";
import { eq, and, desc, asc, like, isNull, sql, count } from "drizzle-orm";
import { unstable_cacheTag as cacheTag, unstable_cacheLife as cacheLife, revalidateTag } from "next/cache";
import { nanoid } from "nanoid";

export interface CategoryFilters {
  parentId?: string | null;
  isActive?: boolean;
  search?: string;
  includeInactive?: boolean;
}

export interface CategoryInput {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  displayOrder?: number;
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface CategoryUpdate extends Partial<CategoryInput> {
  id: string;
}

export interface CategoryWithStats {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  displayOrder: number;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  createdAt: Date;
  updatedAt: Date;
  productCount: number;
  children?: CategoryWithStats[];
  parent?: {
    id: string;
    name: string;
    slug: string;
  };
}

export const getCategories = async (
  filters: CategoryFilters = {},
  limit = 50,
  offset = 0,
  sortBy: "name" | "displayOrder" | "createdAt" = "displayOrder",
  sortOrder: "asc" | "desc" = "asc"
) => {
  cacheTag("categories");
  cacheLife("minutes");

  const conditions = [];

  if (filters.parentId !== undefined) {
    if (filters.parentId === null) {
      conditions.push(isNull(category.parentId));
    } else {
      conditions.push(eq(category.parentId, filters.parentId));
    }
  }

  if (filters.isActive !== undefined) {
    conditions.push(eq(category.isActive, filters.isActive));
  }

  if (filters.search) {
    conditions.push(
      like(category.name, `%${filters.search}%`)
    );
  }

  if (!filters.includeInactive) {
    conditions.push(eq(category.isActive, true));
  }

  const orderDirection = sortOrder === "asc" ? asc : desc;
  let orderByClause;
  
  switch (sortBy) {
    case "name":
      orderByClause = [orderDirection(category.name)];
      break;
    case "createdAt":
      orderByClause = [orderDirection(category.createdAt)];
      break;
    default:
      orderByClause = [orderDirection(category.displayOrder), asc(category.name)];
  }

  return await db
    .select({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      parentId: category.parentId,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
      metaKeywords: category.metaKeywords,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    })
    .from(category)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(...orderByClause)
    .limit(limit)
    .offset(offset);
};

export const getCategoriesWithProductCount = async (filters: CategoryFilters = {}) => {
  cacheTag("categories:with-counts");
  cacheLife("minutes");

  const conditions = [];

  if (filters.parentId !== undefined) {
    if (filters.parentId === null) {
      conditions.push(isNull(category.parentId));
    } else {
      conditions.push(eq(category.parentId, filters.parentId));
    }
  }

  if (!filters.includeInactive) {
    conditions.push(eq(category.isActive, true));
  }

  return await db
    .select({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      parentId: category.parentId,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
      metaKeywords: category.metaKeywords,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      productCount: sql<number>`count(${product.id})::int`,
    })
    .from(category)
    .leftJoin(product, and(
      eq(category.id, product.categoryId),
      eq(product.status, "active")
    ))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(category.id)
    .orderBy(asc(category.displayOrder), asc(category.name));
};

export const getCategoryById = async (id: string) => {
  cacheTag(`category:${id}`);
  cacheLife("minutes");

  const result = await db
    .select({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      parentId: category.parentId,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
      metaKeywords: category.metaKeywords,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    })
    .from(category)
    .where(eq(category.id, id))
    .limit(1);

  return result[0] || null;
};

export const getCategoryBySlug = async (slug: string) => {
  cacheTag(`category:slug:${slug}`);
  cacheLife("minutes");

  const result = await db
    .select({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      parentId: category.parentId,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
      metaKeywords: category.metaKeywords,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    })
    .from(category)
    .where(eq(category.slug, slug))
    .limit(1);

  return result[0] || null;
};

export const getCategoryWithParent = async (id: string) => {
  cacheTag(`category:${id}:with-parent`);
  cacheLife("minutes");

  const result = await db
    .select({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      parentId: category.parentId,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
      metaKeywords: category.metaKeywords,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      parent: {
        id: sql<string>`parent_category.id`,
        name: sql<string>`parent_category.name`,
        slug: sql<string>`parent_category.slug`,
      },
    })
    .from(category)
    .leftJoin(
      sql`${category} as parent_category`,
      eq(category.parentId, sql`parent_category.id`)
    )
    .where(eq(category.id, id))
    .limit(1);

  return result[0] || null;
};

export const getCategoryChildren = async (parentId: string, includeInactive = false) => {
  cacheTag(`category:${parentId}:children`);
  cacheLife("minutes");

  const conditions = [eq(category.parentId, parentId)];

  if (!includeInactive) {
    conditions.push(eq(category.isActive, true));
  }

  return await db
    .select({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    })
    .from(category)
    .where(and(...conditions))
    .orderBy(asc(category.displayOrder), asc(category.name));
};

export const getRootCategories = async (includeInactive = false) => {
  cacheTag("categories:root");
  cacheLife("minutes");

  const conditions = [isNull(category.parentId)];

  if (!includeInactive) {
    conditions.push(eq(category.isActive, true));
  }

  return await db
    .select({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    })
    .from(category)
    .where(and(...conditions))
    .orderBy(asc(category.displayOrder), asc(category.name));
};

export const getCategoryTree = async (includeInactive = false): Promise<CategoryWithStats[]> => {
  const rootCategories = await getRootCategories(includeInactive);

  const buildTree = async (cats: any[]): Promise<CategoryWithStats[]> => {
    const result: CategoryWithStats[] = [];

    for (const cat of cats) {
      const children = await getCategoryChildren(cat.id, includeInactive);
      const childrenWithTree = children.length > 0 ? await buildTree(children) : [];

      result.push({
        ...cat,
        productCount: 0, // This would need a separate query for performance
        children: childrenWithTree,
      });
    }

    return result;
  };

  return await buildTree(rootCategories);
};

export const createCategory = async (input: CategoryInput) => {
  const id = nanoid();
  const now = new Date();

  const result = await db
    .insert(category)
    .values({
      id,
      name: input.name,
      slug: input.slug,
      description: input.description,
      image: input.image,
      parentId: input.parentId,
      displayOrder: input.displayOrder ?? 0,
      isActive: input.isActive ?? true,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      metaKeywords: input.metaKeywords,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  revalidateTag("categories");
  revalidateTag("categories:with-counts");
  revalidateTag("categories:root");

  if (input.parentId) {
    revalidateTag(`category:${input.parentId}:children`);
  }

  return result[0];
};

export const updateCategory = async (input: CategoryUpdate) => {
  const { id, ...updateData } = input;
  const now = new Date();

  const existingCategory = await getCategoryById(id);
  if (!existingCategory) {
    throw new Error("Category not found");
  }

  const result = await db
    .update(category)
    .set({
      ...updateData,
      updatedAt: now,
    })
    .where(eq(category.id, id))
    .returning();

  revalidateTag("categories");
  revalidateTag("categories:with-counts");
  revalidateTag("categories:root");
  revalidateTag(`category:${id}`);
  revalidateTag(`category:slug:${existingCategory.slug}`);
  revalidateTag(`category:${id}:with-parent`);
  revalidateTag(`category:${id}:children`);

  if (existingCategory.parentId) {
    revalidateTag(`category:${existingCategory.parentId}:children`);
  }

  if (updateData.parentId && updateData.parentId !== existingCategory.parentId) {
    revalidateTag(`category:${updateData.parentId}:children`);
  }

  if (updateData.slug && updateData.slug !== existingCategory.slug) {
    revalidateTag(`category:slug:${updateData.slug}`);
  }

  return result[0];
};

export const deleteCategory = async (id: string) => {
  const existingCategory = await getCategoryById(id);
  if (!existingCategory) {
    throw new Error("Category not found");
  }

  // Check if category has children
  const children = await getCategoryChildren(id, true);
  if (children.length > 0) {
    throw new Error("Cannot delete category with subcategories. Delete subcategories first.");
  }

  // Check if category has products
  const productCount = await db
    .select({ count: count() })
    .from(product)
    .where(eq(product.categoryId, id));

  if (productCount[0].count > 0) {
    throw new Error("Cannot delete category with products. Move or delete products first.");
  }

  await db.delete(category).where(eq(category.id, id));

  revalidateTag("categories");
  revalidateTag("categories:with-counts");
  revalidateTag("categories:root");
  revalidateTag(`category:${id}`);
  revalidateTag(`category:slug:${existingCategory.slug}`);
  revalidateTag(`category:${id}:with-parent`);
  revalidateTag(`category:${id}:children`);

  if (existingCategory.parentId) {
    revalidateTag(`category:${existingCategory.parentId}:children`);
  }

  return { success: true };
};

export const updateCategoryDisplayOrder = async (categoryUpdates: { id: string; displayOrder: number }[]) => {
  const now = new Date();

  for (const update of categoryUpdates) {
    await db
      .update(category)
      .set({
        displayOrder: update.displayOrder,
        updatedAt: now,
      })
      .where(eq(category.id, update.id));
  }

  revalidateTag("categories");
  revalidateTag("categories:with-counts");
  revalidateTag("categories:root");

  // Revalidate individual categories and their parents
  for (const update of categoryUpdates) {
    revalidateTag(`category:${update.id}`);

    const cat = await getCategoryById(update.id);
    if (cat?.parentId) {
      revalidateTag(`category:${cat.parentId}:children`);
    }
  }

  return { success: true };
};

export const getCategoryPath = async (categoryId: string): Promise<{ id: string; name: string; slug: string }[]> => {
  cacheTag(`category:${categoryId}:path`);
  cacheLife("minutes");

  const path: { id: string; name: string; slug: string }[] = [];
  let currentId = categoryId;

  while (currentId) {
    const cat = await getCategoryById(currentId);
    if (!cat) break;

    path.unshift({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
    });

    currentId = cat.parentId || '';
  }

  return path;
};

export const searchCategories = async (query: string, limit = 10) => {
  cacheTag(`categories:search:${query}`);
  cacheLife("minutes");

  return await db
    .select({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
    })
    .from(category)
    .where(
      and(
        like(category.name, `%${query}%`),
        eq(category.isActive, true)
      )
    )
    .orderBy(asc(category.name))
    .limit(limit);
};
