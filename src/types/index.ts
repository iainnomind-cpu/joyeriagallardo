export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string; // Was codigo
  retail_price: number; // Was precio
  category_id: string; // Was categoria_id. ERP uses 'category' column, we will alias it in the hook or rename here. 
  // Let's use 'category_id' here and map it in the SQL query for clarity, or stick to ERP 'category'. 
  // ERP 'category' is the column name. Let's use 'category_id' in frontend for clarity if mapped, OR just 'category'.
  // Looking at ERP types: "category: string | null".
  // Let's use "category_id" to match the frontend expectation of an ID, but we will map it from "category" column.
  image_url: string | null; // Was imagen_url
  name: string; // Was descripcion
  description: string | null;
  short_description: string | null;
  detailed_description: string | null;
  images: any; // JSONB for gallery
  total_stock: number;
  is_published_online: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductWithCategory extends Product {
  categoria_name: string;
}

export interface CartItem extends Product {
  cantidad: number;
  categoria_name: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  sale_channel: 'online' | 'pos' | 'remote';

  // Contact info (ERP might store this in customer link or specific columns, assuming ERP has these or we put in notes/address)
  // ERP 'orders' table usually has delivery_address, delivery_method.
  // We'll put name/phone in notes or check if ERP has column. 
  // Based on error "calle column not found", almost certainly it's simplified.
  // Let's assume we store name/phone in 'delivery_address' string if no specific columns, OR creates a customer.
  // BUT `useOrders` is for guest checkout mostly?
  // Let's check ERP insert in SalesModule: "customer_id: ...".
  // If guest, maybe we need to create customer first? Or just put in notes?
  // Let's stick to what we saw in internal-ERP: delivery_address string.

  delivery_method: 'pickup' | 'shipping';
  delivery_address: string | null;
  notes: string | null;

  total: number;
  status: 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'ready_for_pickup' | 'completed' | 'cancelled';
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  sku: string; // Was codigo
  unit_price: number; // Was precio
  quantity: number; // Was cantidad
  subtotal: number;
}

export interface OrderFormData {
  nombre: string;
  telefono: string;
  tipoEntrega: 'recoger' | 'envio';
  calle: string;
  numeroExterior: string;
  numeroInterior: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  referencias: string;
}
