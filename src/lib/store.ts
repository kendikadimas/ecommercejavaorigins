import { getDb, toISO } from './db';
import type { BannerType, PaymentMethodType, ProductType } from './seed-data';
import type { RowDataPacket } from 'mysql2';

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

interface UserRow extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  createdAt?: Date | string;
}

interface ProductRow extends RowDataPacket {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  price: string | number;
  stock: number;
  category?: string;
  image?: string;
  ingredients?: string;
  active: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface PaymentMethodRow extends RowDataPacket {
  id: string;
  name: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  qr_code_url?: string;
  instructions?: string;
  active: number;
  created_at?: Date | string;
}

interface BannerRow extends RowDataPacket {
  id: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  link_url?: string;
  active: number;
  sort_order: number;
  created_at?: Date | string;
}

interface OrderRow extends RowDataPacket {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  postalCode: string;
  totalAmount: string | number;
  paymentMethodId?: string;
  paymentProofUrl?: string;
  status: OrderType['status'];
  checkoutType: 'WEB' | 'WHATSAPP';
  notes?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  // payment method joined fields
  pmId?: string;
  pmName?: string;
  pmBankName?: string;
  pmAccountNumber?: string;
  pmAccountName?: string;
  pmQrCodeUrl?: string;
  pmInstructions?: string;
  pmActive?: number;
}

interface ItemRow extends RowDataPacket {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  price: string | number;
  quantity: number;
}

interface ReviewRow extends RowDataPacket {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface ReviewType {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}

const nowISO = () => new Date().toISOString();

function mapUser(r: UserRow): UserType {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    ...(r.password !== undefined && { password: r.password }),
    ...(r.phone !== undefined && { phone: r.phone }),
    ...(r.address !== undefined && { address: r.address }),
    ...(r.city !== undefined && { city: r.city }),
    ...(r.postalCode !== undefined && { postalCode: r.postalCode }),
    ...(toISO(r.createdAt) && { createdAt: toISO(r.createdAt) }),
  };
}

function mapProduct(r: ProductRow): ProductType {
  return {
    id: r.id,
    name: r.name,
    ...((r.slug ?? '') && { slug: r.slug as string }),
    description: r.description ?? '',
    price: Number(r.price),
    stock: Number(r.stock),
    category: r.category ?? '',
    image: r.image ?? '',
    ...((r.ingredients ?? '') && { ingredients: r.ingredients as string }),
    active: Boolean(r.active),
    ...(toISO(r.createdAt) && { createdAt: toISO(r.createdAt) }),
    ...(toISO(r.updatedAt) && { updatedAt: toISO(r.updatedAt) }),
  };
}

function mapPaymentMethod(r: PaymentMethodRow): PaymentMethodType {
  return {
    id: r.id,
    name: r.name,
    bankName: r.bank_name ?? '',
    accountNumber: r.account_number ?? '',
    accountName: r.account_name ?? '',
    ...(r.qr_code_url && { qrCodeUrl: r.qr_code_url }),
    ...(r.instructions && { instructions: r.instructions }),
    active: Boolean(r.active),
    ...(toISO(r.created_at) && { createdAt: toISO(r.created_at) }),
  };
}

function mapBanner(r: BannerRow): BannerType {
  return {
    id: r.id,
    title: r.title,
    ...(r.subtitle && { subtitle: r.subtitle }),
    imageUrl: r.image_url ?? '',
    linkUrl: r.link_url ?? '',
    active: Boolean(r.active),
    sortOrder: Number(r.sort_order),
    ...(toISO(r.created_at) && { createdAt: toISO(r.created_at) }),
  };
}

function mapOrder(r: OrderRow): OrderType {
  const paymentMethod: PaymentMethodType | undefined = r.pmId
    ? {
        id: r.pmId,
        name: r.pmName ?? '',
        bankName: r.pmBankName ?? '',
        accountNumber: r.pmAccountNumber ?? '',
        accountName: r.pmAccountName ?? '',
        ...(r.pmQrCodeUrl && { qrCodeUrl: r.pmQrCodeUrl }),
        ...(r.pmInstructions && { instructions: r.pmInstructions }),
        active: Boolean(r.pmActive),
      }
    : undefined;
  return {
    id: r.id,
    orderNumber: r.orderNumber,
    customerName: r.customerName,
    customerEmail: r.customerEmail,
    customerPhone: r.customerPhone,
    address: r.address,
    city: r.city,
    postalCode: r.postalCode,
    totalAmount: Number(r.totalAmount),
    ...(r.paymentMethodId && { paymentMethodId: r.paymentMethodId }),
    ...(paymentMethod && { paymentMethod }),
    ...(r.paymentProofUrl && { paymentProofUrl: r.paymentProofUrl }),
    status: r.status,
    checkoutType: r.checkoutType,
    ...(r.notes && { notes: r.notes }),
    items: [],
    createdAt: toISO(r.createdAt) ?? nowISO(),
    updatedAt: toISO(r.updatedAt) ?? nowISO(),
  };
}

const ORDER_SELECT = `
SELECT
  o.id, o.order_number AS orderNumber, o.customer_name AS customerName,
  o.customer_email AS customerEmail, o.customer_phone AS customerPhone,
  o.address, o.city, o.postal_code AS postalCode, o.total_amount AS totalAmount,
  o.payment_method_id AS paymentMethodId, o.payment_proof_url AS paymentProofUrl,
  o.status, o.checkout_type AS checkoutType, o.notes,
  o.created_at AS createdAt, o.updated_at AS updatedAt,
  pm.id AS pmId, pm.name AS pmName, pm.bank_name AS pmBankName,
  pm.account_number AS pmAccountNumber, pm.account_name AS pmAccountName,
  pm.qr_code_url AS pmQrCodeUrl, pm.instructions AS pmInstructions, pm.active AS pmActive
FROM orders o
LEFT JOIN payment_methods pm ON pm.id = o.payment_method_id
`;

async function attachItems(orders: OrderType[]): Promise<OrderType[]> {
  if (orders.length === 0) return orders;
  const ids = orders.map((o) => o.id);
  const db = await getDb();
  const [rows] = await db.query<ItemRow[]>(
    'SELECT * FROM order_items WHERE order_id IN (?) ORDER BY id',
    [ids]
  );
  for (const item of rows) {
    const order = orders.find((o) => o.id === item.order_id);
    if (order) {
      order.items.push({
        id: item.id,
        orderId: item.order_id,
        ...(item.product_id && { productId: item.product_id }),
        productName: item.product_name,
        price: Number(item.price),
        quantity: Number(item.quantity),
      });
    }
  }
  return orders;
}

export const store = {
  // USERS
  async getUsers(): Promise<UserType[]> {
    const db = await getDb();
    const [rows] = await db.query<UserRow[]>('SELECT * FROM users ORDER BY created_at DESC');
    return rows.map(mapUser);
  },

  async getUserByEmail(email: string): Promise<UserType | null> {
    const db = await getDb();
    const [rows] = await db.query<UserRow[]>(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
      [email]
    );
    return rows.length ? mapUser(rows[0]) : null;
  },

  async getUserById(id: string): Promise<UserType | null> {
    const db = await getDb();
    const [rows] = await db.query<UserRow[]>('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    return rows.length ? mapUser(rows[0]) : null;
  },

  async createUser(data: Omit<UserType, 'id' | 'createdAt'>): Promise<UserType> {
    const db = await getDb();
    const id = 'usr-' + Date.now();
    const createdAt = nowISO();
    await db.query(
      `INSERT INTO users (id, name, email, password, phone, address, city, postal_code, created_at)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        id,
        data.name,
        data.email,
        data.password ?? '',
        data.phone ?? '',
        data.address ?? '',
        data.city ?? '',
        data.postalCode ?? '',
        createdAt,
      ]
    );
    return { ...data, id, createdAt } as UserType;
  },

  async updateUser(id: string, data: Partial<UserType>): Promise<UserType | null> {
    const db = await getDb();
    const fields: string[] = [];
    const values: unknown[] = [];
    const map: Partial<Record<keyof UserType, string>> = {
      name: 'name',
      phone: 'phone',
      address: 'address',
      city: 'city',
      postalCode: 'postal_code',
      password: 'password',
    };
    for (const [key, col] of Object.entries(map)) {
      if (data[key as keyof typeof data] !== undefined) {
        fields.push(`${col} = ?`);
        values.push(data[key as keyof typeof data]);
      }
    }
    if (fields.length === 0) return this.getUserById(id);
    values.push(id);
    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getUserById(id);
  },

  // EMAIL NOTIFICATIONS
  async sendEmailNotification(to: string, subject: string, body: string): Promise<EmailLogType> {
    const db = await getDb();
    const id = 'email-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const createdAt = nowISO();
    await db.query(
      'INSERT INTO email_logs (id, to_email, subject, body, created_at) VALUES (?,?,?,?,?)',
      [id, to, subject, body, createdAt]
    );
    return { id, to, subject, body, createdAt };
  },

  async getEmailLogs(email?: string): Promise<EmailLogType[]> {
    const db = await getDb();
    const [rows] = email
      ? await db.query<RowDataPacket[]>(
          'SELECT * FROM email_logs WHERE LOWER(to_email) = LOWER(?) ORDER BY created_at DESC',
          [email]
        )
      : await db.query<RowDataPacket[]>('SELECT * FROM email_logs ORDER BY created_at DESC');
    return rows.map((r) => ({
      id: r.id as string,
      to: r.to_email as string,
      subject: r.subject as string,
      body: r.body as string,
      createdAt: toISO(r.created_at) ?? nowISO(),
    }));
  },

  // PRODUCTS
  async getProducts(): Promise<ProductType[]> {
    const db = await getDb();
    const [rows] = await db.query<ProductRow[]>('SELECT * FROM products ORDER BY created_at DESC');
    return rows.map(mapProduct);
  },

  async getProductById(id: string): Promise<ProductType | null> {
    const db = await getDb();
    const [rows] = await db.query<ProductRow[]>(
      'SELECT * FROM products WHERE id = ? OR slug = ? LIMIT 1',
      [id, id]
    );
    return rows.length ? mapProduct(rows[0]) : null;
  },

  async createProduct(data: Omit<ProductType, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductType> {
    const db = await getDb();
    const id = 'prod-' + Date.now();
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const createdAt = nowISO();
    await db.query(
      `INSERT INTO products (id, name, slug, description, price, stock, category, image, ingredients, active, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id,
        data.name,
        slug,
        data.description ?? '',
        data.price,
        data.stock,
        data.category ?? '',
        data.image ?? '',
        data.ingredients ?? '',
        data.active ? 1 : 0,
        createdAt,
        createdAt,
      ]
    );
    return { ...data, id, slug, createdAt, updatedAt: createdAt } as ProductType;
  },

  async updateProduct(id: string, data: Partial<ProductType>): Promise<ProductType | null> {
    const db = await getDb();
    const existing = await this.getProductById(id);
    if (!existing) return null;
    const updatedAt = nowISO();
    const fields: string[] = [];
    const values: unknown[] = [];
    const map: Record<string, string> = {
      name: 'name',
      slug: 'slug',
      description: 'description',
      price: 'price',
      stock: 'stock',
      category: 'category',
      image: 'image',
      ingredients: 'ingredients',
      active: 'active',
    };
    for (const [key, col] of Object.entries(map)) {
      if (data[key as keyof typeof data] !== undefined) {
        fields.push(`${col} = ?`);
        const val = data[key as keyof typeof data];
        values.push(key === 'active' ? (data.active ? 1 : 0) : val);
      }
    }
    fields.push('updated_at = ?');
    values.push(updatedAt, id);
    if (fields.length) {
      await db.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
    }
    return this.getProductById(id);
  },

  async deleteProduct(id: string): Promise<boolean> {
    const db = await getDb();
    const [res] = await db.query('DELETE FROM products WHERE id = ?', [id]);
    return (res as any).affectedRows > 0;
  },

  // PAYMENT METHODS
  async getPaymentMethods(): Promise<PaymentMethodType[]> {
    const db = await getDb();
    const [rows] = await db.query<PaymentMethodRow[]>(
      'SELECT * FROM payment_methods ORDER BY created_at DESC'
    );
    return rows.map(mapPaymentMethod);
  },

  async createPaymentMethod(data: Omit<PaymentMethodType, 'id' | 'createdAt'>): Promise<PaymentMethodType> {
    const db = await getDb();
    const id = 'pay-' + Date.now();
    const createdAt = nowISO();
    await db.query(
      `INSERT INTO payment_methods (id, name, bank_name, account_number, account_name, qr_code_url, instructions, active, created_at)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        id,
        data.name,
        data.bankName ?? '',
        data.accountNumber ?? '',
        data.accountName ?? '',
        data.qrCodeUrl ?? '',
        data.instructions ?? '',
        data.active ? 1 : 0,
        createdAt,
      ]
    );
    return { ...data, id, createdAt } as PaymentMethodType;
  },

  async updatePaymentMethod(id: string, data: Partial<PaymentMethodType>): Promise<PaymentMethodType | null> {
    const db = await getDb();
    const fields: string[] = [];
    const values: unknown[] = [];
    const map: Record<string, string> = {
      name: 'name',
      bankName: 'bank_name',
      accountNumber: 'account_number',
      accountName: 'account_name',
      qrCodeUrl: 'qr_code_url',
      instructions: 'instructions',
      active: 'active',
    };
    for (const [key, col] of Object.entries(map)) {
      if (data[key as keyof typeof data] !== undefined) {
        fields.push(`${col} = ?`);
        values.push(key === 'active' ? (data.active ? 1 : 0) : data[key as keyof typeof data]);
      }
    }
    if (!fields.length) return this.getPaymentMethods().then((list) => list.find((p) => p.id === id) ?? null);
    values.push(id);
    await db.query(`UPDATE payment_methods SET ${fields.join(', ')} WHERE id = ?`, values);
    const list = await this.getPaymentMethods();
    return list.find((p) => p.id === id) ?? null;
  },

  async deletePaymentMethod(id: string): Promise<boolean> {
    const db = await getDb();
    const [res] = await db.query('DELETE FROM payment_methods WHERE id = ?', [id]);
    return (res as any).affectedRows > 0;
  },

  // BANNERS
  async getBanners(): Promise<BannerType[]> {
    const db = await getDb();
    const [rows] = await db.query<BannerRow[]>('SELECT * FROM banners ORDER BY sort_order ASC');
    return rows.map(mapBanner);
  },

  async createBanner(data: Omit<BannerType, 'id' | 'createdAt'>): Promise<BannerType> {
    const db = await getDb();
    const id = 'ban-' + Date.now();
    const createdAt = nowISO();
    await db.query(
      `INSERT INTO banners (id, title, subtitle, image_url, link_url, active, sort_order, created_at)
       VALUES (?,?,?,?,?,?,?,?)`,
      [id, data.title, data.subtitle ?? '', data.imageUrl, data.linkUrl, data.active ? 1 : 0, data.sortOrder, createdAt]
    );
    return { ...data, id, createdAt } as BannerType;
  },

  async updateBanner(id: string, data: Partial<BannerType>): Promise<BannerType | null> {
    const db = await getDb();
    const fields: string[] = [];
    const values: unknown[] = [];
    const map: Record<string, string> = {
      title: 'title',
      subtitle: 'subtitle',
      imageUrl: 'image_url',
      linkUrl: 'link_url',
      active: 'active',
      sortOrder: 'sort_order',
    };
    for (const [key, col] of Object.entries(map)) {
      if (data[key as keyof typeof data] !== undefined) {
        fields.push(`${col} = ?`);
        values.push(key === 'active' ? (data.active ? 1 : 0) : data[key as keyof typeof data]);
      }
    }
    if (!fields.length) return this.getBanners().then((list) => list.find((b) => b.id === id) ?? null);
    values.push(id);
    await db.query(`UPDATE banners SET ${fields.join(', ')} WHERE id = ?`, values);
    const list = await this.getBanners();
    return list.find((b) => b.id === id) ?? null;
  },

  async deleteBanner(id: string): Promise<boolean> {
    const db = await getDb();
    const [res] = await db.query('DELETE FROM banners WHERE id = ?', [id]);
    return (res as any).affectedRows > 0;
  },

  // REVIEWS
  async getProductRatings(): Promise<Record<string, { average: number; count: number }>> {
    const db = await getDb();
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT product_id, AVG(rating) AS avg, COUNT(*) AS n FROM reviews GROUP BY product_id'
    );
    const map: Record<string, { average: number; count: number }> = {};
    for (const r of rows) {
      map[r.product_id as string] = {
        average: Math.round(Number(r.avg) * 10) / 10,
        count: Number(r.n),
      };
    }
    return map;
  },

  async getReviewsByProduct(productId: string): Promise<ReviewType[]> {
    const db = await getDb();
    const [rows] = await db.query<ReviewRow[]>(
      'SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC',
      [productId]
    );
    return rows.map((r) => ({
      id: r.id,
      productId: r.product_id,
      userId: r.user_id,
      userName: r.user_name,
      rating: Number(r.rating),
      ...(r.comment && { comment: r.comment }),
      ...(toISO(r.created_at) && { createdAt: toISO(r.created_at) }),
      ...(toISO(r.updated_at) && { updatedAt: toISO(r.updated_at) }),
    }));
  },

  async getReviewByUserAndProduct(userId: string, productId: string): Promise<ReviewType | null> {
    const db = await getDb();
    const [rows] = await db.query<ReviewRow[]>(
      'SELECT * FROM reviews WHERE user_id = ? AND product_id = ? LIMIT 1',
      [userId, productId]
    );
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      productId: r.product_id,
      userId: r.user_id,
      userName: r.user_name,
      rating: Number(r.rating),
      ...(r.comment && { comment: r.comment }),
      ...(toISO(r.created_at) && { createdAt: toISO(r.created_at) }),
      ...(toISO(r.updated_at) && { updatedAt: toISO(r.updated_at) }),
    };
  },

  async upsertReview(data: {
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    comment?: string;
  }): Promise<ReviewType> {
    const db = await getDb();
    const existing = await this.getReviewByUserAndProduct(data.userId, data.productId);
    const now = nowISO();
    if (existing) {
      await db.query(
        'UPDATE reviews SET rating = ?, comment = ?, user_name = ?, updated_at = ? WHERE id = ?',
        [data.rating, data.comment ?? '', data.userName, now, existing.id]
      );
      return (await this.getReviewByUserAndProduct(data.userId, data.productId))!;
    }
    const id = 'rev-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    await db.query(
      `INSERT INTO reviews (id, product_id, user_id, user_name, rating, comment, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment), user_name = VALUES(user_name), updated_at = VALUES(updated_at)`,
      [id, data.productId, data.userId, data.userName, data.rating, data.comment ?? '', now, now]
    );
    return (await this.getReviewByUserAndProduct(data.userId, data.productId))!;
  },

  async deleteReview(id: string, userId: string): Promise<boolean> {
    const db = await getDb();
    const [res] = await db.query('DELETE FROM reviews WHERE id = ? AND user_id = ?', [id, userId]);
    return (res as any).affectedRows > 0;
  },

  // PASSWORD RESET
  async createPasswordReset(email: string, token: string, expiresAt: Date): Promise<void> {
    const db = await getDb();
    const id = 'rst-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    // invalidate any prior unused resets for this email
    await db.query("UPDATE password_resets SET used = 1 WHERE email = ? AND used = 0", [email]);
    await db.query(
      'INSERT INTO password_resets (id, email, token, expires_at, used) VALUES (?,?,?,?,0)',
      [id, email, token, expiresAt]
    );
  },

  async getPasswordReset(token: string): Promise<{ email: string; expires_at: Date; used: number } | null> {
    const db = await getDb();
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT email, expires_at, used FROM password_resets WHERE token = ? ORDER BY created_at DESC LIMIT 1',
      [token]
    );
    if (!rows.length) return null;
    return {
      email: rows[0].email as string,
      expires_at: rows[0].expires_at as Date,
      used: Number(rows[0].used),
    };
  },

  async markPasswordResetUsed(token: string): Promise<void> {
    const db = await getDb();
    await db.query('UPDATE password_resets SET used = 1 WHERE token = ?', [token]);
  },

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    const db = await getDb();
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
  },

  // ORDERS
  async getOrders(): Promise<OrderType[]> {
    const db = await getDb();
    const [rows] = await db.query<OrderRow[]>(ORDER_SELECT + ' ORDER BY o.created_at DESC');
    return attachItems(rows.map(mapOrder));
  },

  async getOrdersByCustomerEmail(email: string): Promise<OrderType[]> {
    const db = await getDb();
    const [rows] = await db.query<OrderRow[]>(
      ORDER_SELECT + ' WHERE LOWER(o.customer_email) = LOWER(?) ORDER BY o.created_at DESC',
      [email]
    );
    return attachItems(rows.map(mapOrder));
  },

  async getOrderById(id: string): Promise<OrderType | null> {
    const db = await getDb();
    const [rows] = await db.query<OrderRow[]>(
      ORDER_SELECT + ' WHERE o.id = ? OR o.order_number = ? LIMIT 1',
      [id, id]
    );
    if (!rows.length) return null;
    const [order] = await attachItems([mapOrder(rows[0])]);
    return order;
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
    const db = await getDb();
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const orderId = crypto.randomUUID();
      const orderNum = `JO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;
      const createdAt = nowISO();

      // Stock: lock rows, verify, decrement (same write as order create)
      for (const item of data.items) {
        if (!item.productId) continue;
        const [prodRows] = await conn.query<ProductRow[]>(
          'SELECT * FROM products WHERE id = ? FOR UPDATE',
          [item.productId]
        );
        if (!prodRows.length) throw new Error(`Produk ${item.productId} tidak ditemukan`);
        const prod = prodRows[0];
        if (Number(prod.stock) < item.quantity) {
          throw new Error(`Stok ${prod.name} tidak cukup`);
        }
        await conn.query('UPDATE products SET stock = stock - ?, updated_at = ? WHERE id = ?', [
          item.quantity,
          createdAt,
          item.productId,
        ]);
      }

      await conn.query(
        `INSERT INTO orders (id, order_number, customer_name, customer_email, customer_phone, address, city, postal_code, total_amount, payment_method_id, status, checkout_type, notes, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          orderId,
          orderNum,
          data.customerName,
          data.customerEmail,
          data.customerPhone,
          data.address,
          data.city,
          data.postalCode,
          data.totalAmount,
          data.paymentMethodId ?? null,
          'PENDING_PAYMENT',
          data.checkoutType,
          data.notes ?? '',
          createdAt,
          createdAt,
        ]
      );

      for (const item of data.items) {
        await conn.query(
          'INSERT INTO order_items (id, order_id, product_id, product_name, price, quantity) VALUES (?,?,?,?,?,?)',
          [
            crypto.randomUUID(),
            orderId,
            item.productId ?? null,
            item.productName,
            item.price,
            item.quantity,
          ]
        );
      }

      await conn.commit();

      // Email notification (best-effort, di luar transaksi)
      if (data.customerEmail) {
        this.sendEmailNotification(
          data.customerEmail,
          `Konfirmasi Pemesanan #${orderNum} - Java Origins`,
          `Halo ${data.customerName}, pesanan Anda #${orderNum} senilai $${data.totalAmount.toFixed(
            2
          )} NZD telah kami terima. Silakan lakukan pembayaran dan unggah bukti transfer.`
        ).catch(() => {});
      }

      const created = await this.getOrderById(orderId);
      return created!;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async updateOrderStatus(
    id: string,
    status: OrderType['status'],
    paymentProofUrl?: string,
    fromStatuses?: OrderType['status'][]
  ): Promise<OrderType | null> {
    const db = await getDb();
    const existing = await this.getOrderById(id);
    if (!existing) return null;
    if (fromStatuses && !fromStatuses.includes(existing.status)) return null;

    const updatedAt = nowISO();
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      if (paymentProofUrl) {
        await conn.query('UPDATE orders SET status = ?, payment_proof_url = ?, updated_at = ? WHERE id = ?', [
          status,
          paymentProofUrl,
          updatedAt,
          existing.id,
        ]);
      } else {
        await conn.query('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?', [
          status,
          updatedAt,
          existing.id,
        ]);
      }

      // REJECTED (from a stock-holding status): return reserved stock to the shelf
      const RELEASABLE = ['PENDING_PAYMENT', 'WAITING_APPROVAL', 'PAID'];
      if (status === 'REJECTED' && RELEASABLE.includes(existing.status)) {
        for (const item of existing.items) {
          if (!item.productId) continue;
          await conn.query('UPDATE products SET stock = stock + ?, updated_at = ? WHERE id = ?', [
            item.quantity,
            updatedAt,
            item.productId,
          ]);
        }
      }

      // REJECTED → any stock-holding status (WAITING_APPROVAL re-upload, or admin PAID/SHIPPED):
      // re-reserve the stock that was released on reject
      const HOLDS_STOCK = ['PENDING_PAYMENT', 'WAITING_APPROVAL', 'PAID', 'SHIPPED'];
      if (existing.status === 'REJECTED' && HOLDS_STOCK.includes(status)) {
        for (const item of existing.items) {
          if (!item.productId) continue;
          await conn.query(
            'UPDATE products SET stock = stock - ?, updated_at = ? WHERE id = ? AND stock >= ?',
            [item.quantity, updatedAt, item.productId, item.quantity]
          );
        }
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    let statusText: string = status;
    if (status === 'WAITING_APPROVAL') statusText = 'Menunggu ACC Admin (Bukti Bayar Terunggah)';
    if (status === 'PAID') statusText = 'Pembayaran Disetujui (PAID)';
    if (status === 'SHIPPED') statusText = 'Dalam Pengiriman (SHIPPED)';
    if (status === 'REJECTED') statusText = 'Ditolak (REJECTED)';

    if (existing.customerEmail) {
      this.sendEmailNotification(
        existing.customerEmail,
        `Update Status Pesanan #${existing.orderNumber} - Java Origins`,
        `Halo ${existing.customerName}, status pesanan Anda #${existing.orderNumber} telah diperbarui menjadi: ${statusText}.`
      ).catch(() => {});
    }

    return this.getOrderById(existing.id);
  },
};
