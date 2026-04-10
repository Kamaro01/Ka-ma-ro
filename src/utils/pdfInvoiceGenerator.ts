import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OrderWithItems } from '@/services/orderService';

interface InvoiceConfig {
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  taxId?: string;
}

const DEFAULT_CONFIG: InvoiceConfig = {
  companyName: 'Ka-ma-ro',
  companyAddress: 'KG 123 St, Kigali',
  companyCity: 'Kigali, Rwanda',
  companyPhone: '+250 788 123 456',
  companyEmail: 'info@ka-ma-ro.com',
  companyWebsite: 'www.ka-ma-ro.com',
  taxId: 'TIN: 123456789',
};

export const generateInvoicePDF = (
  order: OrderWithItems,
  config: InvoiceConfig = DEFAULT_CONFIG
) => {
  // Create new PDF document
  const doc = new jsPDF();

  // Set font
  doc.setFont('helvetica');

  // Header - Company Info
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // Blue color
  doc.text(config.companyName, 20, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(config.companyAddress, 20, 28);
  doc.text(config.companyCity, 20, 33);
  doc.text(config.companyPhone, 20, 38);
  doc.text(config.companyEmail, 20, 43);

  if (config.taxId) {
    doc.text(config.taxId, 20, 48);
  }

  // Invoice Title
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', 150, 20);

  // Invoice Details
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Invoice #: ${order.order_number}`, 150, 28);
  doc.text(
    `Date: ${new Date(order.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })}`,
    150,
    33
  );
  doc.text(`Payment Status: PAID`, 150, 38);

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 55, 190, 55);

  // Customer Information
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Bill To:', 20, 65);

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text(order.shipping_address.name, 20, 72);
  doc.text(order.shipping_address.street, 20, 77);
  doc.text(`${order.shipping_address.city}, ${order.shipping_address.country}`, 20, 82);

  // Payment Method
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Payment Method:', 120, 65);

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  const paymentMethodName = getPaymentMethodName(order.payment_method);
  doc.text(paymentMethodName, 120, 72);
  doc.text(`Ref: ${order.transaction_ref}`, 120, 77);

  // Items Table
  const tableStartY = 95;

  const tableData =
    order.items?.map((item) => [
      item.product_name,
      item.quantity.toString(),
      `${item.unit_price.toLocaleString()} RWF`,
      `${item.total_price.toLocaleString()} RWF`,
    ]) || [];

  autoTable(doc, {
    startY: tableStartY,
    head: [['Product', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50],
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });

  // Get the final Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY || tableStartY + 50;

  // Summary Section
  const summaryStartY = finalY + 10;
  const summaryX = 130;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);

  // Subtotal
  doc.text('Subtotal:', summaryX, summaryStartY);
  doc.text(`${order.subtotal.toLocaleString()} RWF`, 180, summaryStartY, { align: 'right' });

  // Tax
  doc.text('VAT (18%):', summaryX, summaryStartY + 6);
  doc.text(`${order.tax.toLocaleString()} RWF`, 180, summaryStartY + 6, { align: 'right' });

  // Shipping
  doc.text('Shipping:', summaryX, summaryStartY + 12);
  doc.text(`${order.shipping_cost.toLocaleString()} RWF`, 180, summaryStartY + 12, {
    align: 'right',
  });

  // Total line
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(summaryX, summaryStartY + 18, 190, summaryStartY + 18);

  // Total Amount
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', summaryX, summaryStartY + 25);
  doc.text(`${order.total.toLocaleString()} RWF`, 180, summaryStartY + 25, { align: 'right' });

  // Shipping Information
  const shippingY = summaryStartY + 40;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Shipping Information:', 20, shippingY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);

  if (order.tracking_number) {
    doc.text(`Tracking Number: ${order.tracking_number}`, 20, shippingY + 7);
  }

  if (order.carrier) {
    doc.text(`Carrier: ${order.carrier}`, 20, shippingY + 13);
  }

  if (order.estimated_delivery) {
    doc.text(`Estimated Delivery: ${order.estimated_delivery}`, 20, shippingY + 19);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });
  doc.text('For support, contact us at info@ka-ma-ro.com or +250 788 123 456', 105, 285, {
    align: 'center',
  });

  // Save the PDF
  doc.save(`Invoice-${order.order_number}.pdf`);
};

const getPaymentMethodName = (method: string): string => {
  const methods: { [key: string]: string } = {
    mtn: 'MTN Mobile Money',
    airtel: 'Airtel Money',
    bk: 'Bank of Kigali',
    equity: 'Equity Bank',
    im: 'I&M Bank',
    bpr: 'BPR Bank',
    kcb: 'KCB Bank',
  };
  return methods[method] || method;
};
