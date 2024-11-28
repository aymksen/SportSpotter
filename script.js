document.addEventListener('DOMContentLoaded', function() {
    const searchBar = document.querySelector('.search-bar input');
    const sportIcons = document.querySelectorAll('.sport-icon');
    const map = L.map('map').setView([51.960665, 7.626135], 13); // Center on Münster, Germany

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const markerLayerGroup = L.layerGroup().addTo(map);

    const sportIconMapping = {
        soccer: 'football-icon.png',
        tennis: 'tennis-icon.png',
        boules: 'boules.png',
        speckbrett: 'speckbrett.png',
        skateboard: 'skateboard.png',
        basketball: 'basketball.png',
        beachvolleyball: 'beachvolleyball.png',
        team_handball: 'team_handball.png',
        equestrian: 'equestrian.png',
        paintball: 'paintball.png',
        table_tennis:'table_tennis.png'
    };

    function createIcon(sport) {
        const iconUrl = sportIconMapping[sport] || 'default-icon.png';
        return L.icon({
            iconUrl: iconUrl,
            iconSize: [22, 22],
            iconAnchor: [15, 15], // Adjusted icon anchor
            popupAnchor: [0, -15]
        });
    }

    function getCentroid(coords) {
        let sumLat = 0;
        let sumLon = 0;
        for (let i = 0; i < coords.length; i++) {
            sumLat += coords[i][1];
            sumLon += coords[i][0];
        }
        return [sumLat / coords.length, sumLon / coords.length];
    }

    function getMarkerCoordinates(feature) {
        if (feature.geometry.type === 'Point') {
            return [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
        } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
            const exteriorRing = feature.geometry.coordinates[0];
            const centroid = getCentroid(exteriorRing);
            return centroid; // Return the centroid without swapping
        } else {
            console.warn('Unsupported geometry type:', feature.geometry.type);
            return [0, 0];
        }
    }

    function getPopupContent(feature) {
        const properties = feature.properties;
        return `
            <h3>${properties.sport}</h3>
            <p>Surface: ${properties.surface || 'N/A'}</p>
            ${properties.lit ? `<p>Lit: Yes</p>` : ''}
            ${properties.ref ? `<p>Ref: ${properties.ref}</p>` : ''}
            ${properties['addr:street'] ? `<p>Address: ${properties['addr:street']}, ${properties['addr:housenumber']}, ${properties['addr:postcode']} ${properties['addr:city']}</p>` : ''}
        `;
    }

    const markers = {}; // Object to hold markers for each sport

    fetch('data.geojson')
        .then(response => response.json())
        .then(data => {
            console.log('GeoJSON data loaded:', data);

            data.features.forEach(feature => {
                const sport = feature.properties.sport;
                if (!markers[sport]) markers[sport] = [];

                if (feature.geometry.type === 'Point') {
                    const coords = getMarkerCoordinates(feature);
                    const icon = createIcon(sport);
                    const marker = L.marker(coords, { icon: icon, sport: sport });
                    const popupContent = getPopupContent(feature);
                    marker.bindPopup(popupContent, { className: 'custom-popup' });
                    markers[sport].push(marker); // Add to sport-specific array
                } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
                    const centroid = getCentroid(feature.geometry.coordinates[0]);
                    const icon = createIcon(sport);
                    const marker = L.marker(centroid, { icon: icon, sport: sport }); // Use centroid without swapping
                    const popupContent = getPopupContent(feature);
                    marker.bindPopup(popupContent, { className: 'custom-popup' });
                    markers[sport].push(marker); // Add to sport-specific array

                    const polygon = L.polygon(feature.geometry.coordinates[0].map(coord => [coord[1], coord[0]]), { color: 'blue', fillOpacity: 0.2 }); // Swap lat and lon for polygon
                    polygon.bindPopup(popupContent, { className: 'custom-popup' });
                    markers[sport].push(polygon);
                }
            });
        })
        .catch(error => {
            console.error('Error loading GeoJSON:', error);
            console.error('Detailed error:', error.message);
        });

    // Show markers for the selected sport and zoom to their bounds
    sportIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const sport = this.getAttribute('data-sport');
            console.log('Selected sport:', sport);

            markerLayerGroup.clearLayers();

            if (markers[sport] && markers[sport].length > 0) {
                markers[sport].forEach(marker => {
                    markerLayerGroup.addLayer(marker);
                });

                const bounds = L.featureGroup(markers[sport]).getBounds();
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
                } else {
                    map.setView([51.960665, 7.626135], 13); // Center on Münster
                }
            } else {
                console.log(`No locations found for sport: ${sport}`);
                map.setView([51.960665, 7.626135], 13); // Center on Münster
            }
        });
    });

    searchBar.addEventListener('input', function() {
        const searchTerm = searchBar.value.toLowerCase();
        sportIcons.forEach(icon => {
            const sportName = icon.getAttribute('data-sport');
            if (sportName.toLowerCase().includes(searchTerm)) {
                icon.style.display = 'flex';
            } else {
                icon.style.display = 'none';
            }
        });
    });
});