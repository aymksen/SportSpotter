document.addEventListener('DOMContentLoaded', function() {
    const searchBar = document.querySelector('.search-bar input');
    const sportIcons = document.querySelectorAll('.sport-icon');
    const map = L.map('map').setView([51.960665, 7.626135], 13); // Center on Münster, Germany

    // Initialize the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const markers = {};

    // Utility function to convert coordinates
    function convertCoordinates(coords) {
        // If it's a point (2D array), swap the coordinates
        if (coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
            return [coords[1], coords[0]];
        }
        
        // If it's a polygon or multipolygon, recursively convert
        return coords.map(coord => {
            if (Array.isArray(coord[0])) {
                return convertCoordinates(coord);
            }
            return [coord[1], coord[0]];
        });
    }

    // Load GeoJSON data
    fetch('data.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                pointToLayer: (feature, latlng) => {
                    // Convert coordinates for points
                    const convertedCoords = convertCoordinates(feature.geometry.coordinates);
                    
                    const sport = feature.properties.sport;
                    
                    const popupContent = `
                        <h3>${feature.properties.sport}</h3>
                        <p>Surface: ${feature.properties.surface || 'N/A'}</p>
                        ${feature.properties.lit ? `<p>Lit: Yes</p>` : ''}
                        ${feature.properties.ref ? `<p>Ref: ${feature.properties.ref}</p>` : ''}
                        ${feature.properties['addr:street'] ? `<p>Address: ${feature.properties['addr:street']}, ${feature.properties['addr:housenumber']}, ${feature.properties['addr:postcode']} ${feature.properties['addr:city']}</p>` : ''}
                    `;

                    const marker = L.marker(convertedCoords).addTo(map);
                    marker.bindPopup(popupContent, {
                        className: 'custom-popup'
                    });

                    if (!markers[sport]) markers[sport] = [];
                    markers[sport].push(marker);

                    return marker;
                },
                onEachFeature: (feature, layer) => {
                    const sport = feature.properties.sport;
                    const popupContent = `
                        <h3>${feature.properties.sport}</h3>
                        <p>Surface: ${feature.properties.surface || 'N/A'}</p>
                        ${feature.properties.lit ? `<p>Lit: Yes</p>` : ''}
                        ${feature.properties.ref ? `<p>Ref: ${feature.properties.ref}</p>` : ''}
                        ${feature.properties['addr:street'] ? `<p>Address: ${feature.properties['addr:street']}, ${feature.properties['addr:housenumber']}, ${feature.properties['addr:postcode']} ${feature.properties['addr:city']}</p>` : ''}
                    `;

                    if (feature.geometry.type === 'Polygon') {
                        // Convert polygon coordinates
                        const convertedPolygon = convertCoordinates(feature.geometry.coordinates);
                        const polygon = L.polygon(convertedPolygon).addTo(map);
                        polygon.bindPopup(popupContent, {
                            className: 'custom-popup'
                        });

                        if (!markers[sport]) markers[sport] = [];
                        markers[sport].push(polygon);
                    }
                }
            }).addTo(map);
        })
        .catch(error => {
            console.error('Error loading GeoJSON:', error);
            console.error('Detailed error:', error.message);
        });

    // Show markers for the selected sport
    sportIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const sport = this.getAttribute('data-sport');
            
            // Remove all existing layers except the base tile layer
            map.eachLayer(layer => {
                if (layer instanceof L.Marker || layer instanceof L.Polygon) {
                    map.removeLayer(layer);
                }
            });

            // Re-add markers for the selected sport
            if (markers[sport]) {
                markers[sport].forEach(marker => map.addLayer(marker));
                
                const bounds = L.featureGroup(markers[sport]).getBounds();
                if (bounds.isValid()) {
                    map.fitBounds(bounds, {
                        maxZoom: 15, // Set a maximum zoom level to avoid zooming out too much
                        padding: [50, 50] // Add some padding around the bounds
                    });
                } else {
                    map.setView([51.960665, 7.626135], 13); // Center on Münster if no valid bounds
                }
            } else {
                map.setView([51.960665, 7.626135], 13); // Center on Münster if no markers for the sport
            }
        });
    });

    // Expand marker on click and center map
    map.on('click', function(e) {
        const clickedLayer = e.layer;
        if (clickedLayer && (clickedLayer instanceof L.Marker || clickedLayer instanceof L.Polygon)) {
            clickedLayer.openPopup();
            if (clickedLayer instanceof L.Marker) {
                map.setView(clickedLayer.getLatLng(), 15);
            } else if (clickedLayer instanceof L.Polygon) {
                map.fitBounds(clickedLayer.getBounds(), {
                    padding: [50, 50] // Add some padding around the bounds
                });
            }
        }
    });

    // Basic search functionality
    searchBar.addEventListener('input', function() {
        const searchTerm = searchBar.value.toLowerCase();
        sportIcons.forEach(icon => {
            const sportName = icon.getAttribute('data-sport');
            if (sportName.includes(searchTerm)) {
                icon.style.display = 'flex';
            } else {
                icon.style.display = 'none';
            }
        });
    });
});