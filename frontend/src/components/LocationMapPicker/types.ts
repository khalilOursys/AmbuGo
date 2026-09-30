export interface Coordinates {
  latitude?: number;
  longitude?: number;
}

export interface LocationMapPickerProps {
  latitude?: number;
  longitude?: number;
  onChange: (coords: Coordinates) => void; // <-- accepts optional fields
  onReady?: () => void;
  height?: string | number;
  zoom?: number;
  defaultCenter?: [number, number];
  defaultZoom?: number;
  showLocateButton?: boolean;
  showClearButton?: boolean;
  showReadout?: boolean;
  showHint?: boolean;
  className?: string;
  readOnly?: boolean;
}