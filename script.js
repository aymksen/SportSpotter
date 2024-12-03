document.addEventListener('DOMContentLoaded', function() {
    const searchBar = document.querySelector('.search-bar input');
    const sportIcons = document.querySelectorAll('.sport-icon');
    const map = L.map('map').setView([51.960665, 7.626135], 13); // Center on Münster, Germany








  // Define image URLs
const lightImage = 'satellite-preview.png';
const darkImage = 'default-preview.png';

const lightLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const darkLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; CartoDB'
});

// Function to set the map theme
function setMapTheme(theme) {
    if (theme === 'light') {
        map.removeLayer(darkLayer);
        lightLayer.addTo(map);
    } else if (theme === 'dark') {
        map.removeLayer(lightLayer);
        darkLayer.addTo(map);
    }
}

// Initialize the theme
let currentTheme = 'light';
setMapTheme('light');
document.getElementById('theme-toggle').style.backgroundImage = 'url(' + lightImage + ')';

// Event listener for theme toggle
document.getElementById('theme-toggle').addEventListener('click', function() {
    if (currentTheme === 'light') {
        currentTheme = 'dark';
        this.style.backgroundImage = 'url(' + darkImage + ')';
        setMapTheme('dark');
    } else {
        currentTheme = 'light';
        this.style.backgroundImage = 'url(' + lightImage + ')';
        setMapTheme('light');
    }
});


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const LocationControl = L.Control.extend({
        options: { position: 'bottomright' },

        onAdd: function(map) {
            const container = L.DomUtil.create('div', ' leaflet-control location-control');
            const button = L.DomUtil.create('a', 'leaflet-control-location', container);
            button.href = '#';
            button.title = 'Show my location';

            const icon = L.DomUtil.create('img', 'location-icon', button);
            icon.src = 'icons/location-icon.png';
            icon.alt = 'Track Location';

            button.addEventListener('click', () => {
                requestLocationTracking(true);
            });

            return container;
        }
    });

    map.addControl(new LocationControl());

    let userLocationMarker = null;

    function requestLocationTracking(centerMap = false) {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    if (userLocationMarker) {
                        map.removeLayer(userLocationMarker);
                    }

                    const userIcon = L.divIcon({
                        className: 'user-location-icon',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    });

                    userLocationMarker = L.marker([latitude, longitude], { 
                        icon: userIcon,
                        zIndexOffset: 1000
                    }).addTo(map);

                    if (centerMap) {
                        map.setView([latitude, longitude], 15);
                    }
                },
                (error) => {
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            alert("Location access denied. Please enable location permissions.");
                            break;
                        case error.POSITION_UNAVAILABLE:
                            alert("Location information is unavailable.");
                            break;
                        case error.TIMEOUT:
                            alert("Location request timed out.");
                            break;
                        default:
                            alert("An unknown error occurred with location tracking.");
                    }
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 30000,
                    timeout: 27000
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }

    // Continuous location tracking without zooming
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                if (userLocationMarker) {
                    map.removeLayer(userLocationMarker);
                }

                const userIcon = L.divIcon({
                    className: 'user-location-icon',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });

                userLocationMarker = L.marker([latitude, longitude], { 
                    icon: userIcon,
                    zIndexOffset: 1000
                }).addTo(map);
            },
            null,
            {
                enableHighAccuracy: true,
                maximumAge: 30000,
                timeout: 27000
            }
        );
    }

    const markerLayerGroup = L.layerGroup().addTo(map);

    const sportIconMapping = {
        soccer: 'icons/football-icon.png',
        tennis: 'icons/tennis-icon.png',
        boules: 'icons/boules.png',
        speckbrett: 'icons/speckbrett.png',
        skateboard: 'icons/skateboard.png',
        basketball: 'icons/basketball.png',
        beachvolleyball: 'icons/beachvolleyball.png',
        team_handball: 'icons/team_handball.png',
        equestrian: 'icons/equestrian.png',
        paintball: 'icons/paintball.png',
        table_tennis: 'icons/table_tennis.png',
        archery: 'icons/archery.png'
    };

    function createIcon(sport) {
        const iconUrl = sportIconMapping[sport] || 'default-icon.png';
        return L.icon({
            iconUrl: iconUrl,
            iconSize: [22, 22],
            iconAnchor: [11, 11], // Updated icon anchor
            popupAnchor: [0, -11]
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
            return centroid;
        } else {
            console.warn('Unsupported geometry type:', feature.geometry.type);
            return [0, 0];
        }
    }

    function getPopupContent(feature) {
        const properties = feature.properties;
        const coords = getMarkerCoordinates(feature);
        return `
            <h3>${properties.sport}</h3>
            <p>Surface: ${properties.surface || 'N/A'}</p>
            ${properties.lit ? `<p>Lit: Yes</p>` : ''}
            ${properties.ref ? `<p>Ref: ${properties.ref}</p>` : ''}
            ${properties['addr:street'] ? `<p>Address: ${properties['addr:street']}, ${properties['addr:housenumber']}, ${properties['addr:postcode']} ${properties['addr:city']}</p>` : ''}
            <button class="navigate-btn" data-lat="${coords[0]}" data-lon="${coords[1]}">Navigate ➤</button>
        `;
    }

    const markers = {}; // Object to hold markers for each sport

    fetch('data.geojson')
        .then(response => response.json())
        .then(data => {
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

            markerLayerGroup.clearLayers();

            if (markers[sport] && markers[sport].length > 0) {
                markers[sport].forEach(marker => {
                    markerLayerGroup.addLayer(marker);
                });

                const bounds = L.featureGroup(markers[sport]).getBounds();
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
                } else {
                    map.setView([51.960665, 7.626135], 13); // Center on Münster, Germany
                }
            } else {
                console.log(`No locations found for sport: ${sport}`);
                map.setView([51.960665, 7.626135], 13); // Center on Münster, Germany
            }
        });
    });

    searchBar.addEventListener('input', function() {
        const searchTerm = searchBar.value.toLowerCase();
        sportIcons.forEach(icon => {
            const sportName = icon.getAttribute('data-sport');
            if (sportName.toLowerCase().includes(searchTerm)) {
                icon.style.display = 'block';
            } else {
                icon.style.display = 'none';
            }
        });
    });

    // Function to handle navigation
    function navigateToLocation(lat, lon) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
        window.open(url, '_blank');
    }

    // Event listener for "Navigate" button clicks
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('navigate-btn')) {
            const lat = event.target.getAttribute('data-lat');
            const lon = event.target.getAttribute('data-lon');
            navigateToLocation(lat, lon);
        }
    });

    const apiKey = '654312122f7fc94a9bceab9d0ff344b2'; // Replace with your API key
    const city = 'Münster';
    const country = 'DE';
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiKey}`;

    // Function to fetch and display weather
    function getWeather() {
        fetch(weatherUrl)
            .then(response => response.json())
            .then(data => {
                if (data.cod === 200) {
                    // Convert temperature from Kelvin to Celsius
                    const temperature = Math.round(data.main.temp - 273.15);
                    // Get weather icon
                    const iconCode = data.weather[0].icon;
                    const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;
                    // Update the weather widget
                    const weatherIcon = document.querySelector('.weather-widget img');
                    const weatherTemp = document.querySelector('.weather-widget span');
                    weatherIcon.src = iconUrl;
                    weatherTemp.textContent = `${temperature}°C`;
                } else {
                    console.error('Weather data not found:', data.message);
                }
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
            });
    }

    // Fetch weather data when the page loads
    getWeather();
});