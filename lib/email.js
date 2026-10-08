import nodemailer from 'nodemailer';

export const sendOrderQuoteEmail = async (order, customShippingCost) => {
  try {
    // If SMTP is not fully configured, log and return to prevent crashing
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials not fully configured in .env. Email was NOT sent, but order was updated.');
      console.warn('--- MOCK EMAIL ---');
      console.warn(`To: ${order.customerEmail}`);
      console.warn(`Subject: Shipping Quote for Order #${order.id}`);
      console.warn(`Total Shipping: NPR ${customShippingCost}`);
      console.warn('------------------');
      return true; // Pretend it succeeded
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subtotal = order.totalAmount; 
    const grandTotal = parseFloat(subtotal) + parseFloat(customShippingCost);
    const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment?orderId=${order.id}`;

    const mailOptions = {
      from: `"Mandala Book Point" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: order.customerEmail,
      subject: `Your Shipping Quote is Ready - Order #${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #2563eb;">Mandala Book Point</h2>
          <p>Dear ${order.customerName},</p>
          <p>Thank you for your patience. We have calculated the shipping cost for your recent order (<strong>#${order.id}</strong>) to your location.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Subtotal (Books):</strong> NPR ${parseFloat(subtotal).toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Shipping Cost:</strong> NPR ${parseFloat(customShippingCost).toFixed(2)}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
            <p style="margin: 5px 0; font-size: 18px;"><strong>New Grand Total:</strong> NPR ${grandTotal.toFixed(2)}</p>
          </div>

          <p>If you would like to proceed with your order, please click the secure link below to complete your payment via Paco:</p>
          
          <a href="${paymentLink}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">
            Complete Payment
          </a>

          <p>If you have any questions or decide to cancel, please reply to this email.</p>
          <br/>
          <p>Warm regards,<br/>The Mandala Book Point Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Quote email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending quote email:', error);
    return false;
  }
};


export const sendOrderReceivedEmail = async (order) => {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('Mock Email: Order Received (Pending Quote) to', order.customerEmail);
      return true;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const mailOptions = {
      from: `"Mandala Book Point" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: order.customerEmail,
      subject: `Order Received! (Action Pending) - Order #${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #2563eb;">Mandala Book Point</h2>
          <p>Dear ${order.customerName},</p>
          <p>Thank you for shopping with us! We have successfully received your order (<strong>#${order.id}</strong>).</p>
          <p>Because your delivery location requires a custom shipping calculation, our team is currently reviewing your order to find the best shipping rate.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Current Subtotal (Books only):</strong> NPR ${parseFloat(order.totalAmount).toFixed(2)}</p>
            <p style="margin: 5px 0; color: #d97706;"><em>* Shipping cost is currently being calculated.</em></p>
          </div>

          <p><strong>What happens next?</strong></p>
          <p>You will receive a second email from us shortly with your final Grand Total and a secure payment link to complete your purchase.</p>
          
          <br/>
          <p>Warm regards,<br/>The Mandala Book Point Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending order received email:', error);
    return false;
  }
};

export const sendOrderPaidEmail = async (order) => {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('Mock Email: Order Paid to', order.customerEmail);
      return true;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const itemsHtml = Array.isArray(order.orderItems) ? order.orderItems.map(item => 
      `<tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.title || 'Book'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity || 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">NPR ${(item.price * (item.quantity || 1)).toFixed(2)}</td>
      </tr>`
    ).join('') : '';

    const mailOptions = {
      from: `"Mandala Book Point" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: order.customerEmail,
      subject: `Payment Confirmation & Invoice - Order #${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #059669;">Payment Successful!</h2>
          <p>Dear ${order.customerName},</p>
          <p>Thank you for your payment. This email confirms that your order (<strong>#${order.id}</strong>) has been fully paid and is now being processed for shipping.</p>
          
          <h3 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 30px;">Order Details</h3>
          <p><strong>Delivery Address:</strong><br/>${order.shippingAddress}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f8fafc;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e2e8f0;">Item</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e2e8f0;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e2e8f0;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="text-align: right; font-size: 18px; margin-top: 20px;">
            <strong>Grand Total: NPR ${parseFloat(order.totalAmount).toFixed(2)}</strong>
          </div>

          <p style="margin-top: 30px;">We will notify you once your order has been shipped.</p>
          <p>Warm regards,<br/>The Mandala Book Point Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending paid email:', error);
    return false;
  }
};
