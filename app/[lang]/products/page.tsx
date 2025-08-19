import { getDictionary, Lang, locales } from "@/actions/dictionaries";
import { getProducts } from "@/actions/products";
import { getCategories } from "@/actions/categories";
import { ProductCard } from "@/components/home/product-card";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Enable ISR with 1 hour revalidation
export const revalidate = 3600; // 1 hour

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

async function ProductsGrid({ lang }: { lang: Lang }) {
  const [products, categories] = await Promise.all([
    getProducts({ status: "active" }, 20, 0, "createdAt", "desc"),
    getCategories({ isActive: true }),
  ]);

  const dict = await getDictionary(lang);

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {dict.products?.noProducts || "No products available"}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {dict.products?.checkBackLater || "Check back later for new products."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categories.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/${lang}/categories/${cat.slug}`}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {cat.name}
              </a>
            ))}
          </div>
        </div>
      )}
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
    </div>
  );
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Lang }>;
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { lang } = await params;
  const searchParamsData = await searchParams;
  const dict = await getDictionary(lang);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {dict.products?.title || "Products"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {dict.products?.subtitle || "Discover our amazing collection of products"}
        </p>
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
        <ProductsGrid lang={lang} />
      </Suspense>
    </div>
  );
}