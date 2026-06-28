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
  const chartFillColor = '#eff6ff'; // soft blue

  // Title & Header
  doc.fillColor(primaryColor)
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('Photographer Portal - Analytics Report', 50, 40);

  doc.fillColor(textColor)
    .fontSize(9)
    .font('Helvetica')
    .text(`Period: ${period.toUpperCase()} | Generated: ${new Date().toLocaleDateString()}`, 50, 68);

  doc.moveTo(50, 80)
    .lineTo(545, 80)
    .strokeColor(borderColor)
    .lineWidth(1)
    .stroke();

  // Summary Cards (Grid)
  doc.fillColor(primaryColor)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Key Performance Indicators', 50, 95);

  // Card 1: Revenue
  doc.rect(50, 115, 150, 70)
    .fillAndStroke(lightBg, borderColor);
  doc.fillColor(textColor)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('TOTAL REVENUE (LKR)', 60, 125);
  doc.fillColor(primaryColor)
    .fontSize(13)
    .font('Helvetica-Bold')
    .text(`${data.summary.potentialRevenueLkr.toLocaleString()}`, 60, 142);
  doc.fillColor(textColor)
    .fontSize(7.5)
    .font('Helvetica')
    .text(`Paid LKR ${data.summary.paidRevenueLkr.toLocaleString()}`, 60, 162);

  // Card 2: Bookings
  doc.rect(215, 115, 150, 70)
    .fillAndStroke(lightBg, borderColor);
  doc.fillColor(textColor)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('TOTAL BOOKINGS', 225, 125);
  doc.fillColor(primaryColor)
    .fontSize(16)
    .font('Helvetica-Bold')
    .text(`${data.summary.totalBookings}`, 225, 142);
  doc.fillColor(textColor)
    .fontSize(7.5)
    .font('Helvetica')
    .text('Reservations in range', 225, 162);

  // Card 3: Conversion Rate
  doc.rect(380, 115, 165, 70)
    .fillAndStroke(lightBg, borderColor);
  doc.fillColor(textColor)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('CONVERSION RATE', 390, 125);
  doc.fillColor(accentColor)
    .fontSize(16)
    .font('Helvetica-Bold')
    .text(`${data.summary.conversionRate}%`, 390, 142);
  doc.fillColor(textColor)
    .fontSize(7.5)
    .font('Helvetica')
    .text('Confirmed & Completed ratio', 390, 162);

  // ── GRAPH 1: REVENUE TIMELINE CHART (Vector Graphics) ──────────────────────────
  doc.fillColor(primaryColor)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Revenue Trend over Time (LKR)', 50, 205);

  const graphX = 80;
  const graphY = 230;
  const graphW = 430;
  const graphH = 90;

  // Grid background
  doc.rect(graphX, graphY, graphW, graphH)
    .fillAndStroke('#fafafa', borderColor);

  // Grids and ticks
  doc.lineWidth(0.5).strokeColor('#e4e4e7');
  for (let i = 1; i <= 3; i++) {
    const yTick = graphY + (graphH / 4) * i;
    doc.moveTo(graphX, yTick).lineTo(graphX + graphW, yTick).stroke();
  }

  const timeline = data.timeline || [];
  if (timeline.length > 1) {
    const maxVal = Math.max(...timeline.map((t: any) => t.revenueLkr), 1000);
    const points = timeline.map((t: any, index: number) => {
      const x = graphX + (index / (timeline.length - 1)) * graphW;
      const y = graphY + graphH - (t.revenueLkr / maxVal) * graphH;
      return { x, y, label: t.label, val: t.revenueLkr };
    });

    // 1. Draw area fill
    doc.fillColor(chartFillColor);
    doc.moveTo(points[0].x, graphY + graphH);
    points.forEach((p: any) => {
      doc.lineTo(p.x, p.y);
    });
    doc.lineTo(points[points.length - 1].x, graphY + graphH);
    doc.closePath().fill();

    // 2. Draw line stroke
    doc.strokeColor(accentColor).lineWidth(1.8);
    doc.moveTo(points[0].x, points[0].y);
    points.forEach((p: any) => {
      doc.lineTo(p.x, p.y);
    });
    doc.stroke();

    // 3. Labels and dots
    points.forEach((p: any, i: number) => {
      // Circle dot
      doc.fillColor(accentColor).circle(p.x, p.y, 2.5).fill();

      // Horizontal text label (every alternate label to prevent overlaps)
      if (timeline.length < 8 || i % 2 === 0) {
        doc.fillColor(textColor)
          .fontSize(6.5)
          .font('Helvetica')
          .text(p.label, p.x - 15, graphY + graphH + 6, { width: 30, align: 'center' });
      }
    });

    // Y Axis Max label
    doc.fillColor(textColor)
      .fontSize(7)
      .font('Helvetica-Bold')
      .text(`LKR ${(maxVal).toLocaleString()}`, graphX - 65, graphY + 2, { width: 60, align: 'right' });
  } else {
    doc.fillColor(textColor)
      .fontSize(9)
      .font('Helvetica-Oblique')
      .text('Not enough timeline metrics to plot graph.', graphX + 120, graphY + 40);
  }

  // ── GRAPH 2: PACKAGES HORIZONTAL BAR CHART ──────────────────────────────────────
  let y = 350;
  doc.fillColor(primaryColor)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Package Performance (Relative Sales Value)', 50, y);

  y += 20;
  const packages = data.packages || [];
  if (packages.length > 0) {
    const maxRevenue = Math.max(...packages.map((p: any) => p.revenueLkr), 1000);
    packages.forEach((pkg: any, index: number) => {
      const barHeight = 12;
      const spacing = 10;
      const maxBarWidth = 240;
      const barWidth = Math.max(15, (pkg.revenueLkr / maxRevenue) * maxBarWidth);

      // Label
      doc.fillColor(primaryColor)
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text(pkg.name, 50, y + 2, { width: 140 });

      // Bar container background
      doc.rect(200, y, maxBarWidth, barHeight)
        .fill('#f1f5f9');

      // Colored bar fill
      doc.rect(200, y, barWidth, barHeight)
        .fill(accentColor);

      // Value label
      doc.fillColor(textColor)
        .fontSize(8)
        .font('Helvetica')
        .text(`LKR ${pkg.revenueLkr.toLocaleString()} (${pkg.count} sales)`, 200 + maxBarWidth + 10, y + 2);

      y += barHeight + spacing;
    });
  } else {
    doc.fillColor(textColor)
      .fontSize(9)
      .font('Helvetica-Oblique')
      .text('No package booking stats in this period.', 50, y + 10);
    y += 25;
  }

  // Event types summary table
  y += 15;
  doc.fillColor(primaryColor)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Event Category Distribution', 50, y);

  y += 18;
  doc.rect(50, y, 495, 18).fill(primaryColor);
  doc.fillColor('#ffffff')
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('Event Type / Category', 60, y + 5)
    .text('Total Bookings Count', 320, y + 5);

  y += 18;
  data.eventTypes.forEach((evt: any, index: number) => {
    const bg = index % 2 === 0 ? '#ffffff' : lightBg;
    doc.rect(50, y, 495, 20).fillAndStroke(bg, borderColor);
    doc.fillColor(primaryColor)
      .fontSize(8.5)
      .font('Helvetica')
      .text(evt.name, 60, y + 6)
      .text(`${evt.count}`, 320, y + 6);
    y += 20;
  });

  if (data.eventTypes.length === 0) {
    doc.rect(50, y, 495, 20).fillAndStroke('#ffffff', borderColor);
    doc.fillColor(textColor)
      .fontSize(8.5)
      .font('Helvetica-Oblique')
      .text('No event preference stats in this period.', 60, y + 6);
    y += 20;
  }

  // Footnotes / Business recommendation
  y += 25;
  doc.rect(50, y, 495, 55).fillAndStroke(lightBg, borderColor);
  doc.fillColor(primaryColor)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('Business Advisory Notes:', 60, y + 8);
  
  let recommendation = 'Your package metrics show steady demand. Promote high-performing packages with bundle discounts.';
  if (data.summary.conversionRate < 50) {
    recommendation = 'Your booking conversion rate is below 50%. Consider following up faster on proposed quotations or adjusting deposit requirements.';
  } else if (data.summary.totalBookings > 10) {
    recommendation = 'Excellent booking traction! You might want to introduce premium package tiers or adjust pricing up for your most popular event types.';
  }
  
  doc.fillColor(textColor)
    .fontSize(8.5)
    .font('Helvetica')
    .text(recommendation, 60, y + 22, { width: 475 });

  return doc;
}
