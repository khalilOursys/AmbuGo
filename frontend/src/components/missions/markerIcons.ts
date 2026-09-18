import * as L from 'leaflet';

// ==================== Shared style ====================
const BASE_STYLE = `
  width: 40px;
  height: 40px;
  border: 3px solid #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.35);
`;

// ==================== PATIENT (face) ====================
export function createPatientIcon(): L.DivIcon {
  const html = `
    <div style="${BASE_STYLE} background: #dc2626;">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
        fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-marker custom-marker-patient',
    iconSize: [40, 40],
    // ✅ CENTER of the circle sits on the coordinate
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
}

// ==================== DESTINATION (hospital / home) ====================
export function createDestinationIcon(type?: string | null): L.DivIcon {
  const t = (type ?? '').toUpperCase();
  const isHospital = t === 'HOSPITAL' || t === 'CLINIC' || t === 'MEDICAL_CENTER';
  const isHome = t === 'RESIDENCE' || t === 'NURSING_HOME';

  let bg = '#16a34a';
  let svg = '';

  if (isHospital) {
    bg = '#2563eb';
    svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
        fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 7v10" />
        <path d="M7 12h10" />
      </svg>
    `;
  } else if (isHome) {
    bg = '#16a34a';
    svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
        fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 10l9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    `;
  } else {
    bg = '#16a34a';
    svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
        fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 21s-7-6.75-7-11a7 7 0 1 1 14 0c0 4.25-7 11-7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    `;
  }

  const html = `
    <div style="${BASE_STYLE} background: ${bg};">
      ${svg}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-marker custom-marker-destination',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
}

// ==================== VEHICLE ====================
export function createVehicleIcon(): L.DivIcon {
  const html = `
    <div style="${BASE_STYLE} background: #7c3aed;">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
        fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 16V7a1 1 0 0 1 1-1h10v10" />
        <path d="M14 8h4l3 4v4h-7" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-marker custom-marker-vehicle',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
}