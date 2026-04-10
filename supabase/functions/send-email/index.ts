import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req) => {
  // ✅ CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*"
      }
    });
  }

  try {
    const { type, to, data } = await req.json();
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    let subject = "";
    let html = "";

    // Product Recommendations Email
    if (type === "product_recommendations") {
      subject = `${data.customerName}, Check Out These Personalized Picks! 🎁`;
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .product-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
            .product-card { border: 1px solid #ddd; padding: 15px; text-align: center; border-radius: 8px; }
            .product-image { width: 100%; height: 150px; object-fit: cover; border-radius: 4px; }
            .product-name { font-weight: bold; margin: 10px 0 5px; }
            .product-price { color: #4F46E5; font-size: 18px; font-weight: bold; }
            .cta-button { background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Personalized Just for You!</h1>
            </div>
            <p>Hi ${data.customerName},</p>
            <p>Based on your browsing history and preferences, we've handpicked these products we think you'll love:</p>
            
            <div class="product-grid">
              ${data.products.map((product: any) => `
                <div class="product-card">
                  <img src="${product.imageUrl}" alt="${product.name}" class="product-image" />
                  <div class="product-name">${product.name}</div>
                  <div class="product-price">$${product.price}</div>
                  <a href="${product.url}" class="cta-button">View Product</a>
                </div>
              `).join('')}
            </div>
            
            <p style="text-align: center;">
              <a href="${data.shopUrl}" class="cta-button">Browse More Products</a>
            </p>
            
            <div class="footer">
              <p>Thank you for shopping with Ka-ma-ro!</p>
              <p><a href="${data.unsubscribeUrl}">Unsubscribe</a> from recommendation emails</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // Abandoned Cart Recovery Email
    else if (type === "abandoned_cart") {
      subject = `You left something behind! Complete your order now 🛒`;
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
            .cart-items { margin: 20px 0; }
            .cart-item { display: flex; border-bottom: 1px solid #ddd; padding: 15px 0; }
            .item-image { width: 80px; height: 80px; object-fit: cover; margin-right: 15px; border-radius: 4px; }
            .item-details { flex: 1; }
            .item-name { font-weight: bold; margin-bottom: 5px; }
            .item-price { color: #DC2626; font-weight: bold; }
            .total-section { background: #f9fafb; padding: 15px; margin: 20px 0; text-align: right; }
            .total-price { font-size: 24px; font-weight: bold; color: #DC2626; }
            .cta-button { background: #DC2626; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; font-weight: bold; }
            .urgency { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Cart is Waiting!</h1>
            </div>
            <p>Hi ${data.customerName},</p>
            <p>We noticed you left some items in your cart. They're still available and waiting for you!</p>
            
            <div class="cart-items">
              ${data.cartItems.map((item: any) => `
                <div class="cart-item">
                  <img src="${item.imageUrl}" alt="${item.name}" class="item-image" />
                  <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div>Quantity: ${item.quantity}</div>
                    <div class="item-price">$${item.price}</div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div class="total-section">
              <div>Cart Total:</div>
              <div class="total-price">$${data.cartTotal}</div>
            </div>
            
            <div class="urgency">
              ⚠️ <strong>Hurry!</strong> Items in your cart are selling fast. Complete your purchase before they're gone!
            </div>
            
            <p style="text-align: center;">
              <a href="${data.checkoutUrl}" class="cta-button">Complete Your Order</a>
            </p>
            
            ${data.discountCode ? `
              <p style="text-align: center; background: #DCFCE7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                🎉 <strong>Special offer:</strong> Use code <strong>${data.discountCode}</strong> for ${data.discountPercent}% off your order!
              </p>
            ` : ''}
            
            <div class="footer">
              <p>Need help? <a href="${data.supportUrl}">Contact our support team</a></p>
              <p>Ka-ma-ro - Your trusted shopping partner</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // Post-Purchase Follow-up Email
    else if (type === "post_purchase") {
      subject = `Thank you for your order! Here's what's next 📦`;
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; }
            .order-info { background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .info-label { font-weight: bold; }
            .product-list { margin: 20px 0; }
            .product-item { display: flex; padding: 15px 0; border-bottom: 1px solid #e5e7eb; }
            .product-image { width: 60px; height: 60px; object-fit: cover; margin-right: 15px; border-radius: 4px; }
            .cta-button { background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 15px; }
            .tracking-section { background: #ECFDF5; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
            .next-steps { background: #F0F9FF; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Order Confirmed!</h1>
            </div>
            <p>Hi ${data.customerName},</p>
            <p>Thank you for your order! We're excited to get your items to you.</p>
            
            <div class="order-info">
              <div class="info-row">
                <span class="info-label">Order Number:</span>
                <span>${data.orderNumber}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Order Date:</span>
                <span>${data.orderDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Total Amount:</span>
                <span style="font-weight: bold; color: #059669;">$${data.totalAmount}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Estimated Delivery:</span>
                <span>${data.estimatedDelivery}</span>
              </div>
            </div>
            
            <h3>Order Items:</h3>
            <div class="product-list">
              ${data.orderItems.map((item: any) => `
                <div class="product-item">
                  <img src="${item.imageUrl}" alt="${item.name}" class="product-image" />
                  <div style="flex: 1;">
                    <div style="font-weight: bold;">${item.name}</div>
                    <div>Quantity: ${item.quantity} × $${item.price}</div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            ${data.trackingNumber ? `
              <div class="tracking-section">
                <h3>Track Your Order</h3>
                <p>Tracking Number: <strong>${data.trackingNumber}</strong></p>
                <a href="${data.trackingUrl}" class="cta-button">Track Shipment</a>
              </div>
            ` : ''}
            
            <div class="next-steps">
              <h3>What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>We'll send you a shipping confirmation when your order ships</li>
                <li>You can track your order status anytime from your account</li>
                <li>Expect delivery within ${data.deliveryDays} business days</li>
              </ul>
            </div>
            
            <p style="text-align: center;">
              <a href="${data.orderDetailsUrl}" class="cta-button">View Order Details</a>
            </p>
            
            <div style="background: #FEF3C7; padding: 15px; margin: 20px 0; border-radius: 6px;">
              <strong>Love your purchase?</strong> Leave a review and help other shoppers!
              <div style="text-align: center; margin-top: 10px;">
                <a href="${data.reviewUrl}" class="cta-button" style="background: #F59E0B;">Write a Review</a>
              </div>
            </div>
            
            <div class="footer">
              <p>Questions? <a href="${data.supportUrl}">Contact our customer service</a></p>
              <p>Thank you for shopping with Ka-ma-ro!</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // Send email via Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [to],
        subject: subject,
        html: html
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || "Failed to send email");
    }

    return new Response(JSON.stringify({
      success: true,
      messageId: responseData.id,
      message: "Email sent successfully"
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});