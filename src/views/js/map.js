function initMap() {
    try {
        const companyLocation = { lat: -21.9705, lng: -46.7916 };
        const mapElement = document.getElementById('map');
        
        if (!mapElement) {
            console.error('Map element not found');
            return;
        }

        // Check if google maps API is loaded
        if (!window.google || !window.google.maps) {
            console.error('Google Maps API not loaded');
            return;
        }

        const map = new google.maps.Map(mapElement, {
            zoom: 15,
            center: companyLocation,
            styles: [
                {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "on" }]
                }
            ]
        });

        const marker = new google.maps.Marker({
            position: companyLocation,
            map: map,
            title: 'Nossa Empresa'
        });

    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

function getDirections() {
    const companyLocation = { lat: -21.9705, lng: -46.7916 };
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${companyLocation.lat},${companyLocation.lng}`);
} 