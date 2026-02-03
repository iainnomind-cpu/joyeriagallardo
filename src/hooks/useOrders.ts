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
    orderData: Omit<Order, 'id' | 'created_at' | 'status'>,
    items: CartItem[]
  ) => {
    const orderToInsert = {
      ...orderData,
      status: 'pendiente' as const
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderToInsert])
      .select()
      .single();

    if (orderError) {
      throw new Error(`Error al crear pedido: ${orderError.message}`);
    }

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      codigo: item.codigo,
      precio: item.precio,
      cantidad: item.cantidad,
      categoria: item.categoria_name,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      throw new Error(`Error al guardar productos: ${itemsError.message}`);
    }

    try {
      await supabase.functions.invoke('send-order-email', {
        body: { orderId: order.id },
      });
    } catch (emailError) {
      // Email sending is not critical, continue anyway
    }

    return order;
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

  return {
    orders,
    loading,
    createOrder,
    getOrderItems,
    updateOrderStatus,
    refetch: fetchOrders,
  };
}
