import { getDictionary, Lang, locales } from "@/actions/dictionaries";
import { getCategoryBySlug, getCategories } from "@/actions/categories";
import { getProductsByCategory } from "@/actions/products";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/home/product-card";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";

// Enable ISR with 2 hours revalidation for category pages
export const revalidate = 7200; // 2 hours

// Generate static paths for existing categories
export async function generateStaticParams() {
  try {
    const categories = await getCategories({ isActive: true }, 50);

    const params = [];
    for (const lang of locales) {
      for (const cat of categories) {
        if (cat.slug) {
          params.push({ lang, slug: cat.slug });
        }
      }
    }
    
    return params;
  } catch (error) {
    console.error("Error generating static params for categories:", error);
    return [];
  }
}

async function CategoryProductsGrid({ 
  categoryId, 
  lang 
}: { 
  categoryId: string; 
  lang: Lang; 
}) {
  const products = await getProductsByCategory(categoryId, 20, 0);
  const dict = await getDictionary(lang);

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {dict.categories?.noProducts || "No products in this category"}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {dict.categories?.checkOtherCategories || "Check out other categories or try again later."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          dict={{ 
            featured: dict.home.featured, 
            product: dict.product 
          }}
          lang={lang}
        />
      ))}
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categoryData = await getCategoryBySlug(slug);

  if (!categoryData) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: categoryData.metaTitle || categoryData.name,
    description: categoryData.metaDescription || categoryData.description || `Shop ${categoryData.name} - Find the best products in this category`,
    openGraph: {
      title: categoryData.metaTitle || categoryData.name,
      description: categoryData.metaDescription || categoryData.description || `Shop ${categoryData.name} - Find the best products in this category`,
      images: categoryData.image ? [{ url: categoryData.image, alt: categoryData.name }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: categoryData.metaTitle || categoryData.name,
      description: categoryData.metaDescription || categoryData.description || `Shop ${categoryData.name} - Find the best products in this category`,
      images: categoryData.image || "",
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ lang: Lang; slug: string }>;
}) {
  const { lang, slug } = await params;

  const categoryData = await getCategoryBySlug(slug);

  if (!categoryData) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Header */}
      {categoryData.image && (
        <div className="relative h-48 bg-gray-100 dark:bg-gray-800 rounded-lg mb-8">
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white">{categoryData.name}</h1>
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        {!categoryData.image && (
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {categoryData.name}
          </h1>
        )}
        
        {categoryData.description && (
          <p className="text-gray-600 dark:text-gray-400">
            {categoryData.description}
          </p>
        )}
      </div>

      <Suspense 
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        }
      >
        <CategoryProductsGrid 
          categoryId={categoryData.id} 
          lang={lang}
        />
      </Suspense>
    </div>
  );
}