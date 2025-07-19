import React from 'react';

export enum ProductUnit {
  ITEM = "個",
  BOX = "箱",
  CASE = "ケース",
  KILOGRAM = "kg",
  SET = "セット", 
}

export interface SummaryMetric {
  id: string;
  title: string;
  value: string;
  change?: string; 
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

export enum AlertActionType {
  CALL = 'call',
  REVIEW = 'review',
  CONFIRM = 'confirm',
}

export interface AlertItemData {
  id: string;
  productName: string;
  message: string;
  actionText?: string;
  actionType?: AlertActionType;
  currentInventory?: number;
  requiredOrder?: number;
  unit?: ProductUnit;
}

export interface TopSellingProductData {
  id: string;
  name: string;
  quantity: number;
  unit: ProductUnit;
  grossProfitAmount: number; 
  grossProfitMargin: number;
  requiredOrderQuantity: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: ProductUnit; 
  purchasePrice: number;
  salePrice: number; 
  supplierId: string;
  seasonality: string[];
  // Inventory specific fields
  currentStock?: number; 
  lowStockThreshold?: number; 
}

export interface ClientRule {
  clientId: string;
  productMappings: {
    clientTerm: string;
    productId: string;
    unitConversionFactor: number; 
    standardUnit: ProductUnit; 
  }[];
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  INVOICED = 'invoiced', 
}

export interface OrderItem {
  itemNumber: number; 
  productId: string;
  productName: string; 
  quantity: number;
  unit: ProductUnit; 
  unitPrice: number; 
  totalPrice: number; 
}

export interface Order {
  id: string;
  orderNumber: string; 
  clientId: string;
  clientName: string; 
  clientAddress: string; 
  items: OrderItem[];
  orderDate: string; 
  issueDate: string; 
  deliveryDate: string; 
  paymentDueDate?: string; 
  status: OrderStatus;
  subTotal: number; 
  taxRate?: number; 
  taxAmount: number; 
  totalAmount: number; 
  totalGrossProfit?: number; 
  notes?: string; 
  deliverySlipNotes?: string; 
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface AnalysisCardData {
  id: string; 
  title: string;
  icon: React.ReactNode;
  metrics: { label: string; value: string; }[];
  chartPlaceholder: string; 
}

export interface DashboardDisplaySettings {
  showSalesSummary: boolean;
  showProfitSummary: boolean;
  showOrderCount: boolean;
  showWarningProducts: boolean;
  showTop5Products: boolean;
}
export interface SettingsData {
  orderDeadlineTime: string;
  selectedClientRule: string;
  lowStockThreshold: number;
  abnormalOrderPercentage: number;
  dashboardDisplay: DashboardDisplaySettings;
}

export const initialSettingsData: SettingsData = {
  orderDeadlineTime: "06:00",
  selectedClientRule: "clientA",
  lowStockThreshold: 5,
  abnormalOrderPercentage: 200,
  dashboardDisplay: {
    showSalesSummary: true,
    showProfitSummary: true,
    showOrderCount: true,
    showWarningProducts: true,
    showTop5Products: true,
  }
};


export interface SettingItem {
  id: keyof SettingsData | keyof DashboardDisplaySettings;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  controlType: 'time' | 'select' | 'number' | 'checkbox' | 'buttonGroup' | 'navigationButton';
  options?: { value: string; label: string }[]; 
  buttonActions?: { label: string; actionKey: string; variant?: 'primary' | 'secondary' | 'danger' }[]; 
  navigateTo?: any; 
  currentValue?: any;
  onChange?: (value: any) => void;
  onAction?: (actionKey: string) => void;
}

export interface ProductDetailData {
  id: string;
  name: string;
  category: string;
  avgPrice: number;
  profitMargin: number;
  totalSalesLast30d: number;
  salesTrend: { date: string; sales: number }[];
  clientComposition: { clientId: string; clientName: string; percentage: number }[];
  inventoryHistory: { date: string; event: string; quantity: number; notes: string }[];
}

export interface ClientDetailData {
  id: string;
  name: string;
  totalTransactions90d: number;
  avgOrderValue: number;
  orderFrequency: string; 
  orderVolumeTrend: { date: string; orders: number }[];
  mainProducts: { productId: string; productName: string; quantity: number }[];
  pastOrders: Partial<Order>[]; 
}

export type AnalysisItemType = 'product' | 'client';

export interface CompanyInfo {
  name: string;
  logoUrl?: string; 
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  phone: string;
  fax?: string;
  email?: string;
  registrationNumber?: string; 
  bankAccount?: {
    bankName: string;
    branchName: string;
    accountType: string; 
    accountNumber: string;
    accountHolder: string; 
  }
}

export const mitoSeikaCompanyInfo: CompanyInfo = {
  name: "水戸青果株式会社",
  postalCode: "〒310-0015",
  addressLine1: "茨城県水戸市宮町1-1-1 水戸ビルディング 3F",
  phone: "029-123-4567",
  fax: "029-123-4568",
  email: "info@mitoseika.example.com",
  registrationNumber: "T1234567890123",
  bankAccount: {
    bankName: "水戸銀行",
    branchName: "本店営業部",
    accountType: "普通",
    accountNumber: "1234567",
    accountHolder: "ミトセイカ（カ"
  }
};

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);

export const mockProductsInventory: Product[] = [
  { id: 'prod_cabbage', name: 'キャベツ', category: '葉物野菜', unit: ProductUnit.ITEM, purchasePrice: 80, salePrice: 150, supplierId: 'sup1', seasonality: ['通年'], currentStock: 50, lowStockThreshold: 20 },
  { id: 'prod_tomato', name: 'トマト', category: '果菜類', unit: ProductUnit.BOX, purchasePrice: 800, salePrice: 1200, supplierId: 'sup2', seasonality: ['夏', '秋'], currentStock: 30, lowStockThreshold: 10 },
  { id: 'prod_onion', name: '玉ねぎ', category: '根菜類', unit: ProductUnit.KILOGRAM, purchasePrice: 150, salePrice: 300, supplierId: 'sup1', seasonality: ['通年'], currentStock: 100, lowStockThreshold: 30 },
  { id: 'prod_lettuce', name: 'レタス', category: '葉物野菜', unit: ProductUnit.ITEM, purchasePrice: 100, salePrice: 180, supplierId: 'sup3', seasonality: ['春', '秋'], currentStock: 15, lowStockThreshold: 10 },
  { id: 'prod_potato', name: 'じゃがいも (メークイン)', category: '根菜類', unit: ProductUnit.KILOGRAM, purchasePrice: 120, salePrice: 200, supplierId: 'sup1', seasonality: ['通年'], currentStock: 200, lowStockThreshold: 50 },
  { id: 'prod_carrot', name: '人参', category: '根菜類', unit: ProductUnit.KILOGRAM, purchasePrice: 130, salePrice: 250, supplierId: 'sup2', seasonality: ['通年'], currentStock: 80, lowStockThreshold: 25 },
  { id: 'prod_cucumber', name: 'きゅうり', category: '果菜類', unit: ProductUnit.CASE, purchasePrice: 1500, salePrice: 2000, supplierId: 'sup3', seasonality: ['夏'], currentStock: 25, lowStockThreshold: 5 },
  { id: 'prod_hakusai', name: '白菜', category: '葉物野菜', unit: ProductUnit.ITEM, purchasePrice: 180, salePrice: 300, supplierId: 'sup1', seasonality: ['冬'], currentStock: 40, lowStockThreshold: 15 },
  { id: 'prod_daikon', name: '大根', category: '根菜類', unit: ProductUnit.ITEM, purchasePrice: 90, salePrice: 160, supplierId: 'sup1', seasonality: ['通年'], currentStock: 60, lowStockThreshold: 20 },
  { id: 'prod_onion_small', name: '小玉ねぎ', category: '根菜類', unit: ProductUnit.KILOGRAM, purchasePrice: 200, salePrice: 350, supplierId: 'sup2', seasonality: ['通年'], currentStock: 45, lowStockThreshold: 10 },
];

export const mockOrders: Order[] = [
  {
    id: 'order_001',
    orderNumber: 'ON-20240729-001',
    clientId: 'client_AStore',
    clientName: 'A商店',
    clientAddress: '〒150-0002 東京都渋谷区渋谷1-2-3 Aビル101号室',
    items: [
      { itemNumber: 1, productId: 'prod_cabbage', productName: 'キャベツ', quantity: 10, unit: ProductUnit.ITEM, unitPrice: 150, totalPrice: 1500 },
      { itemNumber: 2, productId: 'prod_tomato', productName: 'トマト', quantity: 5, unit: ProductUnit.BOX, unitPrice: 1200, totalPrice: 6000 },
      { itemNumber: 3, productId: 'prod_onion', productName: '玉ねぎ', quantity: 20, unit: ProductUnit.KILOGRAM, unitPrice: 300, totalPrice: 6000 },
    ],
    orderDate: today.toISOString().split('T')[0],
    issueDate: today.toISOString().split('T')[0],
    deliveryDate: tomorrow.toISOString().split('T')[0],
    paymentDueDate: nextWeek.toISOString().split('T')[0],
    status: OrderStatus.CONFIRMED,
    subTotal: 13500,
    taxRate: 0.10,
    taxAmount: 1350,
    totalAmount: 14850,
    deliverySlipNotes: '納品時に担当者印をお願いします。請求書は別途郵送します。',
  },
  {
    id: 'order_002',
    orderNumber: 'ON-20240729-002',
    clientId: 'client_BDiner',
    clientName: 'B食堂',
    clientAddress: '〒160-0022 東京都新宿区新宿4-5-6 Bプラザ地下1階',
    items: [
      { itemNumber: 1, productId: 'prod_lettuce', productName: 'レタス', quantity: 15, unit: ProductUnit.ITEM, unitPrice: 180, totalPrice: 2700 },
      { itemNumber: 2, productId: 'prod_potato', productName: 'じゃがいも (メークイン)', quantity: 50, unit: ProductUnit.KILOGRAM, unitPrice: 200, totalPrice: 10000 },
      { itemNumber: 3, productId: 'prod_carrot', productName: '人参', quantity: 30, unit: ProductUnit.KILOGRAM, unitPrice: 250, totalPrice: 7500 },
    ],
    orderDate: today.toISOString().split('T')[0],
    issueDate: today.toISOString().split('T')[0],
    deliveryDate: tomorrow.toISOString().split('T')[0],
    paymentDueDate: new Date(new Date().setDate(today.getDate() + 30)).toISOString().split('T')[0], // Net 30
    status: OrderStatus.INVOICED,
    subTotal: 20200,
    taxRate: 0.10,
    taxAmount: 2020,
    totalAmount: 22220,
    notes: 'じゃがいもはメークイン指定。',
  },
  {
    id: 'order_003',
    orderNumber: 'ON-20240728-001',
    clientId: 'client_CVegeShop',
    clientName: 'C青果店',
    clientAddress: '〒310-0000 茨城県水戸市駅南2-3-4 Cマーケット内',
    items: [
      { itemNumber: 1, productId: 'prod_cucumber', productName: 'きゅうり', quantity: 5, unit: ProductUnit.CASE, unitPrice: 2000, totalPrice: 10000 },
      { itemNumber: 2, productId: 'prod_hakusai', productName: '白菜', quantity: 8, unit: ProductUnit.ITEM, unitPrice: 300, totalPrice: 2400 },
    ],
    orderDate: new Date(new Date().setDate(today.getDate() -1)).toISOString().split('T')[0], // Yesterday
    issueDate: new Date(new Date().setDate(today.getDate() -1)).toISOString().split('T')[0],
    deliveryDate: today.toISOString().split('T')[0],
    status: OrderStatus.DELIVERED,
    subTotal: 12400,
    taxRate: 0.08, // Reduced tax rate example
    taxAmount: 992,
    totalAmount: 13392,
  }
];

export interface Client {
  id: string;
  customerId?: string; // 顧客ID
  companyName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  ruleSummary?: string; // e.g., "キャベツ大玉=1箱(6玉), トマトは湯むき用"
}

export const mockClients: Client[] = [
  { 
    id: 'client_AStore', 
    customerId: '0001',
    companyName: 'A商店', 
    contactPerson: '山田 太郎', 
    phone: '03-1234-5678', 
    email: 'yamada@astore.example.com', 
    address: '東京都渋谷区渋谷1-2-3 Aビル101号室',
    ruleSummary: 'キャベツは1個=6玉入り1箱として計算。トマトは赤熟指定。'
  },
  { 
    id: 'client_BDiner', 
    customerId: '0002',
    companyName: 'B食堂', 
    contactPerson: '佐藤 花子', 
    phone: '03-9876-5432', 
    email: 'sato@bdiner.example.com', 
    address: '東京都新宿区新宿4-5-6 Bプラザ地下1階',
    ruleSummary: 'じゃがいもはメークイン限定。週2回定期配送。'
  },
  { 
    id: 'client_CVegeShop', 
    customerId: '0003',
    companyName: 'C青果店', 
    contactPerson: '田中 一郎', 
    phone: '029-111-2222', 
    email: 'tanaka@cvegeshop.example.com', 
    address: '茨城県水戸市駅南2-3-4 Cマーケット内',
    ruleSummary: 'ケース単位での注文が多い。月末締め翌月払い。'
  },
   { 
    id: 'client_NewHotel', 
    customerId: '0004',
    companyName: '水戸ニューホテル', 
    contactPerson: '鈴木 次郎', 
    phone: '029-333-4444', 
    email: 'suzuki@mitonewhotel.example.com', 
    address: '茨城県水戸市中央1-10-1',
    ruleSummary: '高級食材中心。朝夕2回納品。'
  },
];
