export function getMapHtml(
  currentLat: number,
  currentLon: number,
  readOnly: boolean,
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
        .leaflet-container { font-family: system-ui, -apple-system, sans-serif; }
        .info-panel { position: absolute; top: 10px; right: 10px; background: rgba(255, 255, 255, 0.95); padding: 8px 12px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.2); z-index: 1000; font-size: 11px; font-weight: 600; color: #333; pointer-events: none; }
      </style>
    </head>
    <body>
      ${readOnly ? "" : `<div class="info-panel">📍 Click map to position the exact venue pin</div>`}
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: ${!readOnly}, dragging: ${!readOnly}, scrollWheelZoom: ${!readOnly}, doubleClickZoom: ${!readOnly}, boxZoom: ${!readOnly}, keyboard: ${!readOnly} }).setView([${currentLat}, ${currentLon}], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
        var marker = L.marker([${currentLat}, ${currentLon}], { draggable: ${!readOnly} }).addTo(map);
        ${
          !readOnly
            ? `
        map.on('click', function(e) { window.parent.postMessage({ type: 'OSM_MAP_CLICK', lat: e.latlng.lat, lon: e.latlng.lng }, '*'); marker.setLatLng(e.latlng); });
        marker.on('dragend', function(e) { window.parent.postMessage({ type: 'OSM_MAP_CLICK', lat: marker.getLatLng().lat, lon: marker.getLatLng().lng }, '*'); });
        `
            : ""
        }
        window.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'OSM_MAP_PAN') {
            map.setView([event.data.lat, event.data.lon], 14);
            marker.setLatLng([event.data.lat, event.data.lon]);
          }
        });
      </script>
    </body>
    </html>
  `;
}
