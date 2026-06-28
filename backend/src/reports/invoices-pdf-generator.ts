import PDFDocument = require('pdfkit');

export type InvoiceData = {
  invoiceNumber: string;
  issueDate: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  photographerName: string;
  photographerEmail: string;
  photographerPhone: string;
  eventDate: string;
  eventTime: string;
  eventType: string;
  location: string;
  packageName: string;
  packagePriceLkr: number;
  payments: Array<{
    date: string;
    method: string;
    amountLkr: number;
    transactionId: string;
  }>;
  totalPaidLkr: number;
  balanceDueLkr: number;
  taxRate: number;
  taxAmountLkr: number;
  grandTotalLkr: number;
  // Customizations
  settings: {
    invoiceTitle?: string;
    invoiceColor?: string;
    invoiceNotes?: string;
    invoiceLogoText?: string;
    invoicePhone?: string;
    invoiceInstructions?: string;
  };
};

export function generateInvoicePdf(data: InvoiceData): any {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    bufferPages: true,
  });

  const settings = data.settings || {};
  const primaryColor = settings.invoiceColor || '#2563eb'; // Default theme color
  const darkTextColor = '#18181b'; // zinc-900
  const textColor = '#3f3f46'; // zinc-600
  const lightBg = '#f4f4f5'; // zinc-100
  const borderColor = '#e4e4e7'; // zinc-200

  // 1. Header branding
  const logoText = settings.invoiceLogoText || data.photographerName;
  doc.fillColor(primaryColor)
    .fontSize(20)
    .font('Helvetica-Bold')
    .text(logoText, 50, 50);

  const phoneText = settings.invoicePhone || data.photographerPhone || '';
  doc.fillColor(textColor)
    .fontSize(9)
    .font('Helvetica')
    .text(data.photographerEmail, 50, 72)
    .text(phoneText, 50, 84);

  // Invoice Title Right Aligned
  const invTitle = settings.invoiceTitle || 'INVOICE';
  doc.fillColor(darkTextColor)
    .fontSize(24)
    .font('Helvetica-Bold')
    .text(invTitle.toUpperCase(), 350, 50, { align: 'right', width: 195 });

  doc.fillColor(textColor)
    .fontSize(9)
    .font('Helvetica')
    .text(`Invoice No: ${data.invoiceNumber}`, 350, 78, { align: 'right', width: 195 })
    .text(`Date Issued: ${data.issueDate}`, 350, 90, { align: 'right', width: 195 });

  doc.moveTo(50, 110)
    .lineTo(545, 110)
    .strokeColor(borderColor)
    .lineWidth(1)
    .stroke();

  // 2. Billing & Project Details
  doc.fillColor(darkTextColor)
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('Billed To:', 50, 125)
    .text('Event Summary:', 300, 125);

  doc.fillColor(textColor)
    .fontSize(9)
    .font('Helvetica')
    .text(data.clientName, 50, 140)
    .text(data.clientEmail, 50, 150)
    .text(data.clientPhone, 50, 160);

  doc.fillColor(textColor)
    .fontSize(9)
    .font('Helvetica')
    .text(`Date: ${data.eventDate}`, 300, 140)
    .text(`Time: ${data.eventTime}`, 300, 150)
    .text(`Type: ${data.eventType}`, 300, 160)
    .text(`Venue: ${data.location}`, 300, 170, { width: 245 });

  doc.moveTo(50, 195)
    .lineTo(545, 195)
    .strokeColor(borderColor)
    .lineWidth(1)
    .stroke();

  // 3. Line Items Table
  let y = 210;
  doc.rect(50, y, 495, 20).fill(primaryColor);
  doc.fillColor('#ffffff')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('Description / Service Item', 60, y + 6)
    .text('Amount (LKR)', 430, y + 6, { align: 'right', width: 100 });

  y += 20;
  // Package Row
  doc.rect(50, y, 495, 22).fillAndStroke('#ffffff', borderColor);
  doc.fillColor(darkTextColor)
    .fontSize(9)
    .font('Helvetica')
    .text(`${data.packageName} (Photography Package)`, 60, y + 7)
    .text(`${data.packagePriceLkr.toLocaleString()}`, 430, y + 7, { align: 'right', width: 100 });

  y += 22;

  // Tax Row (if tax > 0)
  if (data.taxRate > 0) {
    doc.rect(50, y, 495, 22).fillAndStroke('#ffffff', borderColor);
    doc.fillColor(textColor)
      .fontSize(9)
      .font('Helvetica')
      .text(`Taxes & VAT (${data.taxRate}%)`, 60, y + 7);
    doc.fillColor(darkTextColor)
      .text(`${data.taxAmountLkr.toLocaleString()}`, 430, y + 7, { align: 'right', width: 100 });
    y += 22;
  }

  // Payments History List
  doc.fillColor(darkTextColor)
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('Payment Transactions History:', 50, y + 15);

  y += 30;
  doc.rect(50, y, 495, 18).fill(lightBg);
  doc.fillColor(textColor)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('Txn Date', 60, y + 5)
    .text('Method', 140, y + 5)
    .text('Transaction ID', 240, y + 5)
    .text('Paid Amount (LKR)', 430, y + 5, { align: 'right', width: 100 });

  y += 18;
  data.payments.forEach((pay) => {
    doc.rect(50, y, 495, 18).fillAndStroke('#ffffff', borderColor);
    doc.fillColor(textColor)
      .fontSize(8)
      .font('Helvetica')
      .text(pay.date, 60, y + 5)
      .text(pay.method, 140, y + 5)
      .text(pay.transactionId, 240, y + 5)
      .text(`${pay.amountLkr.toLocaleString()}`, 430, y + 5, { align: 'right', width: 100 });
    y += 18;
  });

  if (data.payments.length === 0) {
    doc.rect(50, y, 495, 18).fillAndStroke('#ffffff', borderColor);
    doc.fillColor(textColor)
      .fontSize(8)
      .font('Helvetica-Oblique')
      .text('No payment history recorded.', 60, y + 5);
    y += 18;
  }

  // 4. Summaries Right Side
  y += 12;
  doc.fillColor(textColor)
    .fontSize(8.5)
    .font('Helvetica')
    .text('Subtotal:', 300, y, { align: 'right', width: 130 })
    .text(`${data.packagePriceLkr.toLocaleString()} LKR`, 430, y, { align: 'right', width: 100 });

  if (data.taxRate > 0) {
    y += 14;
    doc.text(`VAT/Tax (${data.taxRate}%):`, 300, y, { align: 'right', width: 130 })
      .text(`${data.taxAmountLkr.toLocaleString()} LKR`, 430, y, { align: 'right', width: 100 });
  }

  y += 14;
  doc.text('Total Amount Settled:', 300, y, { align: 'right', width: 130 })
    .text(`${data.totalPaidLkr.toLocaleString()} LKR`, 430, y, { align: 'right', width: 100 });

  y += 14;
  doc.moveTo(350, y)
    .lineTo(545, y)
    .strokeColor(borderColor)
    .stroke();

  y += 5;
  doc.fillColor(darkTextColor)
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('Balance Due (LKR):', 300, y, { align: 'right', width: 130 })
    .text(`${data.balanceDueLkr.toLocaleString()}`, 430, y, { align: 'right', width: 100 });

  // 5. Special Instructions & Next Steps
  if (settings.invoiceInstructions) {
    y += 35;
    doc.fillColor(darkTextColor)
      .fontSize(9.5)
      .font('Helvetica-Bold')
      .text('Fulfillment Instructions & Next Steps:', 50, y);
    y += 12;
    doc.fillColor(textColor)
      .fontSize(8)
      .font('Helvetica')
      .text(settings.invoiceInstructions, 50, y, { width: 495 });
    // calculate instructions height roughly (8pt font * 1.2 line height * lines)
    const lines = Math.ceil(settings.invoiceInstructions.length / 110);
    y += Math.max(25, lines * 10);
  }

  // 6. Notes / Terms
  y += 25;
  const notesText = settings.invoiceNotes || 'Thank you for booking with us! We appreciate your trust.';
  doc.rect(50, y, 495, 45).fillAndStroke(lightBg, borderColor);
  doc.fillColor(darkTextColor)
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('Important Booking Terms & Notes:', 60, y + 8);
  doc.fillColor(textColor)
    .fontSize(8)
    .font('Helvetica')
    .text(notesText, 60, y + 20, { width: 475 });

  return doc;
}
