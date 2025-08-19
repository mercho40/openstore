import { getDictionary, Lang, locales } from "@/actions/dictionaries";
import { getProducts, getProductBySlug, getProductsByCategory } from "@/actions/products";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";

// Enable ISR with 30 minutes revalidation for individual products
export const revalidate = 1800; // 30 minutes

// Generate static paths for existing products
export async function generateStaticParams() {
  try {
    const products = await getProducts({ status: "active" }, 100);

    const params = [];
    for (const lang of locales) {
      for (const prod of products) {
        if (prod.slug) {
          params.push({ lang, slug: prod.slug });
        }
      }
    }
    
    return params;
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Note: We'll use the action directly instead of wrapping it

// Simplified for now - we'll implement reviews actions later
async function getProductReviews(productId: string) {
  return { reviews: [], averageRating: 0, totalReviews: 0 };
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const productData = await getProductBySlug(slug);

  if (!productData) {
    return {
      title: "Product Not Found",
    };
  }

  const images = Array.isArray(productData.images) 
    ? productData.images as string[]
    : [];

  return {
    title: productData.name,
    description: productData.description || `${productData.name} - High quality product at great prices`,
    openGraph: {
      title: productData.name,
      description: productData.description || `${productData.name} - High quality product at great prices`,
      images: images.map((img: string | { url: string }) => ({
        url: typeof img === 'string' ? img : img.url,
        alt: productData.name,
      })),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: productData.name,
      description: productData.description || `${productData.name} - High quality product at great prices`,
      images: productData.featuredImage || "",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ lang: Lang; slug: string }>;
}) {
  const { lang, slug } = await params;
  const dict = await getDictionary(lang);

  const productData = await getProductBySlug(slug);

  if (!productData) {
    notFound();
  }

  const [reviewsData, allRelatedProducts] = await Promise.all([
    getProductReviews(productData.id),
    productData.categoryId ? getProductsByCategory(productData.categoryId, 8, 0) : Promise.resolve([]),
  ]);

  // Filter out current product from related products
  const relatedProducts = allRelatedProducts.filter(p => p.id !== productData.id).slice(0, 4);

  const images = Array.isArray(productData.images) ? productData.images : [];
  const currentPrice = productData.compareAtPrice || productData.price;

  return (
    <div className="container mx-auto px-4 py-8">      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          {productData.featuredImage || (images.length > 0) ? (
            <div className="aspect-square relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <Image
                src={productData.featuredImage || images[0] || "/placeholder-product.jpg"}
                alt={productData.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>
        
        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {productData.name}
            </h1>
            {productData.category?.name && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Category: {productData.category.name}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              ${currentPrice}
            </span>
            {productData.compareAtPrice && (
              <span className="text-xl text-gray-500 line-through">
                ${productData.price}
              </span>
            )}
          </div>

          {productData.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {productData.description}
              </p>
            </div>
          )}

          {reviewsData.totalReviews > 0 && (
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ⭐ {reviewsData.averageRating.toFixed(1)} ({reviewsData.totalReviews} reviews)
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-sm ${
              productData.status === "active"
                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
            }`}>
              {productData.status === "active" ? "Available" : "Not Available"}
            </span>
          </div>
        </div>
      </div>

      {/* Reviews section - disabled for now */}

      {relatedProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <a
                key={relatedProduct.id}
                href={`/${lang}/products/${relatedProduct.slug}`}
                className="group"
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-3">
                  {relatedProduct.featuredImage ? (
                    <Image
                      src={relatedProduct.featuredImage}
                      alt={relatedProduct.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No image
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600">
                  {relatedProduct.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  ${relatedProduct.compareAtPrice || relatedProduct.price}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}