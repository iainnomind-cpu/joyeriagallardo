import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Order, OrderItem, CartItem } from '../types';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return;
    }

    setOrders(data || []);
  };

  useEffect(() => {
    fetchOrders();
    setLoading(false);
  }, []);

  const createOrder = async (
    orderData: Omit<Order, 'id' | 'created_at' | 'status' | 'order_number'>,
    items: CartItem[],
    customerData?: { name: string, phone: string }
  ) => {
    const { data, error } = await supabase.functions.invoke('create-order', {
      body: {
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.cantidad
        })),
        sale_channel: 'online',
        delivery_method: orderData.delivery_method || 'pickup',
        delivery_address: orderData.delivery_address || 'Recoger en Tienda',
        notes: orderData.notes || '',
        customer_name: customerData?.name || '',
        customer_phone: customerData?.phone || '',
        customer_email: (orderData as any).email || null,
      }
    })

    if (error) throw new Error(`Error al crear pedido: ${error.message}`)
    if (data?.error) throw new Error(data.error)

    return data
  };

  const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (error) throw error;
    return data || [];
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const getBankDetails = async () => {
    const { data, error } = await supabase
      .from('business_rules')
      .select('rule_value')
      .eq('rule_key', 'bank_transfer_details')
      .single();

    if (error || !data) return null;
    return data.rule_value;
  };

  return {
    orders,
    loading,
    createOrder,
    getOrderItems,
    updateOrderStatus,
    getBankDetails,
    refetch: fetchOrders,
  };
}
