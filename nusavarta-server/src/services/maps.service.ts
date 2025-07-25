import { Client, DirectionsRequest, DirectionsResponse, TravelMode } from '@googlemaps/google-maps-services-js';

const client = new Client({});

export interface RouteInfo {
  distance: string;
  duration: string;
  steps: string[];
}

export async function getDirections(
  origin: string, 
  destination: string, 
  mode: TravelMode = TravelMode.driving
): Promise<RouteInfo | null> {
  try {
    const request: DirectionsRequest = {
      params: {
        origin,
        destination,
        mode,
        key: process.env.GOOGLE_MAPS_API_KEY || '',
      },
    };

    const response: DirectionsResponse = await client.directions(request);
    
    if (response.data.routes.length === 0) {
      return null;
    }

    const route = response.data.routes[0];
    const leg = route.legs[0];

    // Fix TypeScript errors by adding proper typing
    const totalDistance = route.legs.reduce((total: number, leg: any) => {
      return total + (leg.distance?.value || 0);
    }, 0);

    const totalDuration = route.legs.reduce((total: number, leg: any) => {
      return total + (leg.duration?.value || 0);
    }, 0);

    const steps = leg.steps.map((step: any) => step.html_instructions);

    return {
      distance: leg.distance?.text || '',
      duration: leg.duration?.text || '',
      steps,
    };
  } catch (error) {
    console.error('Error getting directions:', error);
    return null;
  }
}