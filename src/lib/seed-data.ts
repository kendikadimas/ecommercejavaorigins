export interface ProductType {
  id: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  ingredients?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentMethodType {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  qrCodeUrl?: string;
  instructions?: string;
  active: boolean;
  createdAt?: string;
}

export interface BannerType {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl: string;
  active: boolean;
  sortOrder: number;
  createdAt?: string;
}

export const INITIAL_PRODUCTS: ProductType[] = [
  {
    id: 'prod-1',
    name: 'Java Origins Classic Herbal Drink (250ml Can)',
    slug: 'java-origins-classic-herbal-drink',
    description:
      'Java Drink is a natural herbal beverage made from carefully selected Indonesian herbs, crafted to bring warmth, comfort, and goodness to your daily routine.',
    price: 14.99,
    stock: 120,
    category: 'Herbal Beverage',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
    ingredients: 'Ginger, Turmeric, Lemongrass, Palm Sugar, Honey',
    active: true,
    createdAt: '2026-07-20T12:00:00.000Z',
    updatedAt: '2026-07-20T12:00:00.000Z',
  },
  {
    id: 'prod-2',
    name: 'Java Origins Ginger Warmth Elixir (250ml Can)',
    slug: 'java-origins-ginger-warmth-elixir',
    description:
      'Spiced Indonesian red ginger extract blended with organic palm sugar to provide soothing chest warmth and digestive comfort.',
    price: 18.5,
    stock: 85,
    category: 'Herbal Beverage',
    image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80',
    ingredients: 'Red Ginger, Lemongrass, Cinnamon, Palm Sugar',
    active: true,
    createdAt: '2026-07-20T12:00:00.000Z',
    updatedAt: '2026-07-20T12:00:00.000Z',
  },
  {
    id: 'prod-3',
    name: 'Java Origins Turmeric Curcumin Drink (250ml Can)',
    slug: 'java-origins-turmeric-curcumin-drink',
    description:
      'Potent traditional kunyit asam tonic rich in natural antioxidants to boost vitality, immunity, and overall skin glow.',
    price: 14.99,
    stock: 90,
    category: 'Herbal Beverage',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
    ingredients: 'Turmeric, Tamarind, Honey, Lime Extract',
    active: true,
    createdAt: '2026-07-20T12:00:00.000Z',
    updatedAt: '2026-07-20T12:00:00.000Z',
  },
  {
    id: 'prod-4',
    name: 'Java Origins Pure Forest Honey Jar (500g)',
    slug: 'java-origins-pure-forest-honey',
    description: 'Raw unpasteurized wildflower honey harvested sustainably from native Javanese rainforest canopies.',
    price: 24.99,
    stock: 50,
    category: 'Honey & Elixir',
    image: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    ingredients: '100% Pure Forest Honey',
    active: true,
    createdAt: '2026-07-20T12:00:00.000Z',
    updatedAt: '2026-07-20T12:00:00.000Z',
  },
];

export const INITIAL_PAYMENT_METHODS: PaymentMethodType[] = [
  {
    id: 'pay-1',
    name: 'ASB Bank',
    bankName: 'ASB Bank',
    accountNumber: '12-3109-0482910-00',
    accountName: 'Pure Zealand',
    instructions: 'particular: your name | code: amount purchased | ref: order number',
    active: true,
    createdAt: '2026-07-20T12:00:00.000Z',
  },
];

export const INITIAL_BANNERS: BannerType[] = [
  {
    id: 'ban-1',
    title: 'THE JAVA ORIGINS DRINK',
    subtitle:
      'Java Drink is a natural herbal beverage made from carefully selected Indonesian herbs, crafted to bring warmth, comfort, and goodness to your daily routine.',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1600&q=80',
    linkUrl: '/shop',
    active: true,
    sortOrder: 1,
    createdAt: '2026-07-20T12:00:00.000Z',
  },
  {
    id: 'ban-2',
    title: 'AUTHENTIC INDONESIAN HERBAL BEAUTY & WELLNESS',
    subtitle: 'Handcrafted premium herbal formulations for global distribution and everyday living.',
    imageUrl: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=1600&q=80',
    linkUrl: '/shop',
    active: true,
    sortOrder: 2,
    createdAt: '2026-07-20T12:00:00.000Z',
  },
];
