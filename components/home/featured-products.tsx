import { getFeaturedProducts } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "./product-card";

interface FeaturedProductsProps {
  dict: {
    featured: {
      title: string;
      subtitle: string;
      viewAll: string;
      addToCart: string;
      outOfStock: string;
      sale: string;
    };
    product: {
      viewDetails: string;
    };
  };
  lang: string;
}

function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

async function FeaturedProductsList({ dict, lang }: FeaturedProductsProps) {
  
  const products = await getFeaturedProducts(8);

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No featured products available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          dict={dict}
          lang={lang}
        />
      ))}
    </div>
  );
}

export function FeaturedProducts({ dict, lang }: FeaturedProductsProps) {
  
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {dict.featured.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {dict.featured.subtitle}
          </p>
          <Button variant="outline" asChild>
            <Link href={`/${lang}/products`}>
              {dict.featured.viewAll}
            </Link>
          </Button>
        </div>
        
        <Suspense 
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <FeaturedProductsList dict={dict} lang={lang} />
        </Suspense>
      </div>
    </section>
  );
}