import nodemailer from 'nodemailer'
import { getEmailSettings } from '@/lib/db'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  totalAmount: number
  subtotal: number
  discountAmount?: number
  couponCode?: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  shippingAddress: any
  status: string
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private emailConfig: EmailConfig | null = null

  private async getStoreInfo() {
    const { getSettings } = await import('@/lib/db');
    const result = await getSettings();
    const s = result.settings || {};
    const storeName = s.store_name || process.env.STORE_NAME || 'My Store';
    const storeEmail = s.store_email || process.env.STORE_EMAIL || '';
    const address = [s.store_address, s.store_city, [s.store_state, s.store_zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
    return { storeName, storeEmail, address };
  }

  async initializeTransporter() {
    if (!this.transporter) {
      const settingsResult = await getEmailSettings();
      if (settingsResult.success && settingsResult.emailSettings && settingsResult.emailSettings.smtp_host) {
        const emailSettings = settingsResult.emailSettings;
        this.emailConfig = {
          host: emailSettings.smtp_host,
          port: emailSettings.smtp_port,
          secure: emailSettings.smtp_secure,
          auth: {
            user: emailSettings.smtp_user,
            pass: emailSettings.smtp_pass
          }
        };

        this.transporter = nodemailer.createTransport(this.emailConfig);
      } else {
        // Fallback to environment variables if database settings are not available
        this.emailConfig = {
          host: process.env.SMTP_HOST || 'smtp.resend.com',
          port: parseInt(process.env.SMTP_PORT || '465'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER || 'resend',
            pass: process.env.SMTP_PASS || ''
          }
        };

        this.transporter = nodemailer.createTransport(this.emailConfig);
      }
    }
  }

  async sendOrderConfirmation(orderData: OrderEmailData): Promise<boolean> {
    await this.initializeTransporter();

    try {
      const settingsResult = await getEmailSettings();
      const emailSettings = settingsResult.success && settingsResult.emailSettings
        ? settingsResult.emailSettings
        : null;

      // Use custom template if available, otherwise use default
      let html: string;
      if (emailSettings?.email_template_order_confirmation) {
        // Replace placeholders in the custom template
        html = emailSettings.email_template_order_confirmation
          .replace(/{customer_name}/g, orderData.customerName)
          .replace(/{order_number}/g, orderData.orderNumber)
          .replace(/{status}/g, orderData.status)
          .replace(/{subtotal}/g, orderData.subtotal.toFixed(2))
          .replace(/{total}/g, orderData.totalAmount.toFixed(2))
          .replace(/{discount_amount}/g, (orderData.discountAmount || 0).toFixed(2))
          .replace(/{coupon_code}/g, orderData.couponCode || '')
          .replace(/{items}/g, orderData.items.map(item => `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
          `).join(''))
          .replace(/{shipping_address}/g, `
            <p>
              ${orderData.shippingAddress?.address}<br>
              ${orderData.shippingAddress?.city}, ${orderData.shippingAddress?.state} ${orderData.shippingAddress?.zipCode}
            </p>
          `);
      } else {
        // Default template
        const storeInfo = await this.getStoreInfo();
        const itemsHtml = orderData.items.map(item => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
          </tr>
        `).join('');

        html = `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
              <h1>${storeInfo.storeName}</h1>
              <h2>Order Confirmation</h2>
            </div>

            <div style="padding: 20px;">
              <p>Dear ${orderData.customerName},</p>
              <p>Thank you for your order! We've received your order and it's being processed.</p>

              <div style="background: #f9fafb; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h3>Order Details</h3>
                <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
                <p><strong>Status:</strong> ${orderData.status}</p>
                <p><strong>Subtotal:</strong> $${orderData.subtotal.toFixed(2)}</p>
                ${orderData.discountAmount && orderData.discountAmount > 0 ? `<p><strong>Discount (${orderData.couponCode}):</strong> -$${orderData.discountAmount.toFixed(2)}</p>` : ''}
                <p><strong>Total:</strong> $${orderData.totalAmount.toFixed(2)}</p>
              </div>

              <h3>Items Ordered</h3>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="background: #f9fafb; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h3>Shipping Address</h3>
                <p>
                  ${orderData.shippingAddress?.address}<br>
                  ${orderData.shippingAddress?.city}, ${orderData.shippingAddress?.state} ${orderData.shippingAddress?.zipCode}
                </p>
              </div>

              <p>We'll send you another email when your order ships.</p>
              ${storeInfo.storeEmail ? `<p>If you have any questions, please contact us at ${storeInfo.storeEmail}.</p>` : ''}

              <p>Thank you for shopping with ${storeInfo.storeName}!</p>
            </div>

            <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280;">
              <p>${[storeInfo.storeName, storeInfo.address].filter(Boolean).join(' | ')}</p>
            </div>
          </div>
        `;
      }

      const fromName = emailSettings?.email_from_name || process.env.STORE_NAME || 'My Store';
      const fromEmail = emailSettings?.sender_email || process.env.EMAIL_FROM || 'onboarding@resend.dev';

      await this.transporter!.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: orderData.customerEmail,
        subject: `Order Confirmation - ${orderData.orderNumber}`,
        html
      });

      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  async sendOrderStatusUpdate(orderData: OrderEmailData, trackingNumber?: string): Promise<boolean> {
    await this.initializeTransporter();

    try {
      const settingsResult = await getEmailSettings();
      const emailSettings = settingsResult.success && settingsResult.emailSettings
        ? settingsResult.emailSettings
        : null;

      // Use custom template if available, otherwise use default
      let html: string;
      if (emailSettings?.email_template_order_status_update) {
        // Replace placeholders in the custom template
        html = emailSettings.email_template_order_status_update
          .replace(/{customer_name}/g, orderData.customerName)
          .replace(/{order_number}/g, orderData.orderNumber)
          .replace(/{status}/g, orderData.status)
          .replace(/{total}/g, orderData.totalAmount.toFixed(2))
          .replace(/{tracking_number}/g, trackingNumber || '')
          .replace(/{status_message}/g, getStatusMessage(orderData.status))
          .replace(/{status_color}/g, getStatusColor(orderData.status));
      } else {
        let statusMessage = '';
        let statusColor = '#6b7280';

        switch (orderData.status) {
          case 'processing':
            statusMessage = 'Your order is being processed and will ship soon.';
            statusColor = '#3b82f6';
            break;
          case 'shipped':
            statusMessage = 'Your order has been shipped!';
            statusColor = '#8b5cf6';
            break;
          case 'delivered':
            statusMessage = 'Your order has been delivered. Thank you for shopping with us!';
            statusColor = '#10b981';
            break;
          case 'cancelled':
            statusMessage = 'Your order has been cancelled.';
            statusColor = '#ef4444';
            break;
          default:
            statusMessage = `Your order status has been updated to: ${orderData.status}`;
        }

        const storeInfo = await this.getStoreInfo();
        html = `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
              <h1>${storeInfo.storeName}</h1>
              <h2>Order Status Update</h2>
            </div>

            <div style="padding: 20px;">
              <p>Dear ${orderData.customerName},</p>

              <div style="background: ${statusColor}; color: white; padding: 15px; margin: 20px 0; border-radius: 5px; text-align: center;">
                <h3 style="margin: 0;">${statusMessage}</h3>
              </div>

              <div style="background: #f9fafb; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h3>Order Details</h3>
                <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
                <p><strong>Status:</strong> ${orderData.status.toUpperCase()}</p>
                <p><strong>Total:</strong> ${orderData.totalAmount.toFixed(2)}</p>
                ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
              </div>

              <p>You can track your order status anytime by logging into your account on our website.</p>
              ${storeInfo.storeEmail ? `<p>If you have any questions, please contact us at ${storeInfo.storeEmail}.</p>` : ''}

              <p>Thank you for shopping with ${storeInfo.storeName}!</p>
            </div>

            <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280;">
              <p>${[storeInfo.storeName, storeInfo.address].filter(Boolean).join(' | ')}</p>
            </div>
          </div>
        `;
      }

      const fromName = emailSettings?.email_from_name || process.env.STORE_NAME || 'My Store';
      const fromEmail = emailSettings?.sender_email || process.env.EMAIL_FROM || 'onboarding@resend.dev';

      await this.transporter!.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: orderData.customerEmail,
        subject: `Order Update - ${orderData.orderNumber} - ${orderData.status.toUpperCase()}`,
        html
      });

      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  async sendNewOrderAlert(orderData: any, orderNumber: string): Promise<boolean> {
    await this.initializeTransporter();

    try {
      const settingsResult = await getEmailSettings();
      const emailSettings = settingsResult.success && settingsResult.emailSettings
        ? settingsResult.emailSettings
        : null;

      // Get store settings for admin email
      const storeInfo = await this.getStoreInfo();
      const adminEmail = storeInfo.storeEmail || process.env.STORE_EMAIL || '';

      // Use custom template if available, otherwise use default
      let html: string;
      if (emailSettings?.email_template_new_order_alert) {
        // Replace placeholders in the custom template
        const itemsHtml = orderData.items.map((item: any) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(2)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.quantity * item.price).toFixed(2)}</td>
          </tr>
        `).join('');

        html = emailSettings.email_template_new_order_alert
          .replace(/{order_number}/g, orderNumber)
          .replace(/{customer_name}/g, orderData.customer_name)
          .replace(/{customer_email}/g, orderData.customer_email)
          .replace(/{payment_method}/g, orderData.payment_method)
          .replace(/{payment_status}/g, orderData.payment_status || 'pending')
          .replace(/{subtotal}/g, orderData.subtotal.toFixed(2))
          .replace(/{total}/g, orderData.total_amount.toFixed(2))
          .replace(/{discount_amount}/g, (orderData.discount_amount || 0).toFixed(2))
          .replace(/{coupon_code}/g, orderData.coupon_code || '')
          .replace(/{items}/g, itemsHtml)
          .replace(/{shipping_address}/g, `
            <p>
              ${orderData.shipping_address?.address}<br>
              ${orderData.shipping_address?.city}, ${orderData.shipping_address?.state} ${orderData.shipping_address?.zipCode}
            </p>
          `)
          .replace(/{billing_address}/g, `
            <p>
              ${orderData.billing_address?.address}<br>
              ${orderData.billing_address?.city}, ${orderData.billing_address?.state} ${orderData.billing_address?.zipCode}
            </p>
          `);
      } else {
        const itemsHtml = orderData.items.map((item: any) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(2)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.quantity * item.price).toFixed(2)}</td>
          </tr>
        `).join('');

        html = `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
              <h1>${storeInfo.storeName}</h1>
              <h2>New Order Alert</h2>
            </div>

            <div style="padding: 20px;">
              <p>Admin,</p>
              <p>You have received a new order. Please review and process it accordingly.</p>

              <div style="background: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h3>Order Details</h3>
                <p><strong>Order Number:</strong> ${orderNumber}</p>
                <p><strong>Customer Name:</strong> ${orderData.customer_name}</p>
                <p><strong>Customer Email:</strong> ${orderData.customer_email}</p>
                <p><strong>Payment Method:</strong> ${orderData.payment_method}</p>
                <p><strong>Payment Status:</strong> ${orderData.payment_status || 'pending'}</p>
                <p><strong>Subtotal:</strong> ${orderData.subtotal.toFixed(2)}</p>
                ${orderData.discount_amount && orderData.discount_amount > 0 ? `<p><strong>Discount (${orderData.coupon_code}):</strong> -${orderData.discount_amount.toFixed(2)}</p>` : ''}
                <p><strong>Total:</strong> ${orderData.total_amount.toFixed(2)}</p>
              </div>

              <h3>Items Ordered</h3>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <h3>Shipping Address</h3>
              <p>
                ${orderData.shipping_address?.address}<br>
                ${orderData.shipping_address?.city}, ${orderData.shipping_address?.state} ${orderData.shipping_address?.zipCode}
              </p>

              <h3>Billing Address</h3>
              <p>
                ${orderData.billing_address?.address}<br>
                ${orderData.billing_address?.city}, ${orderData.billing_address?.state} ${orderData.billing_address?.zipCode}
              </p>

              <p>This is an automated message. Please log into your admin panel to manage this order.</p>
            </div>

            <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280;">
              <p>${[storeInfo.storeName, storeInfo.address].filter(Boolean).join(' | ')}</p>
            </div>
          </div>
        `;
      }

      const fromName = emailSettings?.email_from_name || process.env.STORE_NAME || 'My Store';
      const fromEmail = emailSettings?.sender_email || process.env.EMAIL_FROM || 'onboarding@resend.dev';

      await this.transporter!.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: adminEmail,
        subject: `New Order Alert - ${orderNumber}`,
        html
      });

      return true;
    } catch (error) {
      console.error('Admin alert email send error:', error);
      return false;
    }
  }

  async sendShippingNotification(orderData: any, trackingNumber: string): Promise<boolean> {
    await this.initializeTransporter();

    try {
      const settingsResult = await getEmailSettings();
      const emailSettings = settingsResult.success && settingsResult.emailSettings
        ? settingsResult.emailSettings
        : null;

      // Use custom template if available, otherwise use default
      let html: string;
      if (emailSettings?.email_template_shipping_notification) {
        // Replace placeholders in the custom template
        html = emailSettings.email_template_shipping_notification
          .replace(/{customer_name}/g, orderData.customer_name)
          .replace(/{order_number}/g, orderData.order_number)
          .replace(/{tracking_number}/g, trackingNumber)
          .replace(/{carrier_name}/g, orderData.carrier_name || orderData.shipping_carrier_id || 'Standard Shipping')
          .replace(/{estimated_delivery}/g, orderData.estimated_delivery || orderData.estimated_delivery_date || '5-7 business days');
      } else {
        const storeInfo = await this.getStoreInfo();
        html = `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
              <h1>${storeInfo.storeName}</h1>
              <h2>Your Order Has Shipped!</h2>
            </div>

            <div style="padding: 20px;">
              <p>Dear ${orderData.customer_name},</p>
              <p>Great news! Your order has been shipped and is on its way to you.</p>

              <div style="background: #8b5cf6; color: white; padding: 15px; margin: 20px 0; border-radius: 5px; text-align: center;">
                <h3 style="margin: 0;">Your order is on the way!</h3>
              </div>

              <div style="background: #f9fafb; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h3>Shipping Details</h3>
                <p><strong>Order Number:</strong> ${orderData.order_number}</p>
                <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
                <p><strong>Carrier:</strong> ${orderData.carrier_name || 'UPS'}</p>
                <p><strong>Estimated Delivery:</strong> ${orderData.estimated_delivery || orderData.estimated_delivery_date || '5-7 business days'}</p>
              </div>

              <p>You can track your package using the tracking number provided above.</p>
              ${storeInfo.storeEmail ? `<p>If you have any questions, please contact us at ${storeInfo.storeEmail}.</p>` : ''}

              <p>Thank you for shopping with ${storeInfo.storeName}!</p>
            </div>

            <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280;">
              <p>${[storeInfo.storeName, storeInfo.address].filter(Boolean).join(' | ')}</p>
            </div>
          </div>
        `;
      }

      const fromName = emailSettings?.email_from_name || process.env.STORE_NAME || 'My Store';
      const fromEmail = emailSettings?.sender_email || process.env.EMAIL_FROM || 'onboarding@resend.dev';

      await this.transporter!.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: orderData.customer_email,
        subject: `Your Order Has Shipped - ${orderData.order_number}`,
        html
      });

      return true;
    } catch (error) {
      console.error('Shipping notification email send error:', error);
      return false;
    }
  }

  async sendContactMessageNotification(contactMessage: any): Promise<boolean> {
    await this.initializeTransporter();

    try {
      const settingsResult = await getEmailSettings();
      const emailSettings = settingsResult.success && settingsResult.emailSettings
        ? settingsResult.emailSettings
        : null;

      // Get store settings for admin email
      const storeInfo = await this.getStoreInfo();
      const adminEmail = storeInfo.storeEmail || process.env.STORE_EMAIL || '';

      // Use custom template if available, otherwise use default
      let html: string;
      if (emailSettings?.email_template_contact_notification) {
        // Replace placeholders in the custom template
        html = emailSettings.email_template_contact_notification
          .replace(/{first_name}/g, contactMessage.first_name)
          .replace(/{last_name}/g, contactMessage.last_name)
          .replace(/{full_name}/g, `${contactMessage.first_name} ${contactMessage.last_name}`)
          .replace(/{email}/g, contactMessage.email)
          .replace(/{subject}/g, contactMessage.subject)
          .replace(/{message}/g, contactMessage.message);
      } else {
        html = `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
              <h1>${storeInfo.storeName}</h1>
              <h2>New Contact Message</h2>
            </div>

            <div style="padding: 20px;">
              <p>Admin,</p>
              <p>You have received a new message through the contact form. Please review and respond as needed.</p>

              <div style="background: #f9fafb; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h3>Message Details</h3>
                <p><strong>Name:</strong> ${contactMessage.first_name} ${contactMessage.last_name}</p>
                <p><strong>Email:</strong> ${contactMessage.email}</p>
                <p><strong>Subject:</strong> ${contactMessage.subject}</p>
                <p><strong>Message:</strong></p>
                <p style="font-style: italic; padding: 10px; background: white; border-radius: 3px;">${contactMessage.message}</p>
              </div>

              <p>This is an automated message. Please visit your admin panel to view and manage all contact messages.</p>
            </div>

            <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280;">
              <p>${[storeInfo.storeName, storeInfo.address].filter(Boolean).join(' | ')}</p>
            </div>
          </div>
        `;
      }

      const fromName = emailSettings?.email_from_name || process.env.STORE_NAME || 'My Store';
      const fromEmail = emailSettings?.sender_email || process.env.EMAIL_FROM || 'onboarding@resend.dev';

      await this.transporter!.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: adminEmail,
        subject: `New Contact Message - ${contactMessage.subject}`,
        html
      });

      return true;
    } catch (error) {
      console.error('Contact message notification email send error:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(toEmail: string, resetLink: string): Promise<boolean> {
    await this.initializeTransporter();
    try {
      const settingsResult = await getEmailSettings();
      const emailSettings = settingsResult.success && settingsResult.emailSettings ? settingsResult.emailSettings : null;
      const storeInfo = await this.getStoreInfo();
      const storeName = storeInfo.storeName;
      const fromName = emailSettings?.email_from_name || process.env.STORE_NAME || 'My Store';
      const fromEmail = emailSettings?.sender_email || process.env.EMAIL_FROM || 'onboarding@resend.dev';
      let html: string;
      if (emailSettings?.email_template_password_reset) {
        html = emailSettings.email_template_password_reset
          .replace(/{reset_link}/g, resetLink)
          .replace(/{store_name}/g, storeName);
      } else {
        html = `
          <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
            <div style="background:#1f2937;color:#fff;padding:16px;text-align:center;">
              <h2>Password Reset</h2>
            </div>
            <div style="padding:16px;">
              <p>You requested to reset your password for ${storeName}. Click the button below to set a new password.</p>
              <p style="text-align:center;margin:24px 0;">
                <a href="${resetLink}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">Reset Password</a>
              </p>
              <p>If you did not request this, please ignore this email.</p>
            </div>
            <div style="background:#f3f4f6;padding:16px;text-align:center;color:#6b7280;">
              <p>${storeName}</p>
            </div>
          </div>
        `;
      }
      await this.transporter!.sendMail({ from: `"${fromName}" <${fromEmail}>`, to: toEmail, subject: 'Reset your password', html });
      return true;
    } catch (error) {
      console.error('Password reset email error:', error);
      return false;
    }
  }

  async sendEmailVerificationEmail(toEmail: string, verifyLink: string): Promise<boolean> {
    await this.initializeTransporter();
    try {
      const settingsResult = await getEmailSettings();
      const emailSettings = settingsResult.success && settingsResult.emailSettings ? settingsResult.emailSettings : null;
      const storeInfo = await this.getStoreInfo();
      const storeName = storeInfo.storeName;
      const fromName = emailSettings?.email_from_name || process.env.STORE_NAME || 'My Store';
      const fromEmail = emailSettings?.sender_email || process.env.EMAIL_FROM || 'onboarding@resend.dev';
      let html: string;
      if (emailSettings?.email_template_email_verification) {
        html = emailSettings.email_template_email_verification
          .replace(/{verify_link}/g, verifyLink)
          .replace(/{store_name}/g, storeName);
      } else {
        html = `
          <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
            <div style="background:#1f2937;color:#fff;padding:16px;text-align:center;">
              <h2>Verify Your Email</h2>
            </div>
            <div style="padding:16px;">
              <p>Welcome to ${storeName}! Please verify your email address to activate your account.</p>
              <p style="text-align:center;margin:24px 0;">
                <a href="${verifyLink}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">Verify Email</a>
              </p>
              <p>If you did not create an account, please ignore this email.</p>
            </div>
            <div style="background:#f3f4f6;padding:16px;text-align:center;color:#6b7280;">
              <p>${storeName}</p>
            </div>
          </div>
        `;
      }
      await this.transporter!.sendMail({ from: `"${fromName}" <${fromEmail}>`, to: toEmail, subject: 'Verify your email', html });
      return true;
    } catch (error) {
      console.error('Email verification send error:', error);
      return false;
    }
  }
}

// Helper functions for status messages and colors
function getStatusMessage(status: string): string {
  switch (status) {
    case 'processing':
      return 'Your order is being processed and will ship soon.';
    case 'shipped':
      return 'Your order has been shipped!';
    case 'delivered':
      return 'Your order has been delivered. Thank you for shopping with us!';
    case 'cancelled':
      return 'Your order has been cancelled.';
    default:
      return `Your order status has been updated to: ${status}`;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'processing':
      return '#3b82f6';
    case 'shipped':
      return '#8b5cf6';
    case 'delivered':
      return '#10b981';
    case 'cancelled':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

// Create a singleton instance
const emailService = new EmailService();
export { emailService };
