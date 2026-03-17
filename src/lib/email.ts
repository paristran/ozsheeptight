import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderConfirmation({
  email,
  name,
  orderId,
  total,
  items,
  shippingAddress,
}: {
  email: string
  name: string
  orderId: string
  total: number
  items: { title: string; quantity: number; price: number }[]
  shippingAddress: any
}) {
  const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(n)

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px;">${item.title}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
      </tr>`
    )
    .join('')

  const addressHtml = shippingAddress
    ? `<p style="color: #64748b; font-size: 14px; margin: 8px 0 0;">
        ${shippingAddress.name || name}<br/>
        ${shippingAddress.line1}<br/>
        ${shippingAddress.line2 ? shippingAddress.line2 + '<br/>' : ''}
        ${shippingAddress.city} ${shippingAddress.state} ${shippingAddress.postal_code}
      </p>`
    : ''

  const { data, error } = await resend.emails.send({
    from: 'OzSheepTight <orders@ozsheeptight.com>',
    to: [email],
    subject: `Order Confirmed! 🐑 Thank you for your purchase`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #60a5fa, #a78bfa); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🐑 OzSheepTight</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">Order Confirmation</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px;">
          <p style="color: #1e293b; font-size: 16px; margin: 0 0 16px;">Hi ${name},</p>
          <p style="color: #64748b; font-size: 14px; margin: 0 0 24px;">Thank you for your order! We'll let you know when it ships.</p>

          <!-- Order ID -->
          <div style="background: #f0f9ff; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; color: #0369a1; font-size: 13px; font-weight: 600;">ORDER ID</p>
            <p style="margin: 4px 0 0; color: #0c4a6e; font-size: 18px; font-weight: 700; font-family: monospace;">${orderId}</p>
          </div>

          <!-- Items -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 8px 0; color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Product</th>
                <th style="text-align: center; padding: 8px 0; color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Qty</th>
                <th style="text-align: right; padding: 8px 0; color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 16px 0; font-size: 16px; font-weight: 700; color: #1e293b;">Total</td>
                <td style="padding: 16px 0; font-size: 16px; font-weight: 700; color: #1e293b; text-align: right;">${formatPrice(total)}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Shipping Address -->
          ${addressHtml ? `
          <div style="margin-bottom: 24px;">
            <p style="color: #1e293b; font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 0 0 4px;">Shipping To</p>
            ${addressHtml}
          </div>` : ''}

          <!-- Footer -->
          <div style="text-align: center; padding-top: 24px; border-top: 1px solid #f1f5f9;">
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">Need help? Reply to this email or contact us at support@ozsheeptight.com</p>
            <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0;">© 2025 OzSheepTight. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
  })

  if (error) {
    console.error('Resend error:', error)
    return false
  }

  console.log('Email sent:', data?.id)
  return true
}
