const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Java Origins database...');

  // Products
  await prisma.product.deleteMany({});
  await prisma.product.createMany({
    data: [
      {
        id: 'prod-1',
        name: 'Java Origins Classic Herbal Drink (250ml Can)',
        slug: 'java-origins-classic-herbal-drink',
        description: 'Java Drink is a natural herbal beverage made from carefully selected Indonesian herbs, crafted to bring warmth, comfort, and goodness to your daily routine.',
        price: 35000,
        stock: 120,
        category: 'Herbal Beverage',
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
        ingredients: 'Ginger (Jahe Merah), Turmeric, Lemongrass, Palm Sugar, Honey, Water',
        active: true,
      },
      {
        id: 'prod-2',
        name: 'Java Origins Ginger & Forest Honey (500ml Jar)',
        slug: 'java-origins-ginger-forest-honey',
        description: 'Concentrated Indonesian red ginger infusion infused with pure wild forest honey. Perfect served warm or with ice for daily wellness.',
        price: 65000,
        stock: 85,
        category: 'Honey & Elixir',
        image: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=800&q=80',
        ingredients: 'Red Ginger (Jahe Merah), Wild Forest Honey, Cinnamon, Clove',
        active: true,
      },
      {
        id: 'prod-3',
        name: 'Java Origins Turmeric Curcumin Drink (250ml Can)',
        slug: 'java-origins-turmeric-curcumin',
        description: 'Golden turmeric blend with natural curcumin extracts and a citrus twist to refresh body and mind.',
        price: 38000,
        stock: 95,
        category: 'Herbal Beverage',
        image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
        ingredients: 'Turmeric, Black Pepper extract, Lime juice, Palm Sugar',
        active: true,
      },
      {
        id: 'prod-4',
        name: 'Java Origins Lemongrass & Palm Sugar Sachets (12 Pack)',
        slug: 'java-origins-lemongrass-sachets',
        description: 'Convenient traditional herbal sachet blend. Simply add warm water to experience authentic Javanese herbal tea.',
        price: 45000,
        stock: 150,
        category: 'Herbal Powder',
        image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80',
        ingredients: 'Extract Lemongrass, Organic Palm Sugar, Cloves, Pandan leaf',
        active: true,
      },
    ],
  });

  // Banners
  await prisma.banner.deleteMany({});
  await prisma.banner.createMany({
    data: [
      {
        id: 'ban-1',
        title: 'THE JAVA ORIGINS DRINK',
        subtitle: 'Java Drink is a natural herbal beverage made from carefully selected Indonesian herbs, crafted to bring warmth, comfort, and goodness to your daily routine.',
        imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1600&q=80',
        linkUrl: '/shop',
        active: true,
        sortOrder: 1,
      },
      {
        id: 'ban-2',
        title: 'AUTHENTIC INDONESIAN HERBAL BEAUTY & WELLNESS',
        subtitle: 'Handcrafted premium herbal formulations for global distribution and everyday living.',
        imageUrl: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=1600&q=80',
        linkUrl: '/shop',
        active: true,
        sortOrder: 2,
      },
    ],
  });

  // Payment Methods
  await prisma.paymentMethod.deleteMany({});
  await prisma.paymentMethod.createMany({
    data: [
      {
        id: 'pay-1',
        name: 'Bank BCA Transfer',
        bankName: 'BCA',
        accountNumber: '8830-1928-441',
        accountName: 'PT JAVA ORIGINS INDONESIA',
        instructions: 'Silakan transfer tepat sesuai total nominal pesanan. Kirimkan bukti bayar setelah transfer.',
        active: true,
      },
      {
        id: 'pay-2',
        name: 'Bank Mandiri Transfer',
        bankName: 'Mandiri',
        accountNumber: '137-00-1928-882',
        accountName: 'PT JAVA ORIGINS INDONESIA',
        instructions: 'Sertakan nomor order pada berita acara transfer.',
        active: true,
      },
      {
        id: 'pay-3',
        name: 'QRIS All Payment',
        bankName: 'QRIS',
        accountNumber: 'ID10293847561',
        accountName: 'JAVA ORIGINS OFFICIAL',
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=JAVA_ORIGINS_QRIS_PAYMENT',
        instructions: 'Scan QRIS menggunakan aplikasi E-Wallet (GoPay, OVO, ShopeePay, DANA) atau Mobile Banking Anda.',
        active: true,
      },
    ],
  });

  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
