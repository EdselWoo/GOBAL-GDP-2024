export interface GDPData {
  rank: number;
  countryName: string;
  isoCode: string; // ISO 3166-1 alpha-3
  gdpTrillions: number;
  growthRate: number;
  description: string;
}

export interface GlobePoint {
  lat: number;
  lng: number;
  label: string;
}

// GeoJSON types for D3
export interface GeoJSONFeature {
  type: "Feature";
  id: string; // Usually the 3-letter code
  properties: {
    name: string;
  };
  geometry: any;
}

export interface GeoJSONCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}