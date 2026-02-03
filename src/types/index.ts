export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  codigo: string;
  precio: number;
  categoria_id: string;
  imagen_url: string;
  descripcion: string;
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
  nombre: string;
  telefono: string;
  tipo_entrega: 'recoger' | 'envio';
  calle: string;
  numero_exterior: string;
  numero_interior: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  referencias: string;
  total: number;
  status: 'pendiente' | 'completado' | 'cancelado';
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  codigo: string;
  precio: number;
  cantidad: number;
  categoria: string;
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
