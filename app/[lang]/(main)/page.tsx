import { Metadata } from "next"
import { Lang } from "@/actions/dictionaries"

import FeaturedProducts from "@/components/home/featured-products/index"
import Hero from "@/components/home/hero"
import { getCollections } from "@/actions/collections"

export const metadata: Metadata = {
  title: "OpenStore Starter Template",
  description:
    "A performant frontend ecommerce starter template with Next.js 15",
}

export default async function Home(props: {
  params: Promise<{ lang: Lang }>
}) {
  const params = await props.params

  const { lang } = params


  const collections = await getCollections()

  if (!collections) {
    return null
  }

  return (
    <>
      <Hero />
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} lang={lang} />
        </ul>
      </div>
    </>
  )
}
