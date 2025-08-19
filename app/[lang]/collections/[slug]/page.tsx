import { getDictionary, Lang, locales } from "@/actions/dictionaries";
import { getCollections, getCollectionBySlug, getCollectionProducts } from "@/actions/collections";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/home/product-card";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";
import Image from "next/image";

// Enable ISR with 2 hours revalidation for collection pages
export const revalidate = 7200; // 2 hours

// Generate static paths for existing collections
export async function generateStaticParams() {
  try {
    const collections = await getCollections({ isActive: true }, 50);

    const params = [];
    for (const lang of locales) {
      for (const collection of collections) {
        if (collection.slug) {
          params.push({ lang, slug: collection.slug });
        }
      }
    }
    
    return params;
  } catch (error) {
    console.error("Error generating static params for collections:", error);
    return [];
  }
}

async function CollectionProductsGrid({ 
  collectionId, 
  lang 
}: { 
  collectionId: string; 
  lang: Lang; 
}) {
  const products = await getCollectionProducts(collectionId, 20, 0);
  const dict = await getDictionary(lang);

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          No products in this collection
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Check out other collections or try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((item) => (
        <ProductCard
          key={item.product.id}
          product={{
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            price: item.product.price,
            compareAtPrice: item.product.compareAtPrice,
            featuredImage: item.product.featuredImage,
            isFeatured: item.product.isFeatured,
            tags: item.product.tags,
          }}
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
  const collectionData = await getCollectionBySlug(slug);

  if (!collectionData) {
    return {
      title: "Collection Not Found",
    };
  }

  return {
    title: collectionData.name,
    description: collectionData.description || `Shop ${collectionData.name} - Curated collection of premium products`,
    openGraph: {
      title: collectionData.name,
      description: collectionData.description || `Shop ${collectionData.name} - Curated collection of premium products`,
      images: collectionData.image ? [{ url: collectionData.image, alt: collectionData.name }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: collectionData.name,
      description: collectionData.description || `Shop ${collectionData.name} - Curated collection of premium products`,
      images: collectionData.image || "",
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ lang: Lang; slug: string }>;
}) {
  const { lang, slug } = await params;

  const collectionData = await getCollectionBySlug(slug);

  if (!collectionData) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Collection Header */}
      {collectionData.image && (
        <div className="relative h-48 lg:h-64 bg-gray-100 dark:bg-gray-800 rounded-lg mb-8 overflow-hidden">
          <Image
            src={collectionData.image}
            alt={collectionData.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-3xl lg:text-5xl font-bold mb-2">{collectionData.name}</h1>
              {collectionData.description && (
                <p className="text-lg lg:text-xl opacity-90 max-w-2xl">
                  {collectionData.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        {!collectionData.image && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {collectionData.name}
            </h1>
            {collectionData.description && (
              <p className="text-gray-600 dark:text-gray-400">
                {collectionData.description}
              </p>
            )}
          </>
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
        <CollectionProductsGrid 
          collectionId={collectionData.id} 
          lang={lang}
        />
      </Suspense>
    </div>
  );
}