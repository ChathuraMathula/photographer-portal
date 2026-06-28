import PDFDocument = require('pdfkit');

// Theme Colors
const primaryColor = '#18181b'; // zinc-900
const accentColor = '#2563eb'; // blue-600
const textColor = '#3f3f46'; // zinc-600
const lightBg = '#f4f4f5'; // zinc-100
const borderColor = '#e4e4e7'; // zinc-200
const chartFillColor = '#eff6ff'; // soft blue

// Shared Vector Graph Helper: Draw Grid Background
function drawChartGrid(doc: any, x: number, y: number, w: number, h: number) {
  doc.rect(x, y, w, h)
    .fillAndStroke('#fafafa', borderColor);

  // Inner grid dashed lines
  doc.lineWidth(0.5).strokeColor('#e4e4e7');
  for (let i = 1; i <= 3; i++) {
    const yTick = y + (h / 4) * i;
    doc.moveTo(x, yTick).lineTo(x + w, yTick).stroke();
  }
}

// Shared Vector Graph Helper: Draw Line Chart
function drawVectorLineChart(
  doc: any,
  x: number,
  y: number,
  w: number,
  h: number,
  dataPoints: Array<{ val: number; label: string }>,
  yLabelPrefix = '',
) {
  drawChartGrid(doc, x, y, w, h);

  if (dataPoints.length > 1) {
    const maxVal = Math.max(...dataPoints.map((d) => d.val), 5);
    const points = dataPoints.map((d, index) => {
      const px = x + (index / (dataPoints.length - 1)) * w;
      const py = y + h - (d.val / maxVal) * h;
      return { x: px, y: py, label: d.label, val: d.val };
    });

    // Area Fill
    doc.fillColor(chartFillColor);
    doc.moveTo(points[0].x, y + h);
    points.forEach((p) => {
      doc.lineTo(p.x, p.y);
    });
    doc.lineTo(points[points.length - 1].x, y + h);
    doc.closePath().fill();

    // Line Stroke
    doc.strokeColor(accentColor).lineWidth(1.8);
    doc.moveTo(points[0].x, points[0].y);
    points.forEach((p) => {
      doc.lineTo(p.x, p.y);
    });
    doc.stroke();

    // Dots & Labels
    points.forEach((p, i) => {
      doc.fillColor(accentColor).circle(p.x, p.y, 2.5).fill();
      if (dataPoints.length < 8 || i % 2 === 0) {
        doc.fillColor(textColor)
          .fontSize(6.5)
          .font('Helvetica')
          .text(p.label, p.x - 15, y + h + 6, { width: 30, align: 'center' });
      }
    });

    // Y Axis label
    doc.fillColor(textColor)
      .fontSize(7)
      .font('Helvetica-Bold')
      .text(`${yLabelPrefix}${Math.round(maxVal).toLocaleString()}`, x - 65, y + 2, { width: 60, align: 'right' });
  } else {
    doc.fillColor(textColor)
      .fontSize(8.5)
      .font('Helvetica-Oblique')
      .text('Not enough historical coordinates to plot.', x + 120, y + (h / 2) - 4);
  }
}

// Header template
function drawReportHeader(doc: any, title: string, period: string) {
  doc.fillColor(primaryColor)
    .fontSize(20)
    .font('Helvetica-Bold')
    .text(title, 50, 40);

  doc.fillColor(textColor)
    .fontSize(9)
    .font('Helvetica')
    .text(`Interval Scope: ${period.toUpperCase()} | Generated: ${new Date().toLocaleDateString()}`, 50, 65);

  doc.moveTo(50, 75)
    .lineTo(545, 75)
    .strokeColor(borderColor)
    .lineWidth(1)
    .stroke();
}

