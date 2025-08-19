"use cache";

import { db } from "@/db/drizzle";
import { product, category, user, order } from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { unstable_cacheTag as cacheTag, unstable_cacheLife as cacheLife } from "next/cache";

export interface SiteStats {
  products: number;
  categories: number;
  customers: number;
  orders: number;
}

export const getSiteStats = async (): Promise<SiteStats> => {
  cacheTag("site-stats");
  cacheLife("minutes");

  try {
    const [productsCount, categoriesCount, customersCount, ordersCount] = await Promise.all([
      // Count active products
      db
        .select({ count: count() })
        .from(product)
        .where(eq(product.status, "active")),
      
      // Count active categories
      db
        .select({ count: count() })
        .from(category)
        .where(eq(category.isActive, true)),
      
      // Count customers (non-admin users)
      db
        .select({ count: count() })
        .from(user)
        .where(eq(user.role, "customer")),
      
      // Count total orders
      db
        .select({ count: count() })
        .from(order),
    ]);

    return {
      products: productsCount[0]?.count || 0,
      categories: categoriesCount[0]?.count || 0,
      customers: customersCount[0]?.count || 0,
      orders: ordersCount[0]?.count || 0,
    };
  } catch (error) {
    console.error("Error fetching site stats:", error);
    return {
      products: 0,
      categories: 0,
      customers: 0,
      orders: 0,
    };
  }
};

export const getFormattedSiteStats = async () => {
  const stats = await getSiteStats();
  
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M+`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k+`;
    } else if (num >= 100) {
      return `${num}+`;
    } else {
      return num.toString();
    }
  };

  return {
    products: formatNumber(stats.products),
    categories: formatNumber(stats.categories),
    customers: formatNumber(stats.customers),
    orders: formatNumber(stats.orders),
  };
};