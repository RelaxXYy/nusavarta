import axios from 'axios';

export interface RouteInfo {
  distance: string;
  duration: string;
  steps: string[];
  coordinates: number[][];
}

export interface DirectionsResponse {
  routes: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: number[][];
    };
    legs: Array<{
      distance: number;
      duration: number;
      steps: Array<{
        instruction: string;
        distance: number;
        duration: number;
      }>;
    }>;
  }>;
}

// Convert address to coordinates using MapTiler Geocoding
async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await axios.get(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(address)}.json`,
      {
        params: {
          key: process.env.MAPTILER_API_KEY,
          limit: 1
        }
      }
    );

    if (response.data.features && response.data.features.length > 0) {
      const coordinates = response.data.features[0].geometry.coordinates;
      return {
        lng: coordinates[0],
        lat: coordinates[1]
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Get directions using MapTiler Directions API
export async function getDirections(
  origin: string, 
  destination: string, 
  mode: 'driving' | 'walking' | 'cycling' = 'driving'
): Promise<RouteInfo | null> {
  try {
    // Convert addresses to coordinates
    const originCoords = await geocode(origin);
    const destCoords = await geocode(destination);

    if (!originCoords || !destCoords) {
      console.error('Failed to geocode addresses');
      return null;
    }

    // Get directions
    const response = await axios.get(
      `https://api.maptiler.com/directions/${mode}/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}`,
      {
        params: {
          key: process.env.MAPTILER_API_KEY,
          geometries: 'geojson',
          steps: 'true'
        }
      }
    );

    const data: DirectionsResponse = response.data;

    if (!data.routes || data.routes.length === 0) {
      return null;
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    // Format distance (convert meters to km)
    const distanceKm = (route.distance / 1000).toFixed(1);
    const distanceText = `${distanceKm} km`;

    // Format duration (convert seconds to minutes/hours)
    const durationMinutes = Math.round(route.duration / 60);
    const durationText = durationMinutes >= 60 
      ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
      : `${durationMinutes} menit`;

    // Extract step instructions
    const steps = leg.steps.map(step => step.instruction);

    return {
      distance: distanceText,
      duration: durationText,
      steps,
      coordinates: route.geometry.coordinates
    };
  } catch (error) {
    console.error('Error getting directions:', error);
    return null;
  }
}

// Enhanced function with cultural waypoints
export async function getDirectionsWithWaypoints(
  origin: string,
  destination: string,
  includeCulturalSites: boolean = false
): Promise<RouteInfo | null> {
  try {
    // For now, use basic directions
    // You can enhance this later to include cultural waypoints
    const basicRoute = await getDirections(origin, destination, 'driving');

    if (!basicRoute) {
      return null;
    }

    // If cultural sites are requested, you can add waypoints logic here
    if (includeCulturalSites) {
      // TODO: Add logic to find cultural sites between origin and destination
      // and create a route with waypoints
      basicRoute.steps.unshift('🏛️ Rute ini akan melewati beberapa tempat bersejarah menarik!');
    }

    return basicRoute;
  } catch (error) {
    console.error('Error getting directions with waypoints:', error);
    return null;
  }
}