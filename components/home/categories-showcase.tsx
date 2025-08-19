import { getCategoriesWithProductCount } from "@/actions/categories";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

interface CategoriesShowcaseProps {
  dict: {
    categories: {
      title: string;
      subtitle: string;
      viewAll: string;
      productsCount: string;
    };
  };
  lang: string;
}

function CategoryCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

async function CategoriesList({ dict, lang }: CategoriesShowcaseProps) {
  
  const categories = await getCategoriesWithProductCount({ 
    includeInactive: false 
  });

  // Limit to 6 categories for the homepage
  const displayCategories = categories.slice(0, 6);

  if (!displayCategories || displayCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No categories available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayCategories.map((category) => (
        <Card key={category.id} className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="relative">
            <AspectRatio ratio={4/3}>
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary/60">
                    {category.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </AspectRatio>
          </div>
          
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {category.description}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {dict.categories.productsCount.replace('{{count}}', category.productCount.toString())}
            </p>
          </CardContent>
          
          <CardFooter className="p-4 pt-0">
            <Button className="w-full" variant="outline" asChild>
              <Link href={`/${lang}/categories/${category.slug}`}>
                Explore {category.name}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export function CategoriesShowcase({ dict, lang }: CategoriesShowcaseProps) {
  
  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {dict.categories.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {dict.categories.subtitle}
          </p>
          <Button variant="outline" asChild>
            <Link href={`/${lang}/categories`}>
              {dict.categories.viewAll}
            </Link>
          </Button>
        </div>
        
        <Suspense 
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <CategoriesList dict={dict} lang={lang} />
        </Suspense>
      </div>
    </section>
  );
}