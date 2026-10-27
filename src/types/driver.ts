export type DriverType = 'standard' | 'premium';
export type FilterCategory = 'all' | 'standard' | 'premium';

export interface Coordinate {
  latitude: number;
  longitude: number;
  heading?: number; // angle in degrees for vehicle orientation
}

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  type: DriverType;
  coordinate: Coordinate;
  carModel: string;
  licensePlate: string;
  etaMinutes: number;
  fareEstimate: string;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
