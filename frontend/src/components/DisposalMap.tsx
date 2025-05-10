import React, { useEffect, useState } from 'react';
import Map, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl';
import { MapPin } from 'lucide-react';
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';

interface DisposalPoint {
    id: string;
    name: string;
    type: string;
    latitude: number;
    longitude: number;
    address: string;
    acceptedTypes: string[];
    distance: number;
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaG9hbmdzb25iYW5kb24iLCJhIjoiY21haGpmdnBmMGN2YjJ3b2ttNnY2bnB3bCJ9.k5XhNkg-jOnqAtvWJJh8xg';

// Static dataset of waste collection points in Hanoi
const staticDisposalPoints: DisposalPoint[] = [
    {
        id: '1',
        name: 'Nghĩa Tân Collection Point',
        type: 'E-Waste Recycling',
        latitude: 21.0467,
        longitude: 105.7992,
        address: '45 Nghĩa Tân, Cầu Giấy, Hanoi',
        acceptedTypes: ['E-waste', 'Batteries', 'Electronics'],
        distance: 0,
    },
    {
        id: '2',
        name: 'Hoàn Kiếm Collection Point',
        type: 'E-Waste Recycling',
        latitude: 21.0333,
        longitude: 105.8500,
        address: '1 Trần Quang Khải, Hoàn Kiếm, Hanoi',
        acceptedTypes: ['E-waste', 'Batteries', 'Electronics'],
        distance: 0,
    },
    {
        id: '3',
        name: 'Quán Thánh Collection Point',
        type: 'E-Waste Recycling',
        latitude: 21.0417,
        longitude: 105.8422,
        address: '12-14 Phan Đình Phùng, Ba Đình, Hanoi',
        acceptedTypes: ['E-waste', 'Batteries', 'Electronics'],
        distance: 0,
    },
    {
        id: '4',
        name: 'Hanoi Recycling Center',
        type: 'Recycling Center',
        latitude: 21.03,
        longitude: 105.81,
        address: '123 Green Street, Hanoi',
        acceptedTypes: ['Plastic', 'Paper', 'Glass', 'Metal'],
        distance: 0,
    },
    {
        id: '5',
        name: 'General Waste Collection',
        type: 'Waste Disposal',
        latitude: 21.025,
        longitude: 105.805,
        address: '456 Tech Avenue, Hanoi',
        distance: 0,
        acceptedTypes: ['Organic', 'General Waste'],
    },
];

const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const DisposalMap: React.FC = () => {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [selectedPoint, setSelectedPoint] = useState<DisposalPoint | null>(null);
    const [disposalPoints, setDisposalPoints] = useState<DisposalPoint[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [route, setRoute] = useState<any>(null); // Store Mapbox Directions route
    const maxDistance = 10  // Maximum distance in km to filter disposal points;

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.longitude, position.coords.latitude]);
                },
                (err) => {
                    console.error('Error getting location:', err);
                    setUserLocation([21.02, 105.8]);
                    setError('Unable to get your location. Using default location (Hanoi).');
                }
            );
        }
    }, []);

    useEffect(() => {
        if (!userLocation || isNaN(userLocation[0]) || isNaN(userLocation[1])) {
            setError('Invalid user location. Cannot load disposal points.');
            return;
        }

        // Set static disposal points directly
        const points = staticDisposalPoints.map((point) => ({
            ...point,
            distance: calculateDistance(userLocation[1], userLocation[0], point.latitude, point.longitude),
        }));

        const filteredPoints = points
            .filter((point) => point.distance <= maxDistance)
            .sort((a, b) => a.distance - b.distance);

        setDisposalPoints(filteredPoints);
        setError(null);
    }, [userLocation]);

    // Fetch route when a point is selected
    useEffect(() => {
        const fetchRoute = async () => {
            if (!userLocation || !selectedPoint) {
                setRoute(null);
                return;
            }

            try {
                const response = await axios.get(
                    `https://api.mapbox.com/directions/v5/mapbox/walking/${userLocation[0]},${userLocation[1]};${selectedPoint.longitude},${selectedPoint.latitude}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
                );
                const routeData = response.data.routes[0]?.geometry;
                if (routeData) {
                    setRoute(routeData);
                } else {
                    setError('No route found to the selected point.');
                    setRoute(null);
                }
            } catch (err) {
                console.error('Error fetching route:', err);
                setError('Failed to load route.');
                setRoute(null);
            }
        };

        fetchRoute();
    }, [selectedPoint, userLocation]);

    const handleClearRoute = () => {
        setSelectedPoint(null);
        setRoute(null);
        setError(null);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-4">
            {/* Disposal Points List */}
            <div className="lg:w-1/3 bg-white rounded-lg shadow-sm p-4 max-h-[400px] overflow-y-auto">
                <h3 className="text-lg font-medium mb-4">Nearby Disposal Points</h3>
                {disposalPoints.length === 0 ? (
                    <p className="text-gray-600">No disposal points found within {maxDistance} km.</p>
                ) : (
                    <ul className="space-y-3">
                        {disposalPoints.map((point) => (
                            <li
                                key={point.id}
                                className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedPoint?.id === point.id
                                    ? 'bg-green-100'
                                    : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                                onClick={() => setSelectedPoint(point)}
                            >
                                <h4 className="font-medium text-sm">{point.name}</h4>
                                <p className="text-xs text-gray-600">{point.address}</p>
                                <p className="text-xs text-gray-600">
                                    Distance: {point.distance.toFixed(2)} km
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {point.acceptedTypes.map((type) => (
                                        <span
                                            key={type}
                                            className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full"
                                        >
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                {selectedPoint && (
                    <button
                        className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                        onClick={handleClearRoute}
                    >
                        Clear Route
                    </button>
                )}
            </div>

            {/* Map */}
            <div className="lg:w-2/3 h-[400px] rounded-lg overflow-hidden">
                {error && (
                    <div className="bg-red-100 text-red-700 p-2 mb-2 rounded">
                        {error}
                    </div>
                )}
                {userLocation ? (
                    <Map
                        mapboxAccessToken={MAPBOX_TOKEN}
                        initialViewState={{
                            longitude: userLocation[0],
                            latitude: userLocation[1],
                            zoom: 13,
                        }}
                        style={{ width: '100%', height: '100%' }}
                        mapStyle="mapbox://styles/mapbox/streets-v12"
                    >
                        <NavigationControl position="top-right" />

                        {/* User location marker */}
                        <Marker longitude={userLocation[0]} latitude={userLocation[1]} anchor="bottom">
                            <div className="text-blue-500 animate-bounce">
                                <MapPin size={24} />
                            </div>
                        </Marker>

                        {/* Disposal points markers */}
                        {disposalPoints.map((point) => (
                            <Marker
                                key={point.id}
                                longitude={point.longitude}
                                latitude={point.latitude}
                                anchor="bottom"
                                onClick={(e) => {
                                    e.originalEvent.stopPropagation();
                                    setSelectedPoint(point);
                                }}
                            >
                                <div
                                    className={`cursor-pointer transition-colors ${selectedPoint?.id === point.id
                                        ? 'text-green-800'
                                        : 'text-green-600 hover:text-green-700'
                                        }`}
                                >
                                    <MapPin size={24} />
                                </div>
                            </Marker>
                        ))}

                        {/* Route layer */}
                        {route && (
                            <Source id="route" type="geojson" data={{
                                type: 'Feature',
                                geometry: route,
                            }}>
                                <Layer
                                    id="route"
                                    type="line"
                                    paint={{
                                        'line-color': '#3b82f6',
                                        'line-width': 4,
                                        'line-opacity': 0.8,
                                    }}
                                />
                            </Source>
                        )}

                        {/* Popup for selected point */}
                        {selectedPoint && (
                            <Popup
                                longitude={selectedPoint.longitude}
                                latitude={selectedPoint.latitude}
                                anchor="bottom"
                                onClose={() => setSelectedPoint(null)}
                                className="z-10"
                            >
                                <div className="p-2">
                                    <h3 className="font-medium text-lg mb-1">{selectedPoint.name}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{selectedPoint.address}</p>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Distance: {selectedPoint.distance.toFixed(2)} km
                                    </p>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Accepted materials:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedPoint.acceptedTypes.map((type) => (
                                                <span
                                                    key={type}
                                                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                                                >
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        )}
                    </Map>
                ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                        <p className="text-gray-600">Loading map... Please allow location access.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisposalMap;