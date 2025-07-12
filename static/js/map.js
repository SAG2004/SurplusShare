document.addEventListener('DOMContentLoaded', function () {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error("Map container with ID 'map' not found.");
        return;
    }

    // 🔷 FIX: If Leaflet has already initialized this container, reset it
    if (mapContainer._leaflet_id) {
        mapContainer._leaflet_id = null;
    }

    // --- User Data (you still need to inject the real userData from backend) ---
    const userData = window.userData || {
        latitude: 17.39351139023181,
        longitude: 78.44599175306729,
        address: "Ghouri Mansion, Asif Nagar, Hyderabad"
    };

    if (!userData.latitude || !userData.longitude) {
        console.error('User data is missing or incomplete:', userData);
        return;
    }

    const map = L.map('map').setView([userData.latitude, userData.longitude], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    const markers = [];

    const userIcon = L.divIcon({
        className: 'user-marker',
        html: '<i class="fas fa-user"></i>',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
    });

    const userMarker = L.marker([userData.latitude, userData.longitude], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<b>Your Location</b><br>${userData.address}`)
        .openPopup();

    markers.push(userMarker);

    fetch('/get_locations')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) {
                console.error("Fetched data is not an array:", data);
                return;
            }

            data.forEach(location => {
                if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
                    console.warn("Skipping location due to invalid coordinates:", location);
                    return;
                }

                const lat = location.latitude;
                const lon = location.longitude;

                let marker;
                let popupContent = '';

                if (location.role === 'listing') {
                    marker = L.marker([lat, lon], {
                        icon: L.divIcon({
                            className: 'listing-marker',
                            html: '<i class="fas fa-utensils"></i>',
                            iconSize: [30, 30],
                            iconAnchor: [15, 30]
                        })
                    });

                    popupContent = `
                        <div class="map-popup">
                            <h3>${location.name || 'N/A'}</h3>
                            <p><strong>Category:</strong> ${location.category || 'N/A'}</p>
                            <p><strong>Quantity:</strong> ${location.quantity ?? 'N/A'}</p>
                            <p><strong>Expires:</strong> ${location.expiry || 'N/A'}</p>
                            <p><strong>Donor:</strong> ${location.donor || 'N/A'}</p>
                            <p><strong>Address:</strong> ${location.address || 'N/A'}</p>
                            <a href="/listing/${location.id || '#'}" class="btn btn-sm">View Details</a>
                        </div>
                    `;
                } else {
                    let iconClass = 'fa-user';
                    let iconColor = '#FFC107';

                    if (location.role === 'charity') {
                        iconClass = 'fa-hands-helping';
                        iconColor = '#2196F3';
                    } else if (location.role === 'donor') {
                        iconClass = 'fa-store';
                        iconColor = '#4CAF50';
                    }

                    marker = L.marker([lat, lon], {
                        icon: L.divIcon({
                            className: 'custom-user-role-marker',
                            html: `<i class="fas ${iconClass}" style="color: ${iconColor}"></i>`,
                            iconSize: [30, 30],
                            iconAnchor: [15, 30]
                        })
                    });

                    popupContent = `
                        <div class="map-popup">
                            <h3>${location.name || 'N/A'}</h3>
                            <p><strong>Role:</strong> ${location.role || 'N/A'}</p>
                            ${location.organization ? `<p><strong>Organization:</strong> ${location.organization}</p>` : ''}
                            <p><strong>Address:</strong> ${location.address || 'N/A'}</p>
                            <a href="/conversation/${location.id || '#'}" class="btn btn-sm">Send Message</a>
                        </div>
                    `;
                }

                marker.addTo(map).bindPopup(popupContent);
                markers.push(marker);
            });

            if (markers.length > 0) {
                const group = new L.featureGroup(markers);
                map.fitBounds(group.getBounds().pad(0.1));
            } else {
                map.setView([userData.latitude, userData.longitude], 12);
            }
        })
        .catch(error => {
            console.error('Error fetching locations:', error);
            alert('Could not load locations. Please try again later.');
        });

    document.querySelectorAll('.map-controls .btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const type = this.getAttribute('data-type');
            alert(`Showing ${type} view. In a full implementation, this would filter map markers.`);
        });
    });
});
