import { getDictionary, Lang, locales } from "@/actions/dictionaries";
import { getCollections } from "@/actions/collections";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";

// Enable ISR with 1 hour revalidation
export const revalidate = 3600; // 1 hour

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

function CollectionCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-video rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

async function CollectionsGrid({ lang }: { lang: Lang }) {
  const collections = await getCollections({ isActive: true }, 20, 0, "createdAt", "desc");
  // const dict = await getDictionary(lang); // TODO: Use dict for translations

  if (collections.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          No collections available
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Check back later for new collections.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((collection) => (
        <Card key={collection.id} className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="relative">
            <AspectRatio ratio={16/9}>
              {collection.image ? (
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary/40 mb-2">
                      {collection.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {collection.name}
                    </div>
                  </div>
                </div>
              )}
            </AspectRatio>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          <CardContent className="p-6">
            <h3 className="font-semibold text-xl mb-2 group-hover:text-primary transition-colors">
              {collection.name}
            </h3>
            {collection.description && (
              <p className="text-muted-foreground line-clamp-3">
                {collection.description}
              </p>
            )}
          </CardContent>
          
          <CardFooter className="p-6 pt-0">
            <Button className="w-full" asChild>
              <Link href={`/${lang}/collections/${collection.slug}`}>
                Explore Collection
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: dict.navigation.collections,
    description: "Browse our curated collections of premium products",
  };
}

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {dict.navigation.collections}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover our curated collections of premium products
        </p>
      </div>

      <Suspense 
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CollectionCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <CollectionsGrid lang={lang} />
      </Suspense>
    </div>
  );
}