import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean up existing data
  await prisma.reservation.deleteMany();
  await prisma.stockLevel.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();

  // Create warehouses
  const mumbai = await prisma.warehouse.create({
    data: { name: "Mumbai Central", location: "Mumbai, MH" },
  });
  const delhi = await prisma.warehouse.create({
    data: { name: "Delhi North", location: "Delhi, DL" },
  });
  const bangalore = await prisma.warehouse.create({
    data: { name: "Bangalore Hub", location: "Bangalore, KA" },
  });

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Wireless Noise-Cancelling Headphones",
        description: "Premium over-ear headphones with 30hr battery life",
        sku: "WNC-HP-001",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      },
    }),
    prisma.product.create({
      data: {
        name: "Mechanical Keyboard",
        description: "TKL layout, Cherry MX Brown switches, RGB backlit",
        sku: "MK-TKL-002",
        imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400",
      },
    }),
    prisma.product.create({
      data: {
        name: "4K Webcam",
        description: "Ultra HD webcam with auto-focus and built-in mic",
        sku: "4K-WC-003",
        imageUrl: "https://images.unsplash.com/photo-1623949556303-b0d17d198863?w=400",
      },
    }),
    prisma.product.create({
      data: {
        name: "USB-C Hub (7-in-1)",
        description: "HDMI 4K, 3x USB-A, SD card, 100W PD charging",
        sku: "USB-HUB-004",
        imageUrl: "https://images.unsplash.com/photo-1616578273461-3a99ce422de6?w=400",
      },
    }),
    prisma.product.create({
      data: {
        name: "Ergonomic Mouse",
        description: "Vertical ergonomic design, 6 programmable buttons",
        sku: "ERG-MS-005",
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
      },
    }),
  ]);

  // Create stock levels
  const stockData = [
    // Headphones
    { productId: products[0].id, warehouseId: mumbai.id, totalUnits: 15 },
    { productId: products[0].id, warehouseId: delhi.id, totalUnits: 8 },
    { productId: products[0].id, warehouseId: bangalore.id, totalUnits: 3 },
    // Keyboard
    { productId: products[1].id, warehouseId: mumbai.id, totalUnits: 20 },
    { productId: products[1].id, warehouseId: delhi.id, totalUnits: 12 },
    // Webcam
    { productId: products[2].id, warehouseId: mumbai.id, totalUnits: 5 },
    { productId: products[2].id, warehouseId: bangalore.id, totalUnits: 2 },
    // USB Hub
    { productId: products[3].id, warehouseId: mumbai.id, totalUnits: 30 },
    { productId: products[3].id, warehouseId: delhi.id, totalUnits: 25 },
    { productId: products[3].id, warehouseId: bangalore.id, totalUnits: 18 },
    // Mouse — intentionally low stock to demo 409
    { productId: products[4].id, warehouseId: mumbai.id, totalUnits: 1 },
    { productId: products[4].id, warehouseId: delhi.id, totalUnits: 0 },
  ];

  await prisma.stockLevel.createMany({ data: stockData });

  console.log(
    `Seeded: ${products.length} products, 3 warehouses, ${stockData.length} stock levels`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
