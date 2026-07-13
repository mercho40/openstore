import { Text } from "@medusajs/ui"
import { getProducts } from "@/actions/products"
import Link from "next/link"
import { Lang } from "@/actions/dictionaries"
import { Product } from "@/types/product"
import Thumbnail from "@/components/products/thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  lang
}: {
  product: Product
  isFeatured?: boolean
  lang: Lang
}) {
  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  // const { cheapestPrice } = getProductPrice({
  //   product,
  // })

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div data-testid="product-wrapper">
        <Thumbnail
          thumbnail={product.featuredImage}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <div className="flex txt-compact-medium mt-4 justify-between">
          <Text className="text-ui-fg-subtle" data-testid="product-title">
            {product.name}
          </Text>
          <div className="flex items-center gap-x-2">
            {product.compareAtPrice && <PreviewPrice price={product.compareAtPrice} />}
          </div>
        </div>
      </div>
    </Link>
  )
}

