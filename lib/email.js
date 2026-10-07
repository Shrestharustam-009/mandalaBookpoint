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
