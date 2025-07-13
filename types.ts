

// Type definitions for Web Speech API, consolidated here for stability.
declare global {
    interface SpeechRecognitionAlternative {
        readonly transcript: string;
        readonly confidence: number;
    }

    interface SpeechRecognitionResult {
        readonly isFinal: boolean;
        readonly length: number;
        item(index: number): SpeechRecognitionAlternative;
        [index: number]: SpeechRecognitionAlternative;
    }

    interface SpeechRecognitionResultList {
        readonly length: number;
        item(index: number): SpeechRecognitionResult;
        [index: number]: SpeechRecognitionResult;
    }

    interface SpeechRecognitionErrorEvent extends Event {
        readonly error: string;
        readonly message: string;
    }

    interface SpeechRecognitionEvent extends Event {
        readonly resultIndex: number;
        readonly results: SpeechRecognitionResultList;
    }

    interface SpeechRecognitionStatic {
        new(): SpeechRecognition;
    }

    interface SpeechRecognition extends EventTarget {
        continuous: boolean;
        interimResults: boolean;
        lang: string;

        start(): void;
        stop(): void;

        onresult: ((event: SpeechRecognitionEvent) => void) | null;
        onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
        onend: (() => void) | null;
    }

    interface Window {
        SpeechRecognition: SpeechRecognitionStatic;
        webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}


export type TransactionType = 'income' | 'expense';
export const TransactionType = {
    INCOME: 'income' as 'income',
    EXPENSE: 'expense' as 'expense',
};

export interface Item {
  id: string;
  ownerId: string;
  name: string;
  type: TransactionType;
  nature: 'service' | 'product';
  unitPrice?: number;
}

export interface QuotationItem {
  id:string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
}

export interface Quotation {
  id: string;
  ownerId: string;
  quotationNumber: string;
  businessId: string;
  clientId: string;
  date: string; // ISO string format
  expiryDate: string; // ISO string format
  items: QuotationItem[];
  subtotal: number;
  taxRate: number; // As a percentage, e.g. 15 for 15%
  total: number;
  notes?: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
}

export interface Payment {
  id: string;
  date: string; // ISO string format
  amount: number;
  method: 'cash' | 'card' | 'bank_transfer' | 'other';
}

export interface Transaction {
  id: string;
  ownerId: string;
  businessId: string;
  type: TransactionType;
  name: string;
  description?: string;
  amount: number; // For invoices, this is the total amount.
  date: string; // ISO string format
  dueDate?: string; // ISO string format
  category: string;
  receiptImage?: string; // base64 encoded image
  clientId?: string;
  vendorId?: string;
  transactionNumber: string;
  nature: 'service' | 'product';
  quantity?: number;
  unitPrice?: number;
  relatedQuotationId?: string;
  
  // New Fields for Payment Tracking & Audit Trail
  status: 'paid' | 'unpaid' | 'partially_paid' | 'overdue' | 'voided';
  payments: Payment[];

  // New Fields for Order Tracking
  orderStatus?: 'pending' | 'in_progress' | 'ready_for_pickup' | 'shipped' | 'completed' | 'cancelled';
  fulfillmentType?: 'in-house' | 'outsourced';
  deliveryMethod?: 'pickup' | 'delivery' | 'digital' | 'shipping';
  trackingNumber?: string;
  shippingNotes?: string;
}

export type PartialTransaction = {
  type?: TransactionType;
  name?: string;
  description?: string;
  amount?: number;
  date?: string;
  category?: string;
  clientId?: string;
  vendorId?: string;
  newClientName?: string; // For newly detected client
  newVendorName?: string; // For newly detected vendor
  nature?: 'service' | 'product';
  quantity?: number;
  unitPrice?: number;
  // Order Tracking Fields
  orderStatus?: 'pending' | 'in_progress' | 'ready_for_pickup' | 'shipped' | 'completed' | 'cancelled';
  fulfillmentType?: 'in-house' | 'outsourced';
  deliveryMethod?: 'pickup' | 'delivery' | 'digital' | 'shipping';
  trackingNumber?: string;
  shippingNotes?: string;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  currency: string;
  taxRate: number;
  paymentTerms?: number; // Default payment terms in days (e.g., 30)
  invoiceNotes?: string;
  logo?: string; // base64 encoded image
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  isPinEnabled: boolean;
  pin: string | null;
}

export const expenseTypes = [
    'Operating Expenses', 
    'Cost of Goods Sold', 
    'Other Expenses', 
    'Non-Operating Expenses'
] as const;
export type ExpenseType = typeof expenseTypes[number];

export interface Category {
    id: string;
    ownerId: string;
    name: string;
    type: TransactionType;
    expenseType?: ExpenseType;
}

export interface Client {
    id:string;
    ownerId: string;
    name: string;
    email?: string;
    phone?: string;
}

export interface Vendor {
    id: string;
    ownerId: string;
    name: string;
    service?: string;
    email?: string;
    phone?: string;
}


export interface AppData {
  businesses: Business[];
  transactions: Transaction[];
  settings: AppSettings;
  categories: Category[];
  clients: Client[];
  vendors: Vendor[];
  items: Item[];
  quotations: Quotation[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

export type View = 'dashboard' | 'transactions' | 'ai' | 'more' | 'profile' | 'settings' | 'insights' | 'documents' | 'businesses' | 'orders';