// Initialize the map with a default center and zoom level
var map = L.map('map').setView([32.6584566, 51.6564164], 14.8); // Default to London coordinates

// Add the tile layer to the map (you can choose another provider or style)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add a marker at the specified location
var defaultMarker = L.marker([32.658400, 51.655387]).addTo(map);

// Function to handle marker placement and display coordinates
function onMapClick(e) {
    // Remove existing markers (if any)
    if (window.marker) {
        map.removeLayer(window.marker);
    }

    // Add a new marker at the clicked location
    window.marker = L.marker(e.latlng).addTo(map);

    // Send latitude and longitude to parent file
    sendCoordinates(e.latlng)
}

// Set up event listener to detect map clicks
map.on('click', onMapClick);


function sendCoordinates(latlng) {
    window.parent.postMessage({'lat':latlng.lat, 'lng':latlng.lng}, "*"); // Use "*" for any origin or specify a target origin
}