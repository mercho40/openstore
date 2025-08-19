import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeroSectionProps {
  dict: {
    hero: {
      title: string;
      subtitle: string;
      cta: string;
      browse: string;
    };
  };
  lang: string;
}

export function HeroSection({ dict, lang }: HeroSectionProps) {
  
  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
            {dict.hero.title}
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {dict.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href={`/${lang}/products`}>
                {dict.hero.cta}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={`/${lang}/categories`}>
                {dict.hero.browse}
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 rounded-full bg-secondary/10 blur-3xl" />
      </div>
    </section>
  );
}