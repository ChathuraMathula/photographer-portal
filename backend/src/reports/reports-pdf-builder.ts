import PDFDocument = require('pdfkit');

export function buildReportPdf(data: any, period: 'weekly' | 'monthly' | 'yearly'): any {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    bufferPages: true,
  });

  // Theme Colors
  const primaryColor = '#18181b'; // zinc-900
  const accentColor = '#2563eb'; // blue-600
  const textColor = '#3f3f46'; // zinc-600
  const lightBg = '#f4f4f5'; // zinc-100
  const borderColor = '#e4e4e7'; // zinc-200

  // Title & Header
  doc.fillColor(primaryColor)
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('Photographer Portal - Analytics Report', 50, 50);

  doc.fillColor(textColor)
    .fontSize(10)
    .font('Helvetica')
    .text(`Period: ${period.toUpperCase()} | Generated: ${new Date().toLocaleDateString()}`, 50, 78);

  doc.moveTo(50, 95)
    .lineTo(545, 95)
    .strokeColor(borderColor)
    .lineWidth(1)
    .stroke();

  // Summary Cards (Grid)
  doc.fillColor(primaryColor)
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('Key Performance Indicators', 50, 115);

  // Card 1: Revenue
  doc.rect(50, 135, 150, 80)
    .fillAndStroke(lightBg, borderColor);
  doc.fillColor(textColor)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('TOTAL REVENUE (LKR)', 60, 148);
  doc.fillColor(primaryColor)
    .fontSize(14)
    .font('Helvetica-Bold')
    .text(`${data.summary.potentialRevenueLkr.toLocaleString()}`, 60, 168);
  doc.fillColor(textColor)
    .fontSize(8)
    .font('Helvetica')
    .text(`Paid LKR ${data.summary.paidRevenueLkr.toLocaleString()}`, 60, 192);

  // Card 2: Bookings
  doc.rect(215, 135, 150, 80)
    .fillAndStroke(lightBg, borderColor);
  doc.fillColor(textColor)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('TOTAL BOOKINGS', 225, 148);
  doc.fillColor(primaryColor)
    .fontSize(18)
    .font('Helvetica-Bold')
    .text(`${data.summary.totalBookings}`, 225, 168);
  doc.fillColor(textColor)
    .fontSize(8)
    .font('Helvetica')
    .text('Reservations in range', 225, 192);

  // Card 3: Conversion Rate
  doc.rect(380, 135, 165, 80)
    .fillAndStroke(lightBg, borderColor);
  doc.fillColor(textColor)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('CONVERSION RATE', 390, 148);
  doc.fillColor(accentColor)
    .fontSize(18)
    .font('Helvetica-Bold')
    .text(`${data.summary.conversionRate}%`, 390, 168);
  doc.fillColor(textColor)
    .fontSize(8)
    .font('Helvetica')
    .text('Confirmed & Completed ratio', 390, 192);

  // Section: Package Performance
  doc.fillColor(primaryColor)
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('Package Performance', 50, 245);

  // Package Table Header
  let y = 270;
  doc.rect(50, y, 495, 20).fill(primaryColor);
  doc.fillColor('#ffffff')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('Package Name', 60, y + 6)
    .text('Bookings Count', 320, y + 6)
    .text('Total Revenue (LKR)', 430, y + 6);

  y += 20;
  data.packages.forEach((pkg: any, index: number) => {
    const bg = index % 2 === 0 ? '#ffffff' : lightBg;
    doc.rect(50, y, 495, 22).fillAndStroke(bg, borderColor);
    doc.fillColor(primaryColor)
      .fontSize(9)
      .font('Helvetica')
      .text(pkg.name, 60, y + 7)
      .text(`${pkg.count}`, 320, y + 7)
      .text(`${pkg.revenueLkr.toLocaleString()}`, 430, y + 7);
    y += 22;
  });

  if (data.packages.length === 0) {
    doc.rect(50, y, 495, 22).fillAndStroke('#ffffff', borderColor);
    doc.fillColor(textColor)
      .fontSize(9)
      .font('Helvetica-Oblique')
      .text('No package booking stats in this period.', 60, y + 7);
    y += 22;
  }

  // Event Types distribution
  y += 30;
  doc.fillColor(primaryColor)
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('Event Type Preferences', 50, y);

  y += 25;
  doc.rect(50, y, 495, 20).fill(primaryColor);
  doc.fillColor('#ffffff')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('Event Category', 60, y + 6)
    .text('Bookings Count', 320, y + 6);

  y += 20;
  data.eventTypes.forEach((evt: any, index: number) => {
    const bg = index % 2 === 0 ? '#ffffff' : lightBg;
    doc.rect(50, y, 495, 22).fillAndStroke(bg, borderColor);
    doc.fillColor(primaryColor)
      .fontSize(9)
      .font('Helvetica')
      .text(evt.name, 60, y + 7)
      .text(`${evt.count}`, 320, y + 7);
    y += 22;
  });

  if (data.eventTypes.length === 0) {
    doc.rect(50, y, 495, 22).fillAndStroke('#ffffff', borderColor);
    doc.fillColor(textColor)
      .fontSize(9)
      .font('Helvetica-Oblique')
      .text('No event preference stats in this period.', 60, y + 7);
    y += 22;
  }

  // Footnotes / Business recommendation
  y += 30;
  doc.rect(50, y, 495, 60).fillAndStroke(lightBg, borderColor);
  doc.fillColor(primaryColor)
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('Business Advisory Notes:', 60, y + 10);
  
  let recommendation = 'Your package metrics show steady demand. Promote high-performing packages with bundle discounts.';
  if (data.summary.conversionRate < 50) {
    recommendation = 'Your booking conversion rate is below 50%. Consider following up faster on proposed quotations or adjusting deposit requirements.';
  } else if (data.summary.totalBookings > 10) {
    recommendation = 'Excellent booking traction! You might want to introduce premium package tiers or adjust pricing up for your most popular event types.';
  }
  
  doc.fillColor(textColor)
    .fontSize(9)
    .font('Helvetica')
    .text(recommendation, 60, y + 25, { width: 475 });

  return doc;
}
