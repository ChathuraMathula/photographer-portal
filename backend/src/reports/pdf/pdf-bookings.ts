import PDFDocument = require('pdfkit');
import {
  primaryColor,
  accentColor,
  textColor,
  lightBg,
  borderColor,
  drawReportHeader,
  drawVectorLineChart,
} from './pdf-shared';

export function buildBookingsReportPdf(
  data: any,
  period: 'weekly' | 'monthly' | 'yearly' | 'custom',
): any {
  const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });

  drawReportHeader(
    doc,
    'Photographer Portal - Booking & Traffic Analytics',
    data,
  );

  // Booking Counts Metrics Grid
  doc
    .fillColor(primaryColor)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Customer Engagement Summary', 50, 95);

  // Card 1
  doc.rect(50, 115, 150, 65).fillAndStroke(lightBg, borderColor);
  doc
    .fillColor(textColor)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('TOTAL RESERVATIONS', 60, 123);
  doc
    .fillColor(primaryColor)
    .fontSize(14)
    .font('Helvetica-Bold')
    .text(`${data.summary.totalBookings} Requests`, 60, 138);
  doc
    .fillColor(textColor)
    .fontSize(7.5)
    .font('Helvetica')
    .text('Aggregate bookings count', 60, 155);

  // Card 2
  doc.rect(215, 115, 150, 65).fillAndStroke(lightBg, borderColor);
  doc
    .fillColor(textColor)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('SUCCESSFUL BOOKINGS', 225, 123);
  doc
    .fillColor(accentColor)
    .fontSize(14)
    .font('Helvetica-Bold')
    .text(
      `${data.rawBookings.filter((b: any) => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length} Confirmed`,
      225,
      138,
    );
  doc
    .fillColor(textColor)
    .fontSize(7.5)
    .font('Helvetica')
    .text('Active confirmed reservations', 225, 155);

  // Card 3
  doc.rect(380, 115, 165, 65).fillAndStroke(lightBg, borderColor);
  doc
    .fillColor(textColor)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('CONVERSION RATE', 390, 123);
  doc
    .fillColor('#10b981')
    .fontSize(14)
    .font('Helvetica-Bold')
    .text(`${data.summary.conversionRate}%`, 390, 138);
  doc
    .fillColor(textColor)
    .fontSize(7.5)
    .font('Helvetica')
    .text('Proposal approval ratio', 390, 155);

  // Bookings trend timeline graph
  doc
    .fillColor(primaryColor)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Booking Traffic Volume Trend (Count)', 50, 200);
  const timelinePoints = (data.timeline || []).map((t: any) => ({
    val: t.bookings,
    label: t.label,
  }));
  drawVectorLineChart(doc, 80, 225, 430, 90, timelinePoints, '');

  // Category Distribution & Status Summary Table
  let y = 345;
  doc
    .fillColor(primaryColor)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Event Categories Preference Breakdown', 50, y);
  y += 20;

  // Header
  doc.rect(50, y, 495, 18).fill(primaryColor);
  doc
    .fillColor('#ffffff')
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('Event Classification Type', 60, y + 5)
    .text('Reservations Quantity', 350, y + 5);
  y += 18;

  const eventTypes = data.eventTypes || [];
  eventTypes.forEach((evt: any, index: number) => {
    const bg = index % 2 === 0 ? '#ffffff' : lightBg;
    doc.rect(50, y, 495, 18).fillAndStroke(bg, borderColor);
    doc
      .fillColor(primaryColor)
      .fontSize(8)
      .font('Helvetica')
      .text(evt.name, 60, y + 5)
      .text(`${evt.count} bookings`, 350, y + 5);
    y += 18;
  });

  if (eventTypes.length === 0) {
    doc.rect(50, y, 495, 18).fillAndStroke('#ffffff', borderColor);
    doc
      .fillColor(textColor)
      .fontSize(8)
      .font('Helvetica-Oblique')
      .text('No events recorded in this range.', 60, y + 5);
    y += 18;
  }

  // Booking Status breakdown list
  y += 15;
  doc
    .fillColor(primaryColor)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Booking Status Segmentation Counts', 50, y);
  y += 20;

  const statuses = data.statusDistribution || [];
  statuses.forEach((stat: any) => {
    doc
      .fillColor(primaryColor)
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .text(stat.name, 50, y + 2);
    doc.rect(180, y, 220, 10).fill('#f1f5f9');
    const pct =
      data.summary.totalBookings > 0
        ? (stat.value / data.summary.totalBookings) * 220
        : 0;
    doc.rect(180, y, pct, 10).fill(accentColor);
    doc
      .fillColor(textColor)
      .fontSize(8)
      .font('Helvetica')
      .text(`${stat.value} items`, 415, y + 2);
    y += 16;
  });

  return doc;
}
