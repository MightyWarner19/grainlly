import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const generateInvoiceHTML = (order, userEmail, userName, address, products) => {
  const itemsHTML = products.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.total.toFixed(2)}</td>
    </tr>
  `).join('');

  const subtotal = order.amount / 1.02; // Removing 2% tax
  const tax = order.amount - subtotal;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Invoice</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #889767 0%, #6b7a52 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px;">Grainlly</h1>
        <p style="color: #f0f0f0; margin: 5px 0 0 0;">Order Confirmation & Invoice</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #889767; margin-top: 0;">Hello ${userName}!</h2>
          <p style="font-size: 16px; margin: 15px 0;">Thank you for your order. Your order has been successfully placed and is being processed.</p>
          
          <div style="background: #f5f7f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order._id}</p>
            <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p style="margin: 5px 0;"><strong>Payment Status:</strong> <span style="color: ${order.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b'};">${order.paymentStatus}</span></p>
          </div>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #889767; margin-top: 0;">Delivery Address</h3>
          <p style="margin: 5px 0;"><strong>${address.fullName}</strong></p>
          <p style="margin: 5px 0;">${address.area}</p>
          <p style="margin: 5px 0;">${address.city}, ${address.state} - ${address.pincode}</p>
          <p style="margin: 5px 0;">Phone: ${address.phoneNumber}</p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #889767; margin-top: 0;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f7f0;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #889767;">Product</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #889767;">Quantity</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #889767;">Price</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #889767;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px;">
          <table style="width: 100%; max-width: 300px; margin-left: auto;">
            <tr>
              <td style="padding: 8px 0;"><strong>Subtotal:</strong></td>
              <td style="padding: 8px 0; text-align: right;">₹${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Tax (2%):</strong></td>
              <td style="padding: 8px 0; text-align: right;">₹${tax.toFixed(2)}</td>
            </tr>
            <tr style="border-top: 2px solid #889767;">
              <td style="padding: 12px 0; font-size: 18px;"><strong>Total Amount:</strong></td>
              <td style="padding: 12px 0; text-align: right; font-size: 18px; color: #889767;"><strong>₹${Number(order.amount).toFixed(2)}</strong></td>
            </tr>
          </table>
        </div>

        ${order.paymentMethod === 'COD' ? `
          <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; color: #856404;"><strong>⚠️ Cash On Delivery:</strong> Please keep ₹${Number(order.amount).toFixed(2)} ready at the time of delivery.</p>
          </div>
        ` : ''}

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
          <p>If you have any questions, please contact us at support@grainlly.com</p>
          <p style="margin: 10px 0 0 0; font-size: 14px;">© ${new Date().getFullYear()} Grainlly. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const sendOrderConfirmationEmail = async (userEmail, userName, order, address, products) => {
  try {
    const invoiceHTML = generateInvoiceHTML(order, userEmail, userName, address, products);

    const mailOptions = {
      from: `"Grainlly" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Order Confirmation - Order #${order._id}`,
      html: invoiceHTML,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

export const sendAdminOrderNotification = async (userEmail, userName, order, address, products) => {
  try {
    const invoiceHTML = generateInvoiceHTML(order, userEmail, userName, address, products);

    const mailOptions = {
      from: `"Grainlly" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to admin email
      subject: `New Order Received - Order #${order._id}`,
      html: invoiceHTML,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Admin notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return { success: false, error: error.message };
  }
};
