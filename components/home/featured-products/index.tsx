import ProductRail from "@/components/home/featured-products/product-rail"
import { Collection } from "@/types/collection"
import { Lang } from "@/actions/dictionaries"

export default async function FeaturedProducts({
  collections,
  lang,
}: {
  collections: [Collection]
  lang: Lang
}) {
  return collections.map((collection) => (
    <li key={collection.id}>
      <ProductRail collection={collection} lang={lang} />
    </li>
  ))
}

