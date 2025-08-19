import { getDictionary, Lang, locales } from "@/actions/dictionaries";
import { CategoriesShowcase } from "@/components/home/categories-showcase";
import { CollectionsShowcase } from "@/components/home/collections-showcase";
import { FeaturedProducts } from "@/components/home/featured-products";
import { HeroSection } from "@/components/home/hero-section";
import { NewsletterSignup } from "@/components/home/newsletter-signup";
import { StatsSection } from "@/components/home/stats-section";

// Enable ISR with 1 hour revalidation for home page to get fresh product data
export const revalidate = 3600; // 1 hour

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Lang }>
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  return (
    <main className="min-h-screen">
      <HeroSection dict={{ hero: dict.home.hero }} lang={lang} />
      <FeaturedProducts dict={{ featured: dict.home.featured, product: dict.product }} lang={lang} />
      <CategoriesShowcase dict={{ categories: dict.home.categories }} lang={lang} />
      <StatsSection dict={{ stats: dict.home.stats }} />
      <CollectionsShowcase dict={{ collections: dict.home.collections }} lang={lang} />
      <NewsletterSignup dict={{ newsletter: dict.home.newsletter }} />
    </main>
  );
}

