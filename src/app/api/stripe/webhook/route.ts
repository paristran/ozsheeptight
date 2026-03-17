import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { sendOrderConfirmation } from '@/lib/email'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  })

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const supabase = await createClient()

    const { data: lineItems } = await stripe.checkout.sessions.listLineItems(session.id)
    const shippingAddr = session.shipping_details?.address
      ? {
          line1: session.shipping_details.address.line1,
          line2: session.shipping_details.address.line2,
          city: session.shipping_details.address.city,
          state: session.shipping_details.address.state,
          postal_code: session.shipping_details.address.postal_code,
          country: session.shipping_details.address.country,
          name: session.shipping_details.name,
        }
      : (session.customer_details?.address
        ? {
            line1: session.customer_details.address.line1,
            line2: session.customer_details.address.line2,
            city: session.customer_details.address.city,
            state: session.customer_details.address.state,
            postal_code: session.customer_details.address.postal_code,
            country: session.customer_details.address.country,
            name: session.customer_details.name,
          }
        : null)

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_email: session.customer_email || session.metadata?.customer_email || '',
        customer_name: session.metadata?.customer_name || '',
        customer_phone: session.metadata?.customer_phone || '',
        total: (session.amount_total || 0) / 100,
        status: 'pending',
        shipping_address: shippingAddr,
      })
      .select('id')
      .single() as any

    if (order && lineItems) {
      const orderItems = lineItems.map((item: any) => ({
        order_id: order.id,
        product_id: item.price_data?.product_data?.metadata?.product_id || null,
        quantity: item.quantity,
        price: (item.amount_total || 0) / (item.quantity || 1) / 100,
      }))

      await supabase.from('order_items').insert(orderItems)
    }

    if (orderError) {
      console.error('Order creation error:', orderError)
    }

    // Send order confirmation email
    if (order && !orderError && process.env.RESEND_API_KEY) {
      const customerEmail = session.customer_email || session.metadata?.customer_email
      const customerName = session.metadata?.customer_name || session.customer_details?.name || 'Customer'

      if (customerEmail) {
        const emailItems = (lineItems || []).map((item: any) => ({
          title: item.description || 'Product',
          quantity: item.quantity || 1,
          price: (item.amount_total || 0) / (item.quantity || 1) / 100,
        }))

        await sendOrderConfirmation({
          email: customerEmail,
          name: customerName,
          orderId: order.id,
          total: (session.amount_total || 0) / 100,
          items: emailItems,
          shippingAddress: shippingAddr,
        }).catch((err) => console.error('Failed to send confirmation email:', err))
      }
    }
  }

  return NextResponse.json({ received: true })
}
