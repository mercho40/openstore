export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  categoryId: string | null;
  status: string;
  featuredImage: string | null;
  images: string[];
  isFeatured: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