// ── Financial PDF builder ─────────────────────────────────────────────────────
export function buildFinancialReportPdf(data: any, period: 'weekly' | 'monthly' | 'yearly'): any {
  const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });

  drawReportHeader(doc, 'Photographer Portal - Financial Analytics', period);

  // Summary Metrics Grid
  doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('Earnings & Collections Summary', 50, 95);

  // KPI Cards
  // Card 1
  doc.rect(50, 115, 150, 65).fillAndStroke(lightBg, borderColor);
  doc.fillColor(textColor).fontSize(8).font('Helvetica-Bold').text('POTENTIAL INCOME', 60, 123);
  doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text(`LKR ${data.summary.potentialRevenueLkr.toLocaleString()}`, 60, 138);
  doc.fillColor(textColor).fontSize(7.5).font('Helvetica').text('Gross pricing of active orders', 60, 155);

  // Card 2
  doc.rect(215, 115, 150, 65).fillAndStroke(lightBg, borderColor);
  doc.fillColor(textColor).fontSize(8).font('Helvetica-Bold').text('COLLECTED REVENUE', 225, 123);
  doc.fillColor('#10b981').fontSize(12).font('Helvetica-Bold').text(`LKR ${data.summary.paidRevenueLkr.toLocaleString()}`, 225, 138);
  doc.fillColor(textColor).fontSize(7.5).font('Helvetica').text('All successful deposits/cash', 225, 155);

  // Card 3
  doc.rect(380, 115, 165, 65).fillAndStroke(lightBg, borderColor);
  doc.fillColor(textColor).fontSize(8).font('Helvetica-Bold').text('OUTSTANDING DUES', 390, 123);
  doc.fillColor('#f59e0b').fontSize(12).font('Helvetica-Bold').text(`LKR ${data.summary.pendingRevenueLkr.toLocaleString()}`, 390, 138);
  doc.fillColor(textColor).fontSize(7.5).font('Helvetica').text('Unsettled booking balances', 390, 155);

  // Revenue graph
  doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('Revenue Collection Trend over Time (LKR)', 50, 200);
  const timelinePoints = (data.timeline || []).map((t: any) => ({ val: t.revenueLkr, label: t.label }));
  drawVectorLineChart(doc, 80, 225, 430, 90, timelinePoints, 'LKR ');

  // Package Ranking Graph
  let y = 345;
  doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('Pricing Packages Sales Breakdown', 50, y);
  y += 20;

  const packages = data.packages || [];
  if (packages.length > 0) {
    const maxRevenue = Math.max(...packages.map((p: any) => p.revenueLkr), 1000);
    packages.forEach((pkg: any) => {
      const barHeight = 12;
      const spacing = 10;
      const maxW = 240;
      const barW = Math.max(15, (pkg.revenueLkr / maxRevenue) * maxW);

      doc.fillColor(primaryColor).fontSize(8.5).font('Helvetica-Bold').text(pkg.name, 50, y + 2, { width: 140 });
      doc.rect(200, y, maxW, barHeight).fill('#f1f5f9');
      doc.rect(200, y, barW, barHeight).fill(accentColor);
      doc.fillColor(textColor).fontSize(8).font('Helvetica').text(`LKR ${pkg.revenueLkr.toLocaleString()} (${pkg.count} sales)`, 200 + maxW + 10, y + 2);

      y += barHeight + spacing;
    });
  } else {
    doc.fillColor(textColor).fontSize(8.5).font('Helvetica-Oblique').text('No packages sold in this range.', 50, y + 5);
    y += 20;
  }

  // Footer business recommendation
  y += 15;
  doc.rect(50, y, 495, 55).fillAndStroke(lightBg, borderColor);
  doc.fillColor(primaryColor).fontSize(9).font('Helvetica-Bold').text('Financial Advisory Insights:', 60, y + 8);
  const recommendation = data.summary.conversionRate < 50
    ? 'Consider following up faster on proposed quotations or lowering deposit barriers to improve cash collection ratios.'
    : 'Strong conversion profile! Introduce premium booking tiers to increase average transaction values.';
  doc.fillColor(textColor).fontSize(8.5).font('Helvetica').text(recommendation, 60, y + 22, { width: 475 });

  return doc;
}

