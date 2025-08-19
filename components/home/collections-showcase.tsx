import { getFeaturedCollections } from "@/actions/collections";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

interface CollectionsShowcaseProps {
  dict: {
    collections: {
      title: string;
      subtitle: string;
      viewAll: string;
      explore: string;
    };
  };
  lang: string;
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

async function CollectionsList({ dict, lang }: CollectionsShowcaseProps) {
  
  const collections = await getFeaturedCollections(4);

  if (!collections || collections.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No collections available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  sizes="(min-width: 768px) 50vw, 100vw"
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
              <p className="text-muted-foreground line-clamp-2">
                {collection.description}
              </p>
            )}
          </CardContent>
          
          <CardFooter className="p-6 pt-0">
            <Button className="w-full" asChild>
              <Link href={`/${lang}/collections/${collection.slug}`}>
                {dict.collections.explore}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export function CollectionsShowcase({ dict, lang }: CollectionsShowcaseProps) {
  
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {dict.collections.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {dict.collections.subtitle}
          </p>
          <Button variant="outline" asChild>
            <Link href={`/${lang}/collections`}>
              {dict.collections.viewAll}
            </Link>
          </Button>
        </div>
        
        <Suspense 
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <CollectionCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <CollectionsList dict={dict} lang={lang} />
        </Suspense>
      </div>
    </section>
  );
}