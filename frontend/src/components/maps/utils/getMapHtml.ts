export function getMapHtml(
  currentLat: number,
  currentLon: number,
  readOnly: boolean,
) {
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
        .info-panel { position: absolute; top: 10px; right: 10px; background: rgba(255, 255, 255, 0.95); padding: 8px 12px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.2); z-index: 1000; font-size: 11px; font-weight: 600; color: #333; pointer-events: none; }
      </style>
    </head>
    <body>
      ${readOnly ? "" : `<div class="info-panel">📍 Click map to position the exact venue pin</div>`}
      <div id="map"></div>
      ${
        isOffline
          ? `
      <script>
        function initOfflineMap() {
          if (typeof maplibregl === 'undefined') {
            setTimeout(initOfflineMap, 50);
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
              center: [${currentLon}, ${currentLat}],
              zoom: 13
            },
            center: [${currentLon}, ${currentLat}],
            zoom: 13,
            interactive: ${!readOnly}
          });

          var marker = new maplibregl.Marker({ draggable: ${!readOnly} })
            .setLngLat([${currentLon}, ${currentLat}])
            .addTo(map);

          ${
            !readOnly
              ? `
          map.on('click', function(e) {
            window.parent.postMessage({ type: 'OSM_MAP_CLICK', lat: e.lngLat.lat, lon: e.lngLat.lng }, '*');
            marker.setLngLat(e.lngLat);
          });
          marker.on('dragend', function() {
            var lngLat = marker.getLngLat();
            window.parent.postMessage({ type: 'OSM_MAP_CLICK', lat: lngLat.lat, lon: lngLat.lng }, '*');
          });
          `
              : ""
          }

          window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'OSM_MAP_PAN') {
              map.flyTo({ center: [event.data.lon, event.data.lat], zoom: 14 });
              marker.setLngLat([event.data.lon, event.data.lat]);
            }
          });
        }
        if (document.readyState === 'complete') {
          initOfflineMap();
        } else {
          window.addEventListener('load', initOfflineMap);
        }
      </script>
      `
          : `
      <script>
        function initOnlineMap() {
          if (typeof L === 'undefined') {
            setTimeout(initOnlineMap, 50);
            return;
          }
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
        }
        if (document.readyState === 'complete') {
          initOnlineMap();
        } else {
          window.addEventListener('load', initOnlineMap);
        }
      </script>
      `
      }
    </body>
    </html>
  `;
}
