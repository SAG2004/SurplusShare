document.addEventListener('DOMContentLoaded', function () {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error("Map container with ID 'map' not found.");
        return;
    }

    const map = L.map('map').setView([userData.latitude, userData.longitude], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }).addTo(map);

    // User marker
    const userMarker = L.marker([userData.latitude, userData.longitude], {
        icon: L.divIcon({
            className: 'marker-circle',
            html: `<i class="fas fa-user fa-lg" style="color:black;"></i>`,
            iconSize: [36, 36],
            iconAnchor: [18, 36]
        })
    })
    .addTo(map)
    .bindPopup(`<b>Your Location</b><br>${userData.address}`)
    .openPopup();

    fetch('/get_locations')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const markers = [userMarker];

            if (!Array.isArray(data)) {
                console.error("Fetched data is not an array:", data);
                return;
            }

            data.forEach(location => {
                let marker;
                let popupContent = '';

                if (typeof location.lat !== 'number' || typeof location.lon !== 'number') {
                    console.warn("Skipping location due to invalid coordinates:", location);
                    return;
                }

                if (location.role === 'listing') {
                    marker = L.marker([location.lat, location.lon], {
                        icon: L.divIcon({
                            className: 'marker-circle',
                            html: `<i class="fas fa-utensils fa-lg" style="color:purple;"></i>`,
                            iconSize: [36, 36],
                            iconAnchor: [18, 36]
                        })
                    });

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
                    let iconColor = '#FFC107';

                    if (location.role === 'charity') {
                        iconClass = 'fa-hands-helping';
                        iconColor = '#2196F3';
                    } else if (location.role === 'donor') {
                        iconClass = 'fa-store';
                        iconColor = '#4CAF50';
                    }

                    marker = L.marker([location.lat, location.lon], {
                        icon: L.divIcon({
                            className: 'marker-circle',
                            html: `<i class="fas ${iconClass} fa-lg" style="color:${iconColor};"></i>`,
                            iconSize: [36, 36],
                            iconAnchor: [18, 36]
                        })
                    });

                    const name = location.name || 'N/A';
                    const role = location.role || 'N/A';
                    const organization = location.organization || '';
                    const address = location.address || 'N/A';
                    const conversationId = location.id || '#';

                    const orgHTML = organization ? `<p><strong>Organization:</strong> ${organization}</p>` : '';

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
