import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface OrderEmailData {
  orderId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { orderId }: OrderEmailData = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'Order ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError) {
      // Item fetch error handling
    }

    const itemsList = items || [];
    const itemsText = itemsList
      .map(item => `${item.codigo} - $${item.precio} x ${item.cantidad} = $${item.precio * item.cantidad}`)
      .join('\n');

    const deliveryInfo = order.tipo_entrega === 'envio'
      ? `Dirección de envío:\n${order.calle} ${order.numero_exterior}${order.numero_interior ? ' Int. ' + order.numero_interior : ''}\n${order.colonia}, ${order.ciudad}, ${order.estado}\nCP: ${order.codigo_postal}${order.referencias ? '\nReferencias: ' + order.referencias : ''}`
      : 'El cliente recogerá en tienda';

    const emailBody = `
Nuevo Pedido Recibido - Perlas AC
================================

Pedido ID: ${orderId}
Fecha: ${new Date(order.created_at).toLocaleString('es-MX')}

Cliente:
--------
Nombre: ${order.nombre}
Teléfono: ${order.telefono}

Productos:
----------
${itemsText}

Total: $${order.total}

Entrega:
--------
${deliveryInfo}

Estado: ${order.status}
    `;

    console.log('Order email prepared:', emailBody);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email notification logged',
        orderId: orderId,
        emailPreview: emailBody,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing order email:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});