// ── Bookings Analytics PDF builder ────────────────────────────────────────────
export function buildBookingsReportPdf(data: any, period: 'weekly' | 'monthly' | 'yearly'): any {
  const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });

  drawReportHeader(doc, 'Photographer Portal - Booking & Traffic Analytics', period);

  // Booking Counts Metrics Grid
  doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('Customer Engagement Summary', 50, 95);

  // Card 1
  doc.rect(50, 115, 150, 65).fillAndStroke(lightBg, borderColor);
  doc.fillColor(textColor).fontSize(8).font('Helvetica-Bold').text('TOTAL RESERVATIONS', 60, 123);
  doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text(`${data.summary.totalBookings} Requests`, 60, 138);
  doc.fillColor(textColor).fontSize(7.5).font('Helvetica').text('Aggregate bookings count', 60, 155);

  // Card 2
  doc.rect(215, 115, 150, 65).fillAndStroke(lightBg, borderColor);
  doc.fillColor(textColor).fontSize(8).font('Helvetica-Bold').text('SUCCESSFUL BOOKINGS', 225, 123);
  doc.fillColor(accentColor).fontSize(14).font('Helvetica-Bold').text(`${data.rawBookings.filter((b: any) => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length} Confirmed`, 225, 138);
  doc.fillColor(textColor).fontSize(7.5).font('Helvetica').text('Active confirmed reservations', 225, 155);

  // Card 3
  doc.rect(380, 115, 165, 65).fillAndStroke(lightBg, borderColor);
  doc.fillColor(textColor).fontSize(8).font('Helvetica-Bold').text('CONVERSION RATE', 390, 123);
  doc.fillColor('#10b981').fontSize(14).font('Helvetica-Bold').text(`${data.summary.conversionRate}%`, 390, 138);
  doc.fillColor(textColor).fontSize(7.5).font('Helvetica').text('Proposal approval ratio', 390, 155);

  // Bookings trend timeline graph (identical height/width parameters for consistency!)
  doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('Booking Traffic Volume Trend (Count)', 50, 200);
  const timelinePoints = (data.timeline || []).map((t: any) => ({ val: t.bookings, label: t.label }));
  drawVectorLineChart(doc, 80, 225, 430, 90, timelinePoints, '');

  // Category Distribution & Status Summary Table
  let y = 345;
  doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('Event Categories Preference Breakdown', 50, y);
  y += 20;

  // Header
  doc.rect(50, y, 495, 18).fill(primaryColor);
  doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold').text('Event Classification Type', 60, y + 5).text('Reservations Quantity', 350, y + 5);
  y += 18;

  const eventTypes = data.eventTypes || [];
  eventTypes.forEach((evt: any, index: number) => {
    const bg = index % 2 === 0 ? '#ffffff' : lightBg;
    doc.rect(50, y, 495, 18).fillAndStroke(bg, borderColor);
    doc.fillColor(primaryColor).fontSize(8).font('Helvetica').text(evt.name, 60, y + 5).text(`${evt.count} bookings`, 350, y + 5);
    y += 18;
  });

  if (eventTypes.length === 0) {
    doc.rect(50, y, 495, 18).fillAndStroke('#ffffff', borderColor);
    doc.fillColor(textColor).fontSize(8).font('Helvetica-Oblique').text('No events recorded in this range.', 60, y + 5);
    y += 18;
  }

  // Booking Status breakdown list
  y += 15;
  doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('Booking Status Segmentation Counts', 50, y);
  y += 20;

  const statuses = data.statusDistribution || [];
  statuses.forEach((stat: any) => {
    doc.fillColor(primaryColor).fontSize(8.5).font('Helvetica-Bold').text(stat.name, 50, y + 2);
    doc.rect(180, y, 220, 10).fill('#f1f5f9');
    const pct = data.summary.totalBookings > 0 ? (stat.value / data.summary.totalBookings) * 220 : 0;
    doc.rect(180, y, pct, 10).fill(accentColor);
    doc.fillColor(textColor).fontSize(8).font('Helvetica').text(`${stat.value} items`, 415, y + 2);
    y += 16;
  });

  return doc;
}
