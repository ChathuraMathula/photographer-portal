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

export function buildFinancialReportPdf(
  data: any,
  period: 'weekly' | 'monthly' | 'yearly' | 'custom',
): any {
  const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });

  drawReportHeader(doc, 'Photographer Portal - Financial Analytics', data);

  // Summary Metrics Grid
  doc
    .fillColor(primaryColor)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Earnings & Collections Summary', 50, 95);

  // KPI Cards
  // Card 1
  doc.rect(50, 115, 150, 65).fillAndStroke(lightBg, borderColor);
  doc
    .fillColor(textColor)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('POTENTIAL INCOME', 60, 123);
  doc
    .fillColor(primaryColor)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(`LKR ${data.summary.potentialRevenueLkr.toLocaleString()}`, 60, 138);
  doc
    .fillColor(textColor)
    .fontSize(7.5)
    .font('Helvetica')
    .text('Gross pricing of active orders', 60, 155);

  // Card 2
  doc.rect(215, 115, 150, 65).fillAndStroke(lightBg, borderColor);
  doc
    .fillColor(textColor)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('COLLECTED REVENUE', 225, 123);
  doc
    .fillColor('#10b981')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(`LKR ${data.summary.paidRevenueLkr.toLocaleString()}`, 225, 138);
  doc
    .fillColor(textColor)
    .fontSize(7.5)
    .font('Helvetica')
    .text('All successful deposits/cash', 225, 155);

  // Card 3
  doc.rect(380, 115, 165, 65).fillAndStroke(lightBg, borderColor);
  doc
    .fillColor(textColor)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('OUTSTANDING DUES', 390, 123);
  doc
    .fillColor('#f59e0b')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(`LKR ${data.summary.pendingRevenueLkr.toLocaleString()}`, 390, 138);
  doc
    .fillColor(textColor)
    .fontSize(7.5)
    .font('Helvetica')
    .text('Unsettled booking balances', 390, 155);

  // Revenue graph
  doc
    .fillColor(primaryColor)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Revenue Collection Trend over Time (LKR)', 50, 200);
  const timelinePoints = (data.timeline || []).map((t: any) => ({
    val: t.revenueLkr,
    label: t.label,
  }));
  drawVectorLineChart(doc, 80, 225, 430, 90, timelinePoints, 'LKR ');

  // Package Ranking Graph
  let y = 345;
  doc
    .fillColor(primaryColor)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Pricing Packages Sales Breakdown', 50, y);
  y += 20;

  const packages = data.packages || [];
  if (packages.length > 0) {
    const maxRevenue = Math.max(
      ...packages.map((p: any) => p.revenueLkr),
      1000,
    );
    packages.forEach((pkg: any) => {
      const barHeight = 12;
      const spacing = 10;
      const maxW = 240;
      const barW = Math.max(15, (pkg.revenueLkr / maxRevenue) * maxW);

      doc
        .fillColor(primaryColor)
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text(pkg.name, 50, y + 2, { width: 140 });
      doc.rect(200, y, maxW, barHeight).fill('#f1f5f9');
      doc.rect(200, y, barW, barHeight).fill(accentColor);
      doc
        .fillColor(textColor)
        .fontSize(8)
        .font('Helvetica')
        .text(
          `LKR ${pkg.revenueLkr.toLocaleString()} (${pkg.count} sales)`,
          200 + maxW + 10,
          y + 2,
        );

      y += barHeight + spacing;
    });
  } else {
    doc
      .fillColor(textColor)
      .fontSize(8.5)
      .font('Helvetica-Oblique')
      .text('No packages sold in this range.', 50, y + 5);
    y += 20;
  }

  // Footer business recommendation
  y += 15;
  doc.rect(50, y, 495, 55).fillAndStroke(lightBg, borderColor);
  doc
    .fillColor(primaryColor)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('Financial Advisory Insights:', 60, y + 8);
  const recommendation =
    data.summary.conversionRate < 50
      ? 'Consider following up faster on proposed quotations or lowering deposit barriers to improve cash collection ratios.'
      : 'Strong conversion profile! Introduce premium booking tiers to increase average transaction values.';
  doc
    .fillColor(textColor)
    .fontSize(8.5)
    .font('Helvetica')
    .text(recommendation, 60, y + 22, { width: 475 });

  return doc;
}
