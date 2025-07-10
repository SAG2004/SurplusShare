document.addEventListener('DOMContentLoaded', function() {
    // Check if the map container exists
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error("Map container with ID 'map' not found.");
        return; // Stop execution if no map container
    }

    // --- FIX: Proper map destruction/initialization ---
    // If you need to re-initialize the map on subsequent DOMContentLoaded events
    // (e.g., if this script runs multiple times on a single page navigation),
    // it's best to remove the existing map instance if it exists.
    // However, for typical single-page loads, this might not be necessary.
    // If 'map' variable is globally accessible:
    // if (window.myLeafletMap) {
    //     window.myLeafletMap.remove();
    // }

    // --- User Data (Example - You need to populate this) ---
    // This is crucial. Ensure 'userData' is defined and has 'latitude', 'longitude', and 'address'.
    // In a real application, this would come from your backend or client-side detection.
    const userData = {
        latitude: 17.39351139023181,
        longitude: 78.44599175306729,
        address: "Ghouri Mansion, Asif Nagar, Hyderabad"
    };
     

    // Initialize the map
    // window.myLeafletMap = L.map('map').setView([userData.latitude, userData.longitude], 12); // If making map global
    const map = L.map('map').setView([userData.latitude, userData.longitude], 12);


    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19, // Optional: Set max zoom level
    }).addTo(map);

    // Add user marker
    const userIcon = L.divIcon({
        className: 'user-marker',
        html: '<i class="fas fa-user"></i>',
        iconSize: [30, 30],
        iconAnchor: [15, 30] // Position the icon's tip
    });

    const userMarker = L.marker([userData.latitude, userData.longitude], {icon: userIcon})
        .addTo(map)
        .bindPopup(`<b>Your Location</b><br>${userData.address}`)
        .openPopup(); // Open popup immediately for user

    // Fetch locations from server
    fetch('/get_locations')
    .then(response => {
        if (!response.ok) {
            // Handle HTTP errors
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const markers = [];
        markers.push(userMarker); // Include the user marker in the array for fitting bounds

        if (!Array.isArray(data)) {
            console.error("Fetched data is not an array:", data);
            return;
        }

        data.forEach(location => {
            let marker;
            let popupContent = '';

            // Basic validation for location data
            if (typeof location.lat !== 'number' || typeof location.lon !== 'number') {
                console.warn("Skipping location due to invalid coordinates:", location);
                return; // Skip this iteration if coordinates are invalid
            }

            if (location.role === 'listing') {
                marker = L.marker([location.lat, location.lon], {
                    icon: L.divIcon({
                        className: 'listing-marker',
                        html: '<i class="fas fa-utensils"></i>',
                        iconSize: [30, 30],
                        iconAnchor: [15, 30]
                    })
                });

                // Ensure data fields exist to avoid 'undefined' in popup
                const name = location.name || 'N/A';
                const category = location.category || 'N/A';
                const quantity = location.quantity !== undefined ? location.quantity : 'N/A';
                const expiry = location.expiry || 'N/A';
                const donor = location.donor || 'N/A';
                const address = location.address || 'N/A';
                const listingId = location.id || '#';

                popupContent = `
                    <div class="map-popup">
                        <h3>${name}</h3>
                        <p><strong>Category:</strong> ${category}</p>
                        <p><strong>Quantity:</strong> ${quantity}</p>
                        <p><strong>Expires:</strong> ${expiry}</p>
                        <p><strong>Donor:</strong> ${donor}</p>
                        <p><strong>Address:</strong> ${address}</p>
                        <a href="/listing/${listingId}" class="btn btn-sm">View Details</a>
                    </div>
                `;
            } else {
                let iconClass = 'fa-user';
                let iconColor = '#FFC107'; // recipient by default

                if (location.role === 'charity') {
                    iconClass = 'fa-hands-helping';
                    iconColor = '#2196F3';
                } else if (location.role === 'donor') {
                    iconClass = 'fa-store';
                    iconColor = '#4CAF50';
                }

                marker = L.marker([location.lat, location.lon], {
                    icon: L.divIcon({
                        className: 'custom-user-role-marker', // More specific class
                        html: `<i class="fas ${iconClass}" style="color: ${iconColor}"></i>`,
                        iconSize: [30, 30],
                        iconAnchor: [15, 30]
                    })
                });

                const name = location.name || 'N/A';
                const role = location.role || 'N/A';
                const organization = location.organization || ''; // Can be empty
                const address = location.address || 'N/A';
                const conversationId = location.id || '#';

                let orgHTML = organization ? `<p><strong>Organization:</strong> ${organization}</p>` : '';

                popupContent = `
                    <div class="map-popup">
                        <h3>${name}</h3>
                        <p><strong>Role:</strong> ${role}</p>
                        ${orgHTML}
                        <p><strong>Address:</strong> ${address}</p>
                        <a href="/conversation/${conversationId}" class="btn btn-sm">Send Message</a>
                    </div>
                `;
            }

            marker.addTo(map).bindPopup(popupContent);
            markers.push(marker); // Add to array for fitBounds
        });

        // Fit to all markers, including userMarker
        if (markers.length > 0) {
            const group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
        } else {
            // If no other markers, just ensure user marker is visible
            map.setView([userData.latitude, userData.longitude], 12);
        }
    })
    .catch(error => {
        console.error('Error fetching locations:', error);
        // Display a user-friendly message on the map or page
        alert('Could not load locations. Please try again later.');
    });

    // Update map view based on user role (placeholder remains)
    document.querySelectorAll('.map-controls .btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            alert(`Showing ${type} view. In a full implementation, this would filter map markers.`);
        });
    });
});