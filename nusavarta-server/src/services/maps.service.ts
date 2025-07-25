import { Client, DirectionsRequest, TravelMode } from "@googlemaps/google-maps-services-js";
import { database, CulturalInfo } from '../data/culturalData';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({});

// Fungsi untuk mencari waypoints budaya di antara dua lokasi
function findWaypoints(originCoords: any, destCoords: any): CulturalInfo[] {
  // Logika sederhana: cari landmark di dalam "kotak" geografis antara origin dan destination
    const latMin = Math.min(originCoords.lat, destCoords.lat);
    const latMax = Math.max(originCoords.lat, destCoords.lat);
    const lngMin = Math.min(originCoords.lng, destCoords.lng);
    const lngMax = Math.max(originCoords.lng, destCoords.lng);

    return database.filter(item =>
        item.coordinates.latitude > latMin &&
        item.coordinates.latitude < latMax &&
        item.coordinates.longitude > lngMin &&
        item.coordinates.longitude < lngMax
    );
}

export async function getDirectionsWithWaypoints(origin: string, destination: string, withCulture: boolean) {
  // Untuk produksi, Anda akan menggunakan Geocoding API untuk mengubah nama tempat menjadi koordinat.
  // Di sini kita gunakan data dummy untuk simplicity.
  const originData = database.find(d => d.name.toLowerCase() === origin.toLowerCase()) || { coordinates: { latitude: -6.9218, longitude: 107.6019 } }; // Dummy: Stasiun Bandung
  const destinationData = database.find(d => d.name.toLowerCase() === destination.toLowerCase()) || { coordinates: { latitude: -6.9000, longitude: 107.6215 } }; // Dummy: Museum Geologi

    let waypoints: CulturalInfo[] = [];
    if (withCulture) {
        waypoints = findWaypoints(originData.coordinates, destinationData.coordinates);
    }
    
    const requestParams: DirectionsRequest['params'] = {
        origin: { lat: originData.coordinates.latitude, lng: originData.coordinates.longitude },
        destination: { lat: destinationData.coordinates.latitude, lng: destinationData.coordinates.longitude },
        waypoints: waypoints.map(wp => ({ lat: wp.coordinates.latitude, lng: wp.coordinates.longitude })),
        optimize: true,
        mode: TravelMode.driving,
        key: process.env.Maps_API_KEY as string,
    };

    const response = await client.directions({ params: requestParams });
    const route = response.data.routes[0];
    if (!route) throw new Error("Rute tidak ditemukan");

    const markers = [
        { type: 'origin', title: origin, coordinates: route.legs[0].start_location },
        ...waypoints.map((wp, index) => ({ 
        type: 'waypoint', 
        title: wp.name, 
        description: wp.description, 
        coordinates: route.legs[index].end_location // Gunakan lokasi dari respons agar akurat
        })),
        { type: 'destination', title: destination, coordinates: route.legs[route.legs.length - 1].end_location },
    ];

    return {
        polyline: route.overview_polyline.points,
        markers,
        summary: {
        distance: route.legs.reduce((total, leg) => total + (leg.distance?.value || 0), 0),
        duration: route.legs.reduce((total, leg) => total + (leg.duration?.value || 0), 0),
        }
    };
}