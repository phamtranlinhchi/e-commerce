// =============================================================================
// Database Seed - Populates development data
// =============================================================================

import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // -------------------------------------------------------------------------
  // Users
  // -------------------------------------------------------------------------
  const adminHash = await bcrypt.hash("admin123", 12);
  const customerHash = await bcrypt.hash("customer123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@shopnex.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@shopnex.com",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      name: "Alice Johnson",
      email: "alice@example.com",
      passwordHash: customerHash,
      role: "CUSTOMER",
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      name: "Bob Smith",
      email: "bob@example.com",
      passwordHash: customerHash,
      role: "CUSTOMER",
    },
  });

  console.log(`  Users: ${admin.id}, ${customer1.id}, ${customer2.id}`);

  // -------------------------------------------------------------------------
  // Categories
  // -------------------------------------------------------------------------
  const categoriesData = [
    { name: "Electronics", slug: "electronics", description: "Gadgets, devices, and tech accessories", sortOrder: 1 },
    { name: "Clothing", slug: "clothing", description: "Apparel for men and women", sortOrder: 2 },
    { name: "Home & Kitchen", slug: "home-kitchen", description: "Everything for your home", sortOrder: 3 },
    { name: "Sports & Outdoors", slug: "sports-outdoors", description: "Gear for active lifestyles", sortOrder: 4 },
    { name: "Books", slug: "books", description: "Fiction, non-fiction, and educational", sortOrder: 5 },
    { name: "Accessories", slug: "accessories", description: "Bags, watches, jewelry, and more", sortOrder: 6 },
    { name: "Beauty", slug: "beauty", description: "Skincare, makeup, and grooming", sortOrder: 7 },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        ...cat,
        imageUrl: `https://picsum.photos/seed/${cat.slug}/600/400`,
      },
    });
    categories[cat.slug] = created.id;
  }

  // Subcategories
  const subcategoriesData = [
    { name: "Laptops", slug: "laptops", parentSlug: "electronics", sortOrder: 1 },
    { name: "Smartphones", slug: "smartphones", parentSlug: "electronics", sortOrder: 2 },
    { name: "Audio", slug: "audio", parentSlug: "electronics", sortOrder: 3 },
    { name: "Men's Clothing", slug: "mens-clothing", parentSlug: "clothing", sortOrder: 1 },
    { name: "Women's Clothing", slug: "womens-clothing", parentSlug: "clothing", sortOrder: 2 },
    { name: "Kitchen Appliances", slug: "kitchen-appliances", parentSlug: "home-kitchen", sortOrder: 1 },
    { name: "Furniture", slug: "furniture", parentSlug: "home-kitchen", sortOrder: 2 },
  ];

  for (const sub of subcategoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: sub.slug },
      update: {},
      create: {
        name: sub.name,
        slug: sub.slug,
        sortOrder: sub.sortOrder,
        parentId: categories[sub.parentSlug],
        imageUrl: `https://picsum.photos/seed/${sub.slug}/600/400`,
      },
    });
    categories[sub.slug] = created.id;
  }

  console.log(`  Categories: ${Object.keys(categories).length}`);

  // -------------------------------------------------------------------------
  // Products
  // -------------------------------------------------------------------------
  const productsData = [
    // Electronics
    { name: "Ultra Slim Laptop Pro", slug: "ultra-slim-laptop-pro", description: "Powerful 15-inch laptop with M3 chip, 16GB RAM, and 512GB SSD. Perfect for professionals and creatives who need performance on the go.", shortDescription: "15-inch, M3 chip, 16GB RAM, 512GB SSD", basePrice: 1299.99, compareAtPrice: 1499.99, sku: "ELEC-LAPTOP-001", categorySlug: "laptops", isFeatured: true },
    { name: "Budget Laptop Essential", slug: "budget-laptop-essential", description: "Affordable 14-inch laptop for everyday tasks. Features 8GB RAM, 256GB SSD, and a long-lasting battery for students and light users.", shortDescription: "14-inch, 8GB RAM, 256GB SSD", basePrice: 449.99, sku: "ELEC-LAPTOP-002", categorySlug: "laptops", isFeatured: false },
    { name: "ProPhone 15 Max", slug: "prophone-15-max", description: "Flagship smartphone with 6.7-inch OLED display, triple camera system, and all-day battery life. The ultimate mobile experience.", shortDescription: "6.7-inch OLED, triple camera, 256GB", basePrice: 999.99, compareAtPrice: 1099.99, sku: "ELEC-PHONE-001", categorySlug: "smartphones", isFeatured: true },
    { name: "MidRange Phone X", slug: "midrange-phone-x", description: "Great value smartphone with 6.4-inch display, dual camera, and 128GB storage. Everything you need at an affordable price.", shortDescription: "6.4-inch, dual camera, 128GB", basePrice: 349.99, sku: "ELEC-PHONE-002", categorySlug: "smartphones", isFeatured: false },
    { name: "Wireless Noise-Cancelling Headphones", slug: "wireless-nc-headphones", description: "Premium over-ear headphones with active noise cancellation, 30-hour battery, and hi-res audio support. Immerse yourself in sound.", shortDescription: "ANC, 30hr battery, hi-res audio", basePrice: 279.99, compareAtPrice: 349.99, sku: "ELEC-AUDIO-001", categorySlug: "audio", isFeatured: true },
    { name: "Portable Bluetooth Speaker", slug: "portable-bt-speaker", description: "Waterproof portable speaker with 360-degree sound, 12-hour battery, and rugged design. Take your music anywhere.", shortDescription: "Waterproof, 360° sound, 12hr battery", basePrice: 89.99, sku: "ELEC-AUDIO-002", categorySlug: "audio", isFeatured: false },

    // Clothing
    { name: "Classic Oxford Shirt", slug: "classic-oxford-shirt", description: "Timeless cotton Oxford shirt with a comfortable regular fit. Perfect for both casual and semi-formal occasions.", shortDescription: "100% cotton, regular fit", basePrice: 59.99, compareAtPrice: 79.99, sku: "CLO-MEN-001", categorySlug: "mens-clothing", isFeatured: true, hasVariants: true },
    { name: "Slim Fit Chinos", slug: "slim-fit-chinos", description: "Modern slim-fit chinos made from stretch cotton blend. Comfortable for all-day wear with a clean silhouette.", shortDescription: "Stretch cotton blend, slim fit", basePrice: 69.99, sku: "CLO-MEN-002", categorySlug: "mens-clothing", isFeatured: false, hasVariants: true },
    { name: "Premium Denim Jacket", slug: "premium-denim-jacket", description: "Classic denim jacket with a modern cut. Heavy-duty construction with brass buttons and adjustable waist tabs.", shortDescription: "Heavy-duty denim, brass buttons", basePrice: 129.99, compareAtPrice: 159.99, sku: "CLO-MEN-003", categorySlug: "mens-clothing", isFeatured: false, hasVariants: true },
    { name: "Floral Summer Dress", slug: "floral-summer-dress", description: "Lightweight floral print dress perfect for warm weather. Features a flattering A-line cut and adjustable straps.", shortDescription: "Lightweight, A-line, adjustable straps", basePrice: 79.99, sku: "CLO-WOM-001", categorySlug: "womens-clothing", isFeatured: true, hasVariants: true },
    { name: "High-Waist Yoga Pants", slug: "high-waist-yoga-pants", description: "Buttery-soft yoga pants with high waist and four-way stretch. Squat-proof and perfect for any workout.", shortDescription: "Four-way stretch, squat-proof", basePrice: 49.99, sku: "CLO-WOM-002", categorySlug: "womens-clothing", isFeatured: false, hasVariants: true },
    { name: "Cashmere Blend Sweater", slug: "cashmere-blend-sweater", description: "Luxuriously soft cashmere blend sweater with ribbed cuffs and hem. A wardrobe essential for cooler months.", shortDescription: "Cashmere blend, ribbed details", basePrice: 149.99, compareAtPrice: 199.99, sku: "CLO-WOM-003", categorySlug: "womens-clothing", isFeatured: false, hasVariants: true },

    // Home & Kitchen
    { name: "Smart Coffee Maker", slug: "smart-coffee-maker", description: "WiFi-enabled coffee maker with programmable schedules, temperature control, and app connectivity. Your perfect cup, every time.", shortDescription: "WiFi-enabled, programmable, 12-cup", basePrice: 149.99, compareAtPrice: 189.99, sku: "HOME-KIT-001", categorySlug: "kitchen-appliances", isFeatured: true },
    { name: "Cast Iron Dutch Oven", slug: "cast-iron-dutch-oven", description: "6-quart enameled cast iron Dutch oven. Perfect for braising, baking, and slow cooking. Oven safe to 500°F.", shortDescription: "6-quart, enameled cast iron", basePrice: 89.99, sku: "HOME-KIT-002", categorySlug: "kitchen-appliances", isFeatured: false },
    { name: "Ergonomic Office Chair", slug: "ergonomic-office-chair", description: "Adjustable ergonomic office chair with lumbar support, breathable mesh back, and smooth-rolling casters.", shortDescription: "Lumbar support, mesh back, adjustable", basePrice: 399.99, compareAtPrice: 499.99, sku: "HOME-FURN-001", categorySlug: "furniture", isFeatured: false },
    { name: "Minimalist Desk Lamp", slug: "minimalist-desk-lamp", description: "LED desk lamp with adjustable brightness, color temperature control, and a sleek modern design that fits any workspace.", shortDescription: "LED, adjustable brightness, modern design", basePrice: 49.99, sku: "HOME-FURN-002", categorySlug: "furniture", isFeatured: false },

    // Sports & Outdoors
    { name: "Trail Running Shoes", slug: "trail-running-shoes", description: "All-terrain trail running shoes with aggressive grip, waterproof membrane, and responsive cushioning for tough trails.", shortDescription: "Waterproof, aggressive grip, cushioned", basePrice: 129.99, sku: "SPO-001", categorySlug: "sports-outdoors", isFeatured: false, hasVariants: true },
    { name: "Insulated Water Bottle", slug: "insulated-water-bottle", description: "32oz vacuum-insulated stainless steel water bottle. Keeps drinks cold 24hrs or hot 12hrs. BPA-free and leak-proof.", shortDescription: "32oz, vacuum insulated, leak-proof", basePrice: 34.99, sku: "SPO-002", categorySlug: "sports-outdoors", isFeatured: false },
    { name: "Resistance Band Set", slug: "resistance-band-set", description: "Set of 5 resistance bands with different tension levels. Includes door anchor, handles, and ankle straps for full-body workouts.", shortDescription: "5 bands, handles, door anchor included", basePrice: 29.99, sku: "SPO-003", categorySlug: "sports-outdoors", isFeatured: false },
    { name: "Camping Hammock", slug: "camping-hammock", description: "Ultralight parachute nylon hammock with carabiners and tree straps. Supports up to 400lbs. Packs down small.", shortDescription: "Ultralight, 400lb capacity, compact", basePrice: 39.99, sku: "SPO-004", categorySlug: "sports-outdoors", isFeatured: false },

    // Books
    { name: "The Art of Clean Code", slug: "the-art-of-clean-code", description: "A practical guide to writing readable, maintainable, and efficient code. Covers principles, patterns, and real-world examples.", shortDescription: "Software engineering best practices", basePrice: 34.99, sku: "BOOK-001", categorySlug: "books", isFeatured: false },
    { name: "Design Patterns Explained", slug: "design-patterns-explained", description: "Comprehensive guide to software design patterns with modern examples in TypeScript and Python.", shortDescription: "Design patterns in TypeScript & Python", basePrice: 44.99, sku: "BOOK-002", categorySlug: "books", isFeatured: false },
    { name: "Mindful Living Handbook", slug: "mindful-living-handbook", description: "Practical guide to incorporating mindfulness into your daily routine. Includes exercises, meditations, and journal prompts.", shortDescription: "Mindfulness practices & exercises", basePrice: 19.99, sku: "BOOK-003", categorySlug: "books", isFeatured: false },

    // Accessories
    { name: "Leather Crossbody Bag", slug: "leather-crossbody-bag", description: "Genuine leather crossbody bag with adjustable strap, multiple compartments, and RFID-blocking pocket.", shortDescription: "Genuine leather, RFID-blocking", basePrice: 89.99, compareAtPrice: 119.99, sku: "ACC-001", categorySlug: "accessories", isFeatured: false },
    { name: "Minimalist Watch", slug: "minimalist-watch", description: "Clean-design analog watch with Japanese movement, sapphire crystal, and Italian leather strap. Water resistant to 50m.", shortDescription: "Japanese movement, sapphire crystal", basePrice: 159.99, sku: "ACC-002", categorySlug: "accessories", isFeatured: false },
    { name: "Polarized Sunglasses", slug: "polarized-sunglasses", description: "Classic aviator sunglasses with polarized lenses and lightweight titanium frame. UV400 protection.", shortDescription: "Polarized, titanium frame, UV400", basePrice: 69.99, sku: "ACC-003", categorySlug: "accessories", isFeatured: false },

    // Beauty
    { name: "Vitamin C Serum", slug: "vitamin-c-serum", description: "Brightening vitamin C serum with hyaluronic acid and vitamin E. Reduces dark spots and improves skin texture.", shortDescription: "20% Vitamin C, hyaluronic acid", basePrice: 29.99, sku: "BEA-001", categorySlug: "beauty", isFeatured: false },
    { name: "Natural Lip Balm Set", slug: "natural-lip-balm-set", description: "Set of 4 organic lip balms in vanilla, honey, mint, and berry. Made with beeswax and shea butter.", shortDescription: "4-pack, organic, beeswax & shea", basePrice: 14.99, sku: "BEA-002", categorySlug: "beauty", isFeatured: false },
    { name: "Bamboo Hair Brush", slug: "bamboo-hair-brush", description: "Eco-friendly bamboo paddle brush with natural boar bristles. Reduces static and distributes natural oils.", shortDescription: "Bamboo, boar bristles, eco-friendly", basePrice: 24.99, sku: "BEA-003", categorySlug: "beauty", isFeatured: false },
  ];

  // Variant templates for clothing products
  const clothingVariants = (sku: string) => [
    { name: "Black / S", sku: `${sku}-BLK-S`, price: 0, stock: 15, attributes: { color: "Black", size: "S" } },
    { name: "Black / M", sku: `${sku}-BLK-M`, price: 0, stock: 25, attributes: { color: "Black", size: "M" } },
    { name: "Black / L", sku: `${sku}-BLK-L`, price: 0, stock: 20, attributes: { color: "Black", size: "L" } },
    { name: "Navy / S", sku: `${sku}-NAV-S`, price: 0, stock: 10, attributes: { color: "Navy", size: "S" } },
    { name: "Navy / M", sku: `${sku}-NAV-M`, price: 0, stock: 20, attributes: { color: "Navy", size: "M" } },
    { name: "Navy / L", sku: `${sku}-NAV-L`, price: 0, stock: 15, attributes: { color: "Navy", size: "L" } },
    { name: "White / M", sku: `${sku}-WHT-M`, price: 0, stock: 18, attributes: { color: "White", size: "M" } },
    { name: "White / L", sku: `${sku}-WHT-L`, price: 0, stock: 12, attributes: { color: "White", size: "L" } },
  ];

  const shoeVariants = (sku: string) => [
    { name: "Black / 9", sku: `${sku}-BLK-9`, price: 0, stock: 10, attributes: { color: "Black", size: "9" } },
    { name: "Black / 10", sku: `${sku}-BLK-10`, price: 0, stock: 15, attributes: { color: "Black", size: "10" } },
    { name: "Black / 11", sku: `${sku}-BLK-11`, price: 0, stock: 12, attributes: { color: "Black", size: "11" } },
    { name: "Grey / 9", sku: `${sku}-GRY-9`, price: 0, stock: 8, attributes: { color: "Grey", size: "9" } },
    { name: "Grey / 10", sku: `${sku}-GRY-10`, price: 0, stock: 10, attributes: { color: "Grey", size: "10" } },
    { name: "Grey / 11", sku: `${sku}-GRY-11`, price: 0, stock: 7, attributes: { color: "Grey", size: "11" } },
  ];

  let productCount = 0;
  const productIds: { slug: string; id: string }[] = [];

  for (const p of productsData) {
    const { hasVariants, categorySlug, ...productData } = p as typeof p & { hasVariants?: boolean };

    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: {
        ...productData,
        categoryId: categories[categorySlug],
        images: {
          create: [
            { url: `https://picsum.photos/seed/${productData.slug}-1/800/800`, altText: `${productData.name} - Main`, isPrimary: true, sortOrder: 0 },
            { url: `https://picsum.photos/seed/${productData.slug}-2/800/800`, altText: `${productData.name} - Angle`, sortOrder: 1 },
            { url: `https://picsum.photos/seed/${productData.slug}-3/800/800`, altText: `${productData.name} - Detail`, sortOrder: 2 },
          ],
        },
        variants:
          hasVariants
            ? {
                create:
                  categorySlug === "sports-outdoors"
                    ? shoeVariants(productData.sku!).map((v) => ({
                        ...v,
                        price: productData.basePrice + v.price,
                        attributes: v.attributes,
                      }))
                    : clothingVariants(productData.sku!).map((v) => ({
                        ...v,
                        price: productData.basePrice + v.price,
                        attributes: v.attributes,
                      })),
              }
            : undefined,
      },
    });

    productIds.push({ slug: product.slug, id: product.id });
    productCount++;
  }

  console.log(`  Products: ${productCount}`);

  // -------------------------------------------------------------------------
  // Reviews
  // -------------------------------------------------------------------------
  const reviewsData = [
    { productSlug: "ultra-slim-laptop-pro", userId: customer1.id, rating: 5, title: "Best laptop I've owned", comment: "Incredible performance and build quality. The battery lasts all day." },
    { productSlug: "ultra-slim-laptop-pro", userId: customer2.id, rating: 4, title: "Great but pricey", comment: "Amazing specs but the price is steep. Worth it if you need the power." },
    { productSlug: "prophone-15-max", userId: customer1.id, rating: 5, title: "Perfect phone", comment: "Camera is outstanding and the display is gorgeous." },
    { productSlug: "wireless-nc-headphones", userId: customer2.id, rating: 5, title: "Noise cancelling is top tier", comment: "Best ANC I've experienced. Sound quality is fantastic." },
    { productSlug: "wireless-nc-headphones", userId: customer1.id, rating: 4, title: "Almost perfect", comment: "Great sound and ANC, but could be more comfortable for long sessions." },
    { productSlug: "classic-oxford-shirt", userId: customer1.id, rating: 4, title: "Quality fabric", comment: "Nice material and fit. Runs slightly large." },
    { productSlug: "floral-summer-dress", userId: customer2.id, rating: 5, title: "Beautiful dress!", comment: "Love the print and the fit is perfect. Very comfortable." },
    { productSlug: "smart-coffee-maker", userId: customer1.id, rating: 4, title: "Smart features are great", comment: "Love the app integration. Coffee tastes great once you dial in settings." },
    { productSlug: "smart-coffee-maker", userId: customer2.id, rating: 3, title: "Good but app is buggy", comment: "Coffee quality is excellent but the app needs work." },
    { productSlug: "trail-running-shoes", userId: customer1.id, rating: 5, title: "Grip like crazy", comment: "Took these on rocky trails and they performed amazingly." },
    { productSlug: "leather-crossbody-bag", userId: customer2.id, rating: 4, title: "Beautiful leather", comment: "Quality leather and good craftsmanship. Strap could be longer." },
    { productSlug: "the-art-of-clean-code", userId: customer1.id, rating: 5, title: "Must-read for developers", comment: "Changed how I think about code. Practical and well-written." },
    { productSlug: "vitamin-c-serum", userId: customer2.id, rating: 4, title: "Visible results in 2 weeks", comment: "My skin looks brighter and more even. A bit sticky initially." },
  ];

  let reviewCount = 0;
  for (const review of reviewsData) {
    const product = productIds.find((p) => p.slug === review.productSlug);
    if (!product) continue;

    await prisma.review.upsert({
      where: {
        productId_userId: {
          productId: product.id,
          userId: review.userId,
        },
      },
      update: {},
      create: {
        productId: product.id,
        userId: review.userId,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
      },
    });
    reviewCount++;
  }

  console.log(`  Reviews: ${reviewCount}`);
  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
