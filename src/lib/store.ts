export interface UserType {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  createdAt?: string;
}

export interface EmailLogType {
  id: string;
  to: string;
  subject: string;
  body: string;
  createdAt: string;
}

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

export interface OrderItemType {
  id: string;
  orderId: string;
  productId?: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface OrderType {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  postalCode: string;
  totalAmount: number;
  paymentMethodId?: string;
  paymentMethod?: PaymentMethodType;
  paymentProofUrl?: string;
  status: 'PENDING_PAYMENT' | 'WAITING_APPROVAL' | 'PAID' | 'SHIPPED' | 'REJECTED';
  checkoutType: 'WEB' | 'WHATSAPP';
  notes?: string;
  items: OrderItemType[];
  createdAt: string;
  updatedAt: string;
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

export const INITIAL_ORDERS: OrderType[] = [
  {
    id: 'ord-101',
    orderNumber: 'JO-20260720-001',
    customerName: 'Budi Santoso',
    customerEmail: 'budi@example.com',
    customerPhone: '081234567890',
    address: 'Jl. Malioboro No. 45',
    city: 'Yogyakarta',
    postalCode: '55271',
    totalAmount: 44.97,
    paymentMethodId: 'pay-1',
    paymentMethod: INITIAL_PAYMENT_METHODS[0],
    paymentProofUrl: 'https://images.unsplash.com/photo-1556742049-0a670fc80789?auto=format&fit=crop&w=600&q=80',
    status: 'WAITING_APPROVAL',
    checkoutType: 'WEB',
    notes: 'Tolong packing kayu jika memungkinkan',
    items: [
      {
        id: 'item-1',
        orderId: 'ord-101',
        productId: 'prod-1',
        productName: 'Java Origins Classic Herbal Drink (250ml Can)',
        price: 14.99,
        quantity: 2,
      },
      {
        id: 'item-2',
        orderId: 'ord-101',
        productId: 'prod-3',
        productName: 'Java Origins Turmeric Curcumin Drink (250ml Can)',
        price: 14.99,
        quantity: 1,
      },
    ],
    createdAt: '2026-07-20T12:00:00.000Z',
    updatedAt: '2026-07-20T12:00:00.000Z',
  },
];

interface DBStructure {
  users: UserType[];
  products: ProductType[];
  paymentMethods: PaymentMethodType[];
  banners: BannerType[];
  orders: OrderType[];
  emailLogs: EmailLogType[];
}

function getFS() {
  if (typeof window === 'undefined') {
    try {
      const fsModule = require('fs');
      const pathModule = require('path');
      return { fs: fsModule, path: pathModule };
    } catch {
      return null;
    }
  }
  return null;
}

function getDbFilePath(): string | null {
  if (typeof window === 'undefined') {
    try {
      const pathModule = require('path');
      return pathModule.join(process.cwd(), 'data', 'db.json');
    } catch {
      return null;
    }
  }
  return null;
}

function readDB(): DBStructure {
  const tools = getFS();
  const filePath = getDbFilePath();

  if (tools && filePath && tools.fs.existsSync(filePath)) {
    try {
      const data = tools.fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        products: Array.isArray(parsed.products) ? parsed.products : INITIAL_PRODUCTS,
        paymentMethods: Array.isArray(parsed.paymentMethods) ? parsed.paymentMethods : INITIAL_PAYMENT_METHODS,
        banners: Array.isArray(parsed.banners) ? parsed.banners : INITIAL_BANNERS,
        orders: Array.isArray(parsed.orders) ? parsed.orders : INITIAL_ORDERS,
        emailLogs: Array.isArray(parsed.emailLogs) ? parsed.emailLogs : [],
      };
    } catch (err) {
      console.error('Error reading db.json:', err);
    }
  }

  return {
    users: [],
    products: INITIAL_PRODUCTS,
    paymentMethods: INITIAL_PAYMENT_METHODS,
    banners: INITIAL_BANNERS,
    orders: INITIAL_ORDERS,
    emailLogs: [],
  };
}

function writeDB(db: DBStructure) {
  const tools = getFS();
  const filePath = getDbFilePath();

  if (tools && filePath) {
    try {
      const dir = tools.path.dirname(filePath);
      if (!tools.fs.existsSync(dir)) {
        tools.fs.mkdirSync(dir, { recursive: true });
      }
      tools.fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing db.json:', err);
    }
  }
}

export const store = {
  // USERS
  async getUsers(): Promise<UserType[]> {
    const db = readDB();
    return db.users;
  },

  async getUserByEmail(email: string): Promise<UserType | null> {
    const db = readDB();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async getUserById(id: string): Promise<UserType | null> {
    const db = readDB();
    return db.users.find((u) => u.id === id) || null;
  },

  async createUser(data: Omit<UserType, 'id' | 'createdAt'>): Promise<UserType> {
    const db = readDB();
    const newUser: UserType = {
      ...data,
      id: 'usr-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    db.users.unshift(newUser);
    writeDB(db);
    return newUser;
  },

  async updateUser(id: string, data: Partial<UserType>): Promise<UserType | null> {
    const db = readDB();
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      db.users[idx] = {
        ...db.users[idx],
        ...data,
      };
      writeDB(db);
      return db.users[idx];
    }
    return null;
  },

  // EMAIL NOTIFICATIONS
  async sendEmailNotification(to: string, subject: string, body: string): Promise<EmailLogType> {
    const db = readDB();
    const log: EmailLogType = {
      id: 'email-' + Date.now(),
      to,
      subject,
      body,
      createdAt: new Date().toISOString(),
    };
    db.emailLogs.unshift(log);
    writeDB(db);
    return log;
  },

  async getEmailLogs(email?: string): Promise<EmailLogType[]> {
    const db = readDB();
    if (email) {
      return db.emailLogs.filter((l) => l.to.toLowerCase() === email.toLowerCase());
    }
    return db.emailLogs;
  },

  // PRODUCTS
  async getProducts(): Promise<ProductType[]> {
    const db = readDB();
    return db.products;
  },

  async getProductById(id: string): Promise<ProductType | null> {
    const db = readDB();
    return db.products.find((p) => p.id === id || p.slug === id) || null;
  },

  async createProduct(data: Omit<ProductType, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductType> {
    const db = readDB();
    const newProd: ProductType = {
      ...data,
      id: 'prod-' + Date.now(),
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.products.unshift(newProd);
    writeDB(db);
    return newProd;
  },

  async updateProduct(id: string, data: Partial<ProductType>): Promise<ProductType | null> {
    const db = readDB();
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      db.products[idx] = {
        ...db.products[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      writeDB(db);
      return db.products[idx];
    }
    return null;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const db = readDB();
    db.products = db.products.filter((p) => p.id !== id);
    writeDB(db);
    return true;
  },

  // PAYMENT METHODS
  async getPaymentMethods(): Promise<PaymentMethodType[]> {
    const db = readDB();
    return db.paymentMethods;
  },

  async createPaymentMethod(data: Omit<PaymentMethodType, 'id' | 'createdAt'>): Promise<PaymentMethodType> {
    const db = readDB();
    const newPay: PaymentMethodType = {
      ...data,
      id: 'pay-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    db.paymentMethods.unshift(newPay);
    writeDB(db);
    return newPay;
  },

  async updatePaymentMethod(id: string, data: Partial<PaymentMethodType>): Promise<PaymentMethodType | null> {
    const db = readDB();
    const idx = db.paymentMethods.findIndex((p) => p.id === id);
    if (idx !== -1) {
      db.paymentMethods[idx] = {
        ...db.paymentMethods[idx],
        ...data,
      };
      writeDB(db);
      return db.paymentMethods[idx];
    }
    return null;
  },

  async deletePaymentMethod(id: string): Promise<boolean> {
    const db = readDB();
    db.paymentMethods = db.paymentMethods.filter((p) => p.id !== id);
    writeDB(db);
    return true;
  },

  // BANNERS
  async getBanners(): Promise<BannerType[]> {
    const db = readDB();
    return db.banners.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  async createBanner(data: Omit<BannerType, 'id' | 'createdAt'>): Promise<BannerType> {
    const db = readDB();
    const newBan: BannerType = {
      ...data,
      id: 'ban-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    db.banners.unshift(newBan);
    writeDB(db);
    return newBan;
  },

  async updateBanner(id: string, data: Partial<BannerType>): Promise<BannerType | null> {
    const db = readDB();
    const idx = db.banners.findIndex((b) => b.id === id);
    if (idx !== -1) {
      db.banners[idx] = {
        ...db.banners[idx],
        ...data,
      };
      writeDB(db);
      return db.banners[idx];
    }
    return null;
  },

  async deleteBanner(id: string): Promise<boolean> {
    const db = readDB();
    db.banners = db.banners.filter((b) => b.id !== id);
    writeDB(db);
    return true;
  },

  // ORDERS
  async getOrders(): Promise<OrderType[]> {
    const db = readDB();
    return db.orders;
  },

  async getOrdersByCustomerEmail(email: string): Promise<OrderType[]> {
    const db = readDB();
    return db.orders.filter((o) => o.customerEmail.toLowerCase() === email.toLowerCase());
  },

  async getOrderById(id: string): Promise<OrderType | null> {
    const db = readDB();
    return db.orders.find((o) => o.id === id || o.orderNumber === id) || null;
  },

  async createOrder(data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    city: string;
    postalCode: string;
    totalAmount: number;
    paymentMethodId?: string;
    checkoutType: 'WEB' | 'WHATSAPP';
    notes?: string;
    items: { productId?: string; productName: string; price: number; quantity: number }[];
  }): Promise<OrderType> {
    const db = readDB();
    const orderNum = `JO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;
    const payMethod = db.paymentMethods.find((p) => p.id === data.paymentMethodId) || undefined;

    const newOrder: OrderType = {
      id: 'ord-' + Date.now(),
      orderNumber: orderNum,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      totalAmount: data.totalAmount,
      paymentMethodId: data.paymentMethodId,
      paymentMethod: payMethod,
      status: 'PENDING_PAYMENT',
      checkoutType: data.checkoutType,
      notes: data.notes,
      items: data.items.map((i, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        orderId: 'ord-' + Date.now(),
        productId: i.productId,
        productName: i.productName,
        price: i.price,
        quantity: i.quantity,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);
    writeDB(db);

    // Send automated email notification on order placement
    if (data.customerEmail) {
      await this.sendEmailNotification(
        data.customerEmail,
        `Konfirmasi Pemesanan #${orderNum} - Java Origins`,
        `Halo ${data.customerName}, pesanan Anda #${orderNum} senilai $${data.totalAmount.toFixed(
          2
        )} NZD telah kami terima. Silakan lakukan pembayaran dan unggah bukti transfer.`
      );
    }

    return newOrder;
  },

  async updateOrderStatus(
    id: string,
    status: OrderType['status'],
    paymentProofUrl?: string
  ): Promise<OrderType | null> {
    const db = readDB();
    const idx = db.orders.findIndex((o) => o.id === id || o.orderNumber === id);
    if (idx !== -1) {
      db.orders[idx] = {
        ...db.orders[idx],
        status,
        ...(paymentProofUrl && { paymentProofUrl }),
        updatedAt: new Date().toISOString(),
      };
      writeDB(db);

      const targetOrder = db.orders[idx];
      let statusText: string = status;
      if (status === 'WAITING_APPROVAL') statusText = 'Menunggu ACC Admin (Bukti Bayar Terunggah)';
      if (status === 'PAID') statusText = 'Pembayaran Disetujui (PAID)';
      if (status === 'SHIPPED') statusText = 'Dalam Pengiriman (SHIPPED)';
      if (status === 'REJECTED') statusText = 'Ditolak (REJECTED)';

      if (targetOrder.customerEmail) {
        await this.sendEmailNotification(
          targetOrder.customerEmail,
          `Update Status Pesanan #${targetOrder.orderNumber} - Java Origins`,
          `Halo ${targetOrder.customerName}, status pesanan Anda #${targetOrder.orderNumber} telah diperbarui menjadi: ${statusText}.`
        );
      }

      return db.orders[idx];
    }
    return null;
  },
};
