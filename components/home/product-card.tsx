import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  compareAtPrice?: string | null;
  featuredImage?: string | null;
  isFeatured?: boolean | null;
  tags?: string[] | null;
}

interface ProductCardProps {
  product: Product;
  dict: {
    featured: {
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

export function ProductCard({ product, dict, lang }: ProductCardProps) {
  
  const hasDiscount = product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price);
  const discountPercentage = hasDiscount 
    ? Math.round(((parseFloat(product.compareAtPrice!) - parseFloat(product.price)) / parseFloat(product.compareAtPrice!)) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <AspectRatio ratio={1}>
          {product.featuredImage ? (
            <Image
              src={product.featuredImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No Image</span>
            </div>
          )}
        </AspectRatio>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFeatured && (
            <Badge variant="secondary" className="text-xs">
              Featured
            </Badge>
          )}
          {hasDiscount && (
            <Badge variant="destructive" className="text-xs">
              -{discountPercentage}%
            </Badge>
          )}
        </div>
        
        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="text-xs">
              {product.tags[0]}
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <Link 
          href={`/${lang}/products/${product.slug}`}
          className="group-hover:text-primary transition-colors"
        >
          <h3 className="font-semibold text-base mb-2 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold">
            ${parseFloat(product.price).toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ${parseFloat(product.compareAtPrice!).toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button size="sm" className="flex-1">
          {dict.featured.addToCart}
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/${lang}/products/${product.slug}`}>
            {dict.product.viewDetails}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}