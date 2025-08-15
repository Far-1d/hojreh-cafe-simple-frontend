// Initialize the map with a default center and zoom level
var map = L.map('map').setView([32.6584566, 51.6561264], 14.8); // Default to London coordinates

// Add the tile layer to the map (you can choose another provider or style)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: ''
}).addTo(map);

// custom icon
var redPin = L.icon({
    iconUrl: '/images/pin.png',

    iconSize:     [44, 44], // size of the icon
    iconAnchor:   [22, 44], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -50] // point from which the popup should open relative to the iconAnchor
});
// Add a marker at the specified location
var defaultMarker = L.marker([32.658352, 51.6553068], {icon: redPin}).addTo(map);
defaultMarker.bindPopup("کافه حجره").openPopup();

// Function to handle marker placement and display coordinates
function onMapClick(e) {
    e.originalEvent.preventDefault();
    // // Remove existing markers (if any)
    // if (window.marker) {
    //     map.removeLayer(window.marker);
    // }

    // // Add a new marker at the clicked location
    // window.marker = L.marker(e.latlng).addTo(map);

    // // Send latitude and longitude to parent file
    // sendCoordinates(e.latlng)
}

// Set up event listener to detect map clicks
map.on('click', onMapClick);


function sendCoordinates(latlng) {
    window.parent.postMessage({'lat':latlng.lat, 'lng':latlng.lng}, "*"); // Use "*" for any origin or specify a target origin
}