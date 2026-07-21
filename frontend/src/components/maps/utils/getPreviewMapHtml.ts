export function getPreviewMapHtml(lat: number, lon: number, popupText: string) {
  const isOffline = process.env.NEXT_PUBLIC_OFFLINE_MAPS === "true";
  const leafletCss = isOffline
    ? "/leaflet/leaflet.css"
    : "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  const leafletJs = isOffline
    ? "/leaflet/leaflet.js"
    : "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
  const tileUrl = isOffline
    ? "http://localhost:8080/styles/basic-preview/{z}/{x}/{y}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <link rel="stylesheet" href="${leafletCss}" />
      <script src="${leafletJs}"></script>
      <style>
        body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
        .leaflet-container { font-family: system-ui, -apple-system, sans-serif; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: true }).setView([${lat}, ${lon}], 13);
        L.tileLayer('${tileUrl}', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
        }).addTo(map);
        
        ${isOffline ? `L.Icon.Default.imagePath = '/leaflet/images/';` : ''}
        L.marker([${lat}, ${lon}]).addTo(map)
          .bindPopup("<b>Event Location</b><br/>${popupText.replace(/"/g, '\\"')}")
          .openPopup();
      </script>
    </body>
    </html>
  `;
}
