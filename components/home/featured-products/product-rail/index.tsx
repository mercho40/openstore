import { getProducts } from "@/actions/products"
import { Product } from "@/types/product"
import { Collection } from "@/types/collection"
import { Lang } from "@/actions/dictionaries"
import Link from "next/link"
import { Text } from "@medusajs/ui"

import ProductPreview from "@/components/products/product-preview"

export default async function ProductRail({
  collection,
  lang,
}: {
  collection: Collection
  lang: Lang
}) {
  const products = await getProducts();
  if (!products) {
    return null
  }

  return (
    <div className="content-container py-12 small:py-24">
      <div className="flex justify-between mb-8">
        <Text className="txt-xlarge">{collection.name}</Text>
        <Link href={`/collections/${collection.slug}`}>
          View all
        </Link>
      </div>
      <ul className="grid grid-cols-2 small:grid-cols-3 gap-x-6 gap-y-24 small:gap-y-36">
        {products &&
          products.map((product: Product) => (
            <li key={product.id}>
              <ProductPreview product={product} lang={lang} isFeatured />
            </li>
          ))}
      </ul>
    </div>
  )
}
