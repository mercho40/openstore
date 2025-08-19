import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "../db/schema";
import { nanoid } from "nanoid";

// Initialize database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// Sample data generators
function generateId() {
  return nanoid();
}

function generateEmail(name: string) {
  return `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
}

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function generateSKU(productName: string) {
  return `${productName.substring(0, 3).toUpperCase()}-${nanoid(6)}`;
}

// Sample data
const categories = [
  {
    name: "Electronics",
    description: "Latest gadgets and electronic devices",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop"
  },
  {
    name: "Clothing",
    description: "Fashion and apparel for all occasions",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop"
  },
  {
    name: "Home & Garden",
    description: "Everything for your home and outdoor space",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop"
  },
  {
    name: "Books",
    description: "Books for learning and entertainment",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"
  },
  {
    name: "Sports & Outdoors",
    description: "Equipment for sports and outdoor activities",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
  }
];

const collections = [
  {
    name: "Best Sellers",
    description: "Our most popular products",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop"
  },
  {
    name: "New Arrivals",
    description: "Latest products in our store",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop"
  },
  {
    name: "Sale Items",
    description: "Products on sale with great discounts",
    image: "https://images.unsplash.com/photo-1607083206325-cad9b365a2b0?w=400&h=300&fit=crop"
  },
  {
    name: "Featured",
    description: "Hand-picked featured products",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop"
  }
];

const products = [
  {
    name: "Wireless Bluetooth Headphones",
    description: "High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
    shortDescription: "Premium wireless headphones with noise cancellation",
    price: "149.99",
    compareAtPrice: "199.99",
    categoryName: "Electronics",
    featuredImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop"
    ],
    tags: ["electronics", "audio", "wireless", "bluetooth"],
    status: "active",
    isFeatured: true
  },
  {
    name: "Organic Cotton T-Shirt",
    description: "Comfortable and sustainable organic cotton t-shirt. Made from 100% organic cotton with a soft, breathable fabric.",
    shortDescription: "Comfortable organic cotton t-shirt",
    price: "29.99",
    compareAtPrice: "39.99",
    categoryName: "Clothing",
    featuredImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=600&fit=crop"
    ],
    tags: ["clothing", "organic", "cotton", "sustainable"],
    status: "active",
    isFeatured: false
  },
  {
    name: "Smart Home Security Camera",
    description: "Advanced security camera with 4K resolution, night vision, and AI-powered motion detection. Keep your home safe and secure.",
    shortDescription: "4K smart security camera with AI detection",
    price: "199.99",
    compareAtPrice: "249.99",
    categoryName: "Electronics",
    featuredImage: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600&h=600&fit=crop"
    ],
    tags: ["electronics", "security", "smart-home", "camera"],
    status: "active",
    isFeatured: true
  },
  {
    name: "Ceramic Plant Pot Set",
    description: "Beautiful set of 3 ceramic plant pots in different sizes. Perfect for indoor plants and home decoration.",
    shortDescription: "Set of 3 ceramic plant pots",
    price: "45.99",
    compareAtPrice: null,
    categoryName: "Home & Garden",
    featuredImage: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop"
    ],
    tags: ["home", "garden", "plants", "ceramic", "decoration"],
    status: "active",
    isFeatured: false
  },
  {
    name: "Programming JavaScript Book",
    description: "Comprehensive guide to modern JavaScript development. Covers ES6+, async programming, and best practices.",
    shortDescription: "Complete guide to JavaScript programming",
    price: "34.99",
    compareAtPrice: "44.99",
    categoryName: "Books",
    featuredImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop"
    ],
    tags: ["books", "programming", "javascript", "technology"],
    status: "active",
    isFeatured: false
  },
  {
    name: "Yoga Mat Premium",
    description: "High-quality yoga mat with excellent grip and cushioning. Made from eco-friendly materials.",
    shortDescription: "Premium eco-friendly yoga mat",
    price: "59.99",
    compareAtPrice: "79.99",
    categoryName: "Sports & Outdoors",
    featuredImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506629905607-bb5dd2b8c93d?w=600&h=600&fit=crop"
    ],
    tags: ["sports", "yoga", "fitness", "eco-friendly"],
    status: "active",
    isFeatured: true
  },
  {
    name: "Stainless Steel Water Bottle",
    description: "Durable stainless steel water bottle with vacuum insulation. Keeps drinks cold for 24 hours or hot for 12 hours.",
    shortDescription: "Insulated stainless steel water bottle",
    price: "24.99",
    compareAtPrice: "34.99",
    categoryName: "Sports & Outdoors",
    featuredImage: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&h=600&fit=crop"
    ],
    tags: ["sports", "water-bottle", "stainless-steel", "insulated"],
    status: "active",
    isFeatured: false
  },
  {
    name: "Wireless Smartphone Charger",
    description: "Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator.",
    shortDescription: "Fast wireless charging pad",
    price: "39.99",
    compareAtPrice: "49.99",
    categoryName: "Electronics",
    featuredImage: "https://images.unsplash.com/photo-1609592807979-2c7d5c2a8b49?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1609592807979-2c7d5c2a8b49?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&h=600&fit=crop"
    ],
    tags: ["electronics", "wireless", "charger", "smartphone"],
    status: "active",
    isFeatured: false
  }
];

const sampleUsers = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "customer"
  },
  {
    name: "Jane Smith",
    email: "jane.smith@example.com", 
    role: "customer"
  },
  {
    name: "Admin User",
    email: "admin@example.com",
    role: "admin"
  }
];

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data (be careful with this in production!)
    console.log("🗑️  Clearing existing data...");
    await db.delete(schema.reviewVote);
    await db.delete(schema.review);
    await db.delete(schema.notification);
    await db.delete(schema.orderItem);
    await db.delete(schema.order);
    await db.delete(schema.wishlist);
    await db.delete(schema.cart);
    await db.delete(schema.address);
    await db.delete(schema.inventory);
    await db.delete(schema.productCollection);
    await db.delete(schema.product);
    await db.delete(schema.collection);
    await db.delete(schema.category);
    await db.delete(schema.verification);
    await db.delete(schema.account);
    await db.delete(schema.session);
    await db.delete(schema.user);

    // Seed categories
    console.log("📂 Seeding categories...");
    const categoryRecords = categories.map(cat => ({
      id: generateId(),
      name: cat.name,
      slug: generateSlug(cat.name),
      description: cat.description,
      image: cat.image,
      parentId: null,
      displayOrder: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await db.insert(schema.category).values(categoryRecords);

    // Seed collections
    console.log("📦 Seeding collections...");
    const collectionRecords = collections.map(col => ({
      id: generateId(),
      name: col.name,
      slug: generateSlug(col.name),
      description: col.description,
      image: col.image,
      isActive: true,
      sortOrder: "manual",
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await db.insert(schema.collection).values(collectionRecords);

    // Get inserted categories and collections for reference
    const insertedCategories = await db.select().from(schema.category);
    const insertedCollections = await db.select().from(schema.collection);

    // Seed products
    console.log("🛍️ Seeding products...");
    const productRecords = products.map(prod => {
      const category = insertedCategories.find(cat => cat.name === prod.categoryName);
      return {
        id: generateId(),
        name: prod.name,
        slug: generateSlug(prod.name),
        description: prod.description,
        shortDescription: prod.shortDescription,
        sku: generateSKU(prod.name),
        price: prod.price,
        compareAtPrice: prod.compareAtPrice,
        categoryId: category?.id || null,
        status: prod.status,
        featuredImage: prod.featuredImage,
        images: prod.images,
        isFeatured: prod.isFeatured,
        tags: prod.tags,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date()
      };
    });

    await db.insert(schema.product).values(productRecords);

    // Get inserted products for reference
    const insertedProducts = await db.select().from(schema.product);

    // Seed inventory for products
    console.log("📊 Seeding inventory...");
    const inventoryRecords = insertedProducts.map(product => ({
      id: generateId(),
      productId: product.id,
      quantity: Math.floor(Math.random() * 100) + 10, // Random stock between 10-110
      lowStockThreshold: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await db.insert(schema.inventory).values(inventoryRecords);

    // Create product-collection relationships
    console.log("🔗 Creating product-collection relationships...");
    const productCollectionRecords: any[] = [];
    
    // Add featured products to Featured collection
    const featuredCollection = insertedCollections.find(col => col.name === "Featured");
    const featuredProducts = insertedProducts.filter(prod => prod.isFeatured);
    featuredProducts.forEach((product, index) => {
      if (featuredCollection) {
        productCollectionRecords.push({
          productId: product.id,
          collectionId: featuredCollection.id,
          position: index,
          createdAt: new Date()
        });
      }
    });

    // Add some products to Best Sellers
    const bestSellersCollection = insertedCollections.find(col => col.name === "Best Sellers");
    const bestSellerProducts = insertedProducts.slice(0, 4);
    bestSellerProducts.forEach((product, index) => {
      if (bestSellersCollection) {
        productCollectionRecords.push({
          productId: product.id,
          collectionId: bestSellersCollection.id,
          position: index,
          createdAt: new Date()
        });
      }
    });

    // Add products with compareAtPrice to Sale Items
    const saleCollection = insertedCollections.find(col => col.name === "Sale Items");
    const saleProducts = insertedProducts.filter(prod => prod.compareAtPrice);
    saleProducts.forEach((product, index) => {
      if (saleCollection) {
        productCollectionRecords.push({
          productId: product.id,
          collectionId: saleCollection.id,
          position: index,
          createdAt: new Date()
        });
      }
    });

    if (productCollectionRecords.length > 0) {
      await db.insert(schema.productCollection).values(productCollectionRecords);
    }

    // Seed sample users
    console.log("👤 Seeding users...");
    const userRecords = sampleUsers.map(user => ({
      id: generateId(),
      name: user.name,
      email: user.email,
      emailVerified: true,
      role: user.role,
      banned: false,
      preferredCurrency: "USD",
      preferredLanguage: "en",
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await db.insert(schema.user).values(userRecords);

    // Get inserted users for reference
    const insertedUsers = await db.select().from(schema.user);

    // Seed sample addresses
    console.log("🏠 Seeding addresses...");
    const addressRecords = insertedUsers.slice(0, 2).map(user => ({
      id: generateId(),
      userId: user.id,
      type: "shipping",
      isDefault: true,
      firstName: user.name.split(" ")[0],
      lastName: user.name.split(" ")[1] || "User",
      addressLine1: "123 Main Street",
      city: "New York",
      state: "NY",
      country: "US",
      postalCode: "10001",
      phone: "+1234567890",
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await db.insert(schema.address).values(addressRecords);

    // Seed sample reviews
    console.log("⭐ Seeding reviews...");
    const reviewRecords = [];
    const customerUsers = insertedUsers.filter(user => user.role === "customer");
    
    // Create multiple reviews for different products
    for (let i = 0; i < Math.min(5, insertedProducts.length); i++) {
      const product = insertedProducts[i];
      const user = customerUsers[i % customerUsers.length];
      
      if (user) {
        reviewRecords.push({
          id: generateId(),
          productId: product.id,
          userId: user.id,
          rating: Math.floor(Math.random() * 2) + 4, // Rating between 4-5
          title: "Great product!",
          comment: "I'm very satisfied with this purchase. The quality is excellent and it arrived quickly.",
          images: [],
          isVerifiedPurchase: true,
          isApproved: true,
          helpfulCount: Math.floor(Math.random() * 10),
          unhelpfulCount: Math.floor(Math.random() * 2),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    if (reviewRecords.length > 0) {
      await db.insert(schema.review).values(reviewRecords);
    }

    console.log("✅ Database seeding completed successfully!");
    console.log(`Created:
    - ${categoryRecords.length} categories
    - ${collectionRecords.length} collections  
    - ${productRecords.length} products
    - ${inventoryRecords.length} inventory records
    - ${productCollectionRecords.length} product-collection relationships
    - ${userRecords.length} users
    - ${addressRecords.length} addresses
    - ${reviewRecords.length} reviews`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabase().catch((error) => {
    console.error("Failed to seed database:", error);
    process.exit(1);
  });
}

export { seedDatabase };