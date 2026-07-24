export function getPreviewMapHtml(lat: number, lon: number, popupText: string) {
  const isOffline = process.env.NEXT_PUBLIC_OFFLINE_MAPS === "true";
  const cssUrl = isOffline
    ? "/leaflet/maplibre-gl.css"
    : "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  const jsUrl = isOffline
    ? "/leaflet/maplibre-gl.js"
    : "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <link rel="stylesheet" href="${cssUrl}" />
      <script src="${jsUrl}"></script>
      <style>
        body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      ${isOffline ? `
      <script>
        function initOfflinePreviewMap() {
          if (typeof maplibregl === 'undefined') {
            setTimeout(initOfflinePreviewMap, 50);
            return;
          }
          var map = new maplibregl.Map({
            container: 'map',
            style: {
              version: 8,
              sources: {
                'openmaptiles': {
                  type: 'vector',
                  url: 'http://localhost:8080/data/openmaptiles.json'
                }
              },
              layers: [
                { id: 'background', type: 'background', paint: { 'background-color': '#f4f1ea' } },
                { id: 'water', type: 'fill', source: 'openmaptiles', 'source-layer': 'water', paint: { 'fill-color': '#a5c9eb' } },
                { id: 'landuse', type: 'fill', source: 'openmaptiles', 'source-layer': 'landuse', paint: { 'fill-color': '#e2ebd8' } },
                { id: 'landcover', type: 'fill', source: 'openmaptiles', 'source-layer': 'landcover', paint: { 'fill-color': '#d6e5c9' } },
                { id: 'park', type: 'fill', source: 'openmaptiles', 'source-layer': 'park', paint: { 'fill-color': '#cae2b9' } },
                { id: 'boundary', type: 'line', source: 'openmaptiles', 'source-layer': 'boundary', paint: { 'line-color': '#9e9cab', 'line-width': 1 } },
                { id: 'transportation', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation', paint: { 'line-color': '#f8b195', 'line-width': 2 } },
                { id: 'building', type: 'fill', source: 'openmaptiles', 'source-layer': 'building', paint: { 'fill-color': '#d8d5d0' } }
              ],
              center: [${lon}, ${lat}],
              zoom: 13
            },
            center: [${lon}, ${lat}],
            zoom: 13
          });

          var popup = new maplibregl.Popup({ offset: 25 })
            .setHTML("<b>Event Location</b><br/>${popupText.replace(/"/g, '\\"')}");

          new maplibregl.Marker()
            .setLngLat([${lon}, ${lat}])
            .setPopup(popup)
            .addTo(map);
        }
        if (document.readyState === 'complete') {
          initOfflinePreviewMap();
        } else {
          window.addEventListener('load', initOfflinePreviewMap);
        }
      </script>
      `
      : `
      <script>
        function initOnlinePreviewMap() {
          if (typeof L === 'undefined') {
            setTimeout(initOnlinePreviewMap, 50);
            return;
          }
          var map = L.map('map', { zoomControl: true }).setView([${lat}, ${lon}], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
          }).addTo(map);
          
          L.marker([${lat}, ${lon}]).addTo(map)
            .bindPopup("<b>Event Location</b><br/>${popupText.replace(/"/g, '\\"')}");
        }
        if (document.readyState === 'complete') {
          initOnlinePreviewMap();
        } else {
          window.addEventListener('load', initOnlinePreviewMap);
        }
      </script>
      `
    }
    </body>
    </html>
  `;
}
