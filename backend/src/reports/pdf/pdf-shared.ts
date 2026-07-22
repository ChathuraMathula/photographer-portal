import PDFDocument = require('pdfkit');

// Theme Colors
export const primaryColor = '#18181b'; // zinc-900
export const accentColor = '#2563eb'; // blue-600
export const textColor = '#3f3f46'; // zinc-600
export const lightBg = '#f4f4f5'; // zinc-100
export const borderColor = '#e4e4e7'; // zinc-200
export const chartFillColor = '#eff6ff'; // soft blue

// Shared Vector Graph Helper: Draw Grid Background
export function drawChartGrid(
  doc: any,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  doc.rect(x, y, w, h).fillAndStroke('#fafafa', borderColor);

  // Inner grid dashed lines
  doc.lineWidth(0.5).strokeColor('#e4e4e7');
  for (let i = 1; i <= 3; i++) {
    const yTick = y + (h / 4) * i;
    doc
      .moveTo(x, yTick)
      .lineTo(x + w, yTick)
      .stroke();
  }
}

// Shared Vector Graph Helper: Draw Line Chart
export function drawVectorLineChart(
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
        doc
          .fillColor(textColor)
          .fontSize(6.5)
          .font('Helvetica')
          .text(p.label, p.x - 15, y + h + 6, { width: 30, align: 'center' });
      }
    });

    // Y Axis label
    doc
      .fillColor(textColor)
      .fontSize(7)
      .font('Helvetica-Bold')
      .text(
        `${yLabelPrefix}${Math.round(maxVal).toLocaleString()}`,
        x - 65,
        y + 2,
        { width: 60, align: 'right' },
      );
  } else {
    doc
      .fillColor(textColor)
      .fontSize(8.5)
      .font('Helvetica-Oblique')
      .text(
        'Not enough historical coordinates to plot.',
        x + 120,
        y + h / 2 - 4,
      );
  }
}

// Header template
export function drawReportHeader(doc: any, title: string, data: any) {
  doc
    .fillColor(primaryColor)
    .fontSize(20)
    .font('Helvetica-Bold')
    .text(title, 50, 40);

  const rangeLabel =
    data.startDateStr && data.endDateStr
      ? `${data.startDateStr} to ${data.endDateStr}`
      : data.period.toUpperCase();

  doc
    .fillColor(textColor)
    .fontSize(9)
    .font('Helvetica')
    .text(
      `Interval Scope: ${rangeLabel} | Generated: ${new Date().toLocaleDateString()}`,
      50,
      65,
    );

  doc
    .moveTo(50, 75)
    .lineTo(545, 75)
    .strokeColor(borderColor)
    .lineWidth(1)
    .stroke();
}
