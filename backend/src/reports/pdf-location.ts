import PDFDocument = require('pdfkit');
import {
  primaryColor,
  accentColor,
  textColor,
  lightBg,
  borderColor,
  drawReportHeader,
} from './pdf-shared';

export function buildLocationReportPdf(
  data: any,
  period: 'weekly' | 'monthly' | 'yearly' | 'custom',
  mapImageBuffer?: Buffer | null,
): any {
  const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });

  drawReportHeader(doc, 'Photographer Portal - Location Analytics', data);

  const bookings = data.rawBookings || [];
  const totalBookings = bookings.length;
  
  // 1. Calculate stats
  const districtCounts: Record<string, number> = {};
  const cityCounts: Record<string, number> = {};
  let withLocation = 0;
  let withCoords = 0;

  bookings.forEach((b: any) => {
    if (b.district) {
      districtCounts[b.district] = (districtCounts[b.district] || 0) + 1;
    }
    if (b.city) {
      cityCounts[b.city] = (cityCounts[b.city] || 0) + 1;
    }
    if (b.district || b.city || b.location || b.locationMapLink) {
      withLocation++;
    }
    if (b.locationMapLink) {
      const atMatch = b.locationMapLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      const qMatch = b.locationMapLink.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch || qMatch) {
        withCoords++;
      }
    }
  });

  const topDistrict = Object.entries(districtCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  const topCity = Object.entries(cityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  const coveragePercent = totalBookings > 0 ? Math.round((withLocation / totalBookings) * 100) : 0;

  // Render Stats Grid
  doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('Geographic Coverage Summary', 50, 95);

  // Card 1
  doc.rect(50, 115, 110, 65).fillAndStroke(lightBg, borderColor);
  doc.fillColor(textColor).fontSize(7).font('Helvetica-Bold').text('TOP DISTRICT', 60, 123);
  doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text(topDistrict, 60, 138, { width: 95 });

  // Card 2
  doc.rect(170, 115, 110, 65).fillAndStroke(lightBg, borderColor);
  doc.fillColor(textColor).fontSize(7).font('Helvetica-Bold').text('TOP CITY', 180, 123);
  doc.fillColor(accentColor).fontSize(11).font('Helvetica-Bold').text(topCity, 180, 138, { width: 95 });

  // Card 3
  doc.rect(290, 115, 120, 65).fillAndStroke(lightBg, borderColor);
  doc.fillColor(textColor).fontSize(7).font('Helvetica-Bold').text('EXACT COORDINATES', 300, 123);
  doc.fillColor('#10b981').fontSize(12).font('Helvetica-Bold').text(`${withCoords} bookings`, 300, 138);

  // Card 4
  doc.rect(420, 115, 125, 65).fillAndStroke(lightBg, borderColor);
  doc.fillColor(textColor).fontSize(7).font('Helvetica-Bold').text('LOCATION COVERAGE', 430, 123);
  doc.fillColor('#6366f1').fontSize(14).font('Helvetica-Bold').text(`${coveragePercent}%`, 430, 138);

  // District distribution table
  let y = 200;
  doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('District Breakdown', 50, y);
  y += 20;

  doc.rect(50, y, 495, 18).fill(primaryColor);
  doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold').text('District', 60, y + 5).text('Bookings Count', 400, y + 5);
  y += 18;

  const sortedDistricts = Object.entries(districtCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  sortedDistricts.forEach(([dist, count], idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : lightBg;
    doc.rect(50, y, 495, 18).fillAndStroke(bg, borderColor);
    doc.fillColor(primaryColor).fontSize(8.5).font('Helvetica').text(dist, 60, y + 5).text(`${count} bookings`, 400, y + 5);
    y += 18;
  });

  if (sortedDistricts.length === 0) {
    doc.rect(50, y, 495, 18).fillAndStroke('#ffffff', borderColor);
    doc.fillColor(textColor).fontSize(8.5).font('Helvetica-Oblique').text('No district data recorded.', 60, y + 5);
    y += 18;
  }

  // City distribution table
  y += 15;
  doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('City Breakdown', 50, y);
  y += 20;

  doc.rect(50, y, 495, 18).fill(primaryColor);
  doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold').text('City', 60, y + 5).text('Bookings Count', 400, y + 5);
  y += 18;

  const sortedCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  sortedCities.forEach(([city, count], idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : lightBg;
    doc.rect(50, y, 495, 18).fillAndStroke(bg, borderColor);
    doc.fillColor(primaryColor).fontSize(8.5).font('Helvetica').text(city, 60, y + 5).text(`${count} bookings`, 400, y + 5);
    y += 18;
  });

  if (sortedCities.length === 0) {
    doc.rect(50, y, 495, 18).fillAndStroke('#ffffff', borderColor);
    doc.fillColor(textColor).fontSize(8.5).font('Helvetica-Oblique').text('No city data recorded.', 60, y + 5);
    y += 18;
  }

  // Render static map image if available
  if (mapImageBuffer) {
    y += 15;
    doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('Geographic Distribution Map Preview', 50, y);
    y += 20;
    doc.image(mapImageBuffer, 50, y, { width: 495, height: 220 });
  }

  // Add a new page for detailed location log
  doc.addPage();
  drawReportHeader(doc, 'Booking Location Analytics - Detailed Log', data);

  y = 95;
  doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('Historical Locations Record', 50, y);
  y += 20;

  doc.rect(50, y, 495, 18).fill(primaryColor);
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
    .text('Client', 60, y + 5)
    .text('Event Type', 180, y + 5)
    .text('City', 280, y + 5)
    .text('District', 380, y + 5)
    .text('Exact Coords', 470, y + 5);
  y += 18;

  bookings.slice(0, 20).forEach((b: any, idx: number) => {
    const bg = idx % 2 === 0 ? '#ffffff' : lightBg;
    doc.rect(50, y, 495, 18).fillAndStroke(bg, borderColor);

    let hasGPS = 'No';
    if (b.locationMapLink) {
      const atMatch = b.locationMapLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      const qMatch = b.locationMapLink.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch || qMatch) hasGPS = 'Yes';
    }

    doc.fillColor(primaryColor).fontSize(7.5).font('Helvetica')
      .text(b.clientName || 'Manual Client', 60, y + 5, { width: 110, ellipsis: true })
      .text(b.eventType || 'Other', 180, y + 5, { width: 90, ellipsis: true })
      .text(b.city || '—', 280, y + 5, { width: 90, ellipsis: true })
      .text(b.district || '—', 380, y + 5, { width: 80, ellipsis: true })
      .text(hasGPS, 470, y + 5);

    y += 18;
  });

  return doc;
}
