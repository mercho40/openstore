import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NavigationProps {
  dict: {
    navigation: {
      home: string;
      products: string;
      categories: string;
      collections: string;
      cart: string;
      menu: string;
    };
    auth: {
      account: string;
    };
  };
  lang: string;
}

export function Navigation({ dict, lang }: NavigationProps) {
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={`/${lang}`} className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-bold text-primary-foreground text-sm">OS</span>
            </div>
            <span className="hidden font-bold sm:inline-block">OpenStore</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link 
              href={`/${lang}`}
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              {dict.navigation.home}
            </Link>
            <Link 
              href={`/${lang}/products`}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {dict.navigation.products}
            </Link>
            <Link 
              href={`/${lang}/categories`}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {dict.navigation.categories}
            </Link>
            <Link 
              href={`/${lang}/collections`}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {dict.navigation.collections}
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/${lang}/cart`}>
                {dict.navigation.cart}
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/${lang}/auth/signin`}>
                {dict.auth.account}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}