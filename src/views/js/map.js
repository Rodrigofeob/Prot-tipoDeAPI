let map;
const unifeobLocation = { lat: -21.9747, lng: -46.7936 }; // UNIFEOB coordinates

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: unifeobLocation,
        zoom: 15
    });

    // Add marker for UNIFEOB
    const marker = new google.maps.Marker({
        position: unifeobLocation,
        map: map,
        title: 'UNIFEOB'
    });
}

function getDirections() {
    // Open Google Maps directions in a new tab
    const destination = encodeURIComponent('UNIFEOB, São João da Boa Vista, SP');
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
}

// Initialize map when the page loads
window.addEventListener('load', initMap); 