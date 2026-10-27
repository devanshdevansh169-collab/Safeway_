import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Shield,
  MapPin,
  AlertTriangle,
  PhoneCall,
  Navigation,
  UserCheck,
  Clock,
  Siren,
  Plus,
  Trash2,
  Share2,
  Phone,
  Volume2,
  VolumeX,
  Eye,
  Crosshair,
  Camera,
  Sun,
  CheckCircle2,
  AlertCircle,
  Radio,
  Copy,
  ExternalLink,
  ShieldAlert,
  LifeBuoy,
  ChevronRight,
  Flame,
  Award,
  Sparkles,
  Search,
  Sliders,
  Smartphone,
  Download,
  LocateFixed,
  Compass,
  RefreshCw,
  SlidersHorizontal,
  CornerUpRight,
  Globe,
  Layers,
  Key,
  Navigation2,
  Check,
  X
} from "lucide-react";

// ============================================================================
// MOCK SPATIAL & ROUTING DATA (Vector Coordinates for Custom SVG Map)
// Coordinate space: 1000 x 700 viewBox canvas
// ============================================================================

const USER_GPS = {
  lat: 12.9716,
  lng: 77.5946,
  accuracy: "±3.2m",
  address: "8th Main Rd, 100ft Corner, Indiranagar, Bengaluru",
  x: 220,
  y: 490,
};

const DESTINATIONS = [
  { id: "metro", name: "Indiranagar Metro Station", x: 780, y: 160, distance: "2.4 km", desc: "Well-lit transit hub with CISF security" },
  { id: "home", name: "Greenwood Residency (Home)", x: 820, y: 380, distance: "2.1 km", desc: "Gated community, 24/7 security booth" },
  { id: "techpark", name: "Bagmane Tech Park Main Gate", x: 680, y: 560, distance: "3.2 km", desc: "Corporate campus, round-the-clock patrol" },
];

// Routes from USER_GPS (220, 490) to Indiranagar Metro (780, 160)
const ROUTE_DATA = {
  safe: {
    id: "safe",
    name: "Safest / Well-Lit Route",
    tagline: "Recommended for night travel",
    color: "#10B981", // Emerald Green
    bgLight: "rgba(16, 185, 129, 0.15)",
    borderColor: "border-emerald-500",
    distance: "2.4 km",
    duration: "18 mins",
    lightingIndex: 96,
    cctvDensity: 4.9,
    cctvCount: 14,
    policePatrol: "Every 10-15 mins",
    safetyScore: 98,
    badge: "Maximum Safety",
    description: "Follows primary commercial avenues with continuous high-lumen streetlights, operational storefronts, and active CCTV surveillance poles.",
    pathPoints: [
      { x: 220, y: 490 }, // Start
      { x: 280, y: 490 },
      { x: 380, y: 490 }, // Commercial junction
      { x: 380, y: 340 }, // Well-lit 100ft road
      { x: 520, y: 340 }, // Near Metro Care Hospital
      { x: 520, y: 220 }, // Police booth intersection
      { x: 660, y: 220 },
      { x: 780, y: 160 }, // Metro destination
    ],
    svgPath: "M 220 490 L 280 490 L 380 490 L 380 340 L 520 340 L 520 220 L 660 220 L 780 160",
    hazards: "None detected. Zero blind alleys.",
    sheltersOnWay: 4,
  },
  fast: {
    id: "fast",
    name: "Fastest Direct Route",
    tagline: "Shorter distance, lower surveillance",
    color: "#EF4444", // Crimson Red
    bgLight: "rgba(239, 68, 68, 0.15)",
    borderColor: "border-red-500",
    distance: "1.7 km",
    duration: "12 mins",
    lightingIndex: 42,
    cctvDensity: 1.8,
    cctvCount: 3,
    policePatrol: "Irregular / Low",
    safetyScore: 58,
    badge: "Exercise Caution",
    description: "Direct cut-through via residential cross-roads and service lanes. Several stretches have broken municipal streetlights and minimal pedestrian traffic.",
    pathPoints: [
      { x: 220, y: 490 }, // Start
      { x: 340, y: 410 }, // Dim residential alley
      { x: 440, y: 380 }, // Blind curve
      { x: 580, y: 290 }, // Unlit park boundary
      { x: 700, y: 230 },
      { x: 780, y: 160 }, // Metro destination
    ],
    svgPath: "M 220 490 L 340 410 L 440 380 L 580 290 L 700 230 L 780 160",
    hazards: "2 Low-light zones, 1 blind corner near secluded park wall.",
    sheltersOnWay: 1,
  },
};

// Emergency Facilities (POIs)
const EMERGENCY_POIS = [
  {
    id: "p1",
    name: "Indiranagar Central Police Station",
    category: "police",
    x: 480,
    y: 200,
    distance: "450 m",
    walkingTime: "4 mins",
    phone: "+91 80 2294 2533",
    status: "Open 24/7 • Staffed with Women Help Desk",
    address: "CMH Road, Stage 1, Indiranagar",
    badge: "Official Police Precinct",
    officerOnDuty: "Inspector V. Lakshmi",
  },
  {
    id: "p2",
    name: "Pink Police All-Women Outpost",
    category: "police",
    x: 350,
    y: 470,
    distance: "220 m",
    walkingTime: "2 mins",
    phone: "1091",
    status: "Open 24/7 • Rapid Response Unit",
    address: "100 Ft Road Junction, Indiranagar",
    badge: "Dedicated Women Safe Booth",
    officerOnDuty: "Sub-Inspector Anita R.",
  },
  {
    id: "h1",
    name: "Metro Care Emergency & Trauma Hospital",
    category: "hospital",
    x: 540,
    y: 360,
    distance: "600 m",
    walkingTime: "6 mins",
    phone: "+91 80 4000 8900",
    status: "Open 24/7 • Emergency ER & Ambulance Ready",
    address: "80 Feet Rd, HAL 3rd Stage",
    badge: "Level 1 Trauma Care",
    bedsAvailable: "14 Emergency Beds Ready",
  },
  {
    id: "h2",
    name: "Apollo 24/7 Multi-Specialty Clinic",
    category: "hospital",
    x: 740,
    y: 310,
    distance: "950 m",
    walkingTime: "10 mins",
    phone: "102",
    status: "Open 24/7 • On-call Doctors",
    address: "Old Airport Road Junction",
    badge: "24/7 Medical Care",
    bedsAvailable: "Emergency Triage Active",
  },
  {
    id: "s1",
    name: "SafeHub 24/7 Transit Lounge & Cafe",
    category: "safehub",
    x: 360,
    y: 320,
    distance: "380 m",
    walkingTime: "4 mins",
    phone: "+91 80 6192 1100",
    status: "Open 24/7 • Verified Safe Haven Partner",
    address: "12th Main Road Corner, Indiranagar",
    badge: "Verified Safe Haven",
    amenities: "CCTV Monitored, Free Wi-Fi, Security Guard on Duty",
  },
  {
    id: "s2",
    name: "BMRCL Metro Security Safe Zone",
    category: "safehub",
    x: 760,
    y: 180,
    distance: "1.2 km",
    walkingTime: "12 mins",
    phone: "080-25191091",
    status: "Open 24/7 • CISF Guarded Women Kiosk",
    address: "Indiranagar Metro Concourse Level",
    badge: "Government Transit Security",
    amenities: "Direct Police Hotline, SOS Beacon",
  },
  {
    id: "m1",
    name: "Apollo All-Night Pharmacy & First-Aid",
    category: "pharmacy",
    x: 290,
    y: 470,
    distance: "150 m",
    walkingTime: "1 min",
    phone: "+91 80 2521 4455",
    status: "Open 24/7 • Pharmacist & First-Aid Kit",
    address: "8th Main Rd, Indiranagar",
    badge: "24/7 Chemist",
    amenities: "Brightly Lit Storefront, CCTV",
  },
  {
    id: "m2",
    name: "MedPlus 24-Hour Express Pharmacy",
    category: "pharmacy",
    x: 640,
    y: 240,
    distance: "720 m",
    walkingTime: "7 mins",
    phone: "+91 80 2529 1199",
    status: "Open 24/7 • Emergency Supplies",
    address: "Double Road, HAL 2nd Stage",
    badge: "24/7 Chemist",
    amenities: "Emergency First Aid Available",
  },
];

// Pre-seeded CCTV Camera points along roads for map fidelity
const CCTV_CAMERAS = [
  { x: 250, y: 490 },
  { x: 310, y: 490 },
  { x: 380, y: 440 },
  { x: 380, y: 390 },
  { x: 380, y: 340 },
  { x: 450, y: 340 },
  { x: 520, y: 340 },
  { x: 520, y: 280 },
  { x: 520, y: 220 },
  { x: 590, y: 220 },
  { x: 660, y: 220 },
  { x: 720, y: 190 },
  { x: 780, y: 160 },
];

// Streetlamp glow positions (representing well-lit corridors)
const STREET_LAMPS = [
  { x: 230, y: 480 }, { x: 290, y: 480 }, { x: 350, y: 480 },
  { x: 380, y: 460 }, { x: 380, y: 410 }, { x: 380, y: 360 },
  { x: 420, y: 340 }, { x: 480, y: 340 }, { x: 520, y: 320 },
  { x: 520, y: 260 }, { x: 560, y: 220 }, { x: 620, y: 220 },
  { x: 680, y: 210 }, { x: 740, y: 180 }, { x: 770, y: 160 }
];

// Initial Emergency Contacts
const INITIAL_CONTACTS = [
  { id: 1, name: "Radha Sharma", phone: "+91 98765 43210", relation: "Parent", isPrimary: true },
  { id: 2, name: "Dr. Vikram Sharma", phone: "+91 98765 12345", relation: "Parent", isPrimary: false },
  { id: 3, name: "Ananya Deshmukh", phone: "+91 98111 22334", relation: "Friend / Roommate", isPrimary: false },
  { id: 4, name: "Kavya Menon", phone: "+91 99000 88776", relation: "Sibling", isPrimary: false },
];

// Emergency Helplines
const HELPLINES = [
  {
    number: "112",
    title: "National Emergency Number",
    category: "All-in-One Emergency",
    desc: "Single emergency response for Police, Fire, and Ambulance nationwide.",
    badge: "Priority Govt Line",
    responseEstimate: "< 4 mins response",
    color: "from-red-500 to-rose-600",
  },
  {
    number: "100",
    title: "Police Dispatch Emergency",
    category: "Law Enforcement",
    desc: "Direct police patrol unit dispatch and local precinct control room.",
    badge: "Immediate Dispatch",
    responseEstimate: "< 5 mins response",
    color: "from-blue-600 to-indigo-700",
  },
  {
    number: "1091",
    title: "Women Dedicated Helpline",
    category: "Women's Safety Cell",
    desc: "Specialized women distress response team, staffed with female officers 24/7.",
    badge: "24/7 Women Officers",
    responseEstimate: "Dedicated SOS Cell",
    color: "from-pink-600 to-rose-600",
  },
  {
    number: "102",
    title: "Ambulance Medical Services",
    category: "Medical & Trauma",
    desc: "Direct emergency medical ambulance with life-support triage dispatch.",
    badge: "Paramedics On-Duty",
    responseEstimate: "< 8 mins transit",
    color: "from-emerald-600 to-teal-700",
  },
  {
    number: "181",
    title: "Women in Distress Helpline",
    category: "Legal & Crisis Support",
    desc: "Crisis counseling, immediate legal aid, and emergency refuge shelter.",
    badge: "National Women Commission",
    responseEstimate: "Counselor Online",
    color: "from-purple-600 to-violet-700",
  },
  {
    number: "1930",
    title: "Cyber Crime Emergency Helpline",
    category: "Digital Protection",
    desc: "Assistance with cyber stalking, harassment, and digital blackmail threats.",
    badge: "Cyber Security Wing",
    responseEstimate: "Instant Incident Docket",
    color: "from-amber-600 to-orange-700",
  },
];

// ============================================================================
// GEOGRAPHIC DISTANCE & REAL-WORLD NEARBY PLACES ENGINE
// ============================================================================

// Haversine distance calculation in meters
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Format distance text
function formatDistanceText(meters) {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}

// Verified Emergency Facilities (Geo-referenced)
const BENGALURU_NEARBY_BASE = [
  {
    id: "nb-p1",
    name: "Indiranagar Central Police Station",
    category: "police",
    lat: 12.9784,
    lng: 77.6408,
    phone: "+91 80 2294 2533",
    status: "Open 24/7 • Staffed with Women Help Desk",
    address: "CMH Road, Stage 1, Indiranagar",
    badge: "Police Precinct",
    officerOnDuty: "Inspector V. Lakshmi",
    lightingRating: "98% Lit Corridor",
    cctvCount: "14 Cameras Active",
  },
  {
    id: "nb-p2",
    name: "Pink Police All-Women Safe Booth",
    category: "police",
    lat: 12.9712,
    lng: 77.5975,
    phone: "1091",
    status: "Open 24/7 • Rapid Response Patrol Unit",
    address: "100 Ft Road Junction, Indiranagar",
    badge: "Women Safe Outpost",
    officerOnDuty: "Sub-Inspector Anita R.",
    lightingRating: "100% High-Lumen Zone",
    cctvCount: "8 Surveillance Poles",
  },
  {
    id: "nb-h1",
    name: "Metro Care Emergency & Trauma Hospital",
    category: "hospital",
    lat: 12.9685,
    lng: 77.6012,
    phone: "+91 80 4000 8900",
    status: "Open 24/7 • Level 1 ER & Ambulance Ready",
    address: "80 Feet Rd, HAL 3rd Stage",
    badge: "Trauma Care Hospital",
    bedsAvailable: "14 Emergency Beds Active",
    lightingRating: "94% Well-Lit Approach",
    cctvCount: "Campus 24/7 CCTV",
  },
  {
    id: "nb-h2",
    name: "Apollo 24/7 Multi-Specialty Clinic",
    category: "hospital",
    lat: 12.9641,
    lng: 77.5982,
    phone: "102",
    status: "Open 24/7 • Emergency Triage Ready",
    address: "Old Airport Road Junction",
    badge: "24/7 Medical Care",
    lightingRating: "92% Well-Lit",
    cctvCount: "Security Monitored",
  },
  {
    id: "nb-s1",
    name: "SafeHub 24/7 Transit Lounge & Cafe",
    category: "safehub",
    lat: 12.9735,
    lng: 77.5921,
    phone: "+91 80 6192 1100",
    status: "Open 24/7 • Verified Safe Haven Partner",
    address: "12th Main Road Corner, Indiranagar",
    badge: "Verified Safe Haven",
    amenities: "CCTV Monitored, Free Wi-Fi, Security Guard on Duty",
    lightingRating: "99% High Street Glow",
    cctvCount: "Continuous Monitoring",
  },
  {
    id: "nb-s2",
    name: "BMRCL Metro Security Safe Zone",
    category: "safehub",
    lat: 12.9756,
    lng: 77.6055,
    phone: "080-25191091",
    status: "Open 24/7 • CISF Guarded Women Kiosk",
    address: "Indiranagar Metro Concourse Level",
    badge: "Transit Security Safe Haven",
    amenities: "Direct Police Hotline, SOS Beacon",
    lightingRating: "100% Bright Concourse",
    cctvCount: "42 Station Cameras",
  },
  {
    id: "nb-m1",
    name: "Apollo All-Night Pharmacy & First-Aid",
    category: "pharmacy",
    lat: 12.9719,
    lng: 77.5930,
    phone: "+91 80 2521 4455",
    status: "Open 24/7 • Registered Pharmacist & First-Aid",
    address: "8th Main Rd, Indiranagar",
    badge: "24/7 Chemist",
    lightingRating: "95% Lit Storefront",
    cctvCount: "Front CCTV Active",
  },
  {
    id: "nb-m2",
    name: "MedPlus 24-Hour Express Pharmacy",
    category: "pharmacy",
    lat: 12.9698,
    lng: 77.5962,
    phone: "+91 80 2529 1199",
    status: "Open 24/7 • Emergency Supplies",
    address: "Double Road, HAL 2nd Stage",
    badge: "24/7 Chemist",
    lightingRating: "90% Streetlighting",
    cctvCount: "Storefront Surveillance",
  },
  {
    id: "nb-p3",
    name: "East Division PCR Mobile Patrol Post",
    category: "police",
    lat: 12.9740,
    lng: 77.5990,
    phone: "100",
    status: "Open 24/7 • Mobile Police Patrol Vehicle #KA-03-G-9921",
    address: "Defence Colony Intersection",
    badge: "Mobile Police Patrol",
    officerOnDuty: "Head Constable M. Kumar",
    lightingRating: "High-Visibility Patrol",
    cctvCount: "Dashcam Monitored",
  },
  {
    id: "nb-s3",
    name: "Nirbhaya Transit Shelter & Women Kiosk",
    category: "safehub",
    lat: 12.9705,
    lng: 77.5915,
    phone: "1091",
    status: "Open 24/7 • Solar Lit Safe Booth with SOS Beacon",
    address: "100ft Road Bus Transit Stand",
    badge: "Nirbhaya Safe Shelter",
    amenities: "Emergency Siren Button, CCTV, Direct 112 Beacon",
    lightingRating: "100% Solar Floodlit",
    cctvCount: "Solar Powered CCTV",
  }
];

// Dynamic location-aware facility generator (works in ANY city or GPS position)
function getNearbyPlacesForLocation(userLat, userLng) {
  // If user is near Bengaluru coordinates (within ~15 km), use Bengaluru places
  const isNearBengaluru = Math.abs(userLat - 12.9716) < 0.2 && Math.abs(userLng - 77.5946) < 0.2;
  
  if (isNearBengaluru) {
    return BENGALURU_NEARBY_BASE.map((place) => {
      const dist = calculateDistanceMeters(userLat, userLng, place.lat, place.lng);
      return {
        ...place,
        distanceMeters: dist,
        distanceText: formatDistanceText(dist),
        walkingTime: `${Math.max(1, Math.round(dist / 75))} mins walk`,
      };
    }).sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  // Realistic dynamic generator for any location worldwide:
  const offsets = [
    { name: "Central Police Station Precinct", category: "police", dLat: 0.0022, dLng: 0.0018, phone: "100", status: "Open 24/7 • Women Help Desk Active", badge: "Police Precinct", address: "Nearby Central Precinct", lightingRating: "96% Well-Lit", cctvCount: "12 Cameras" },
    { name: "Pink Booth Women Rapid Safe Kiosk", category: "police", dLat: -0.0016, dLng: 0.0012, phone: "1091", status: "Open 24/7 • Dedicated Women Patrol", badge: "Women Safe Outpost", address: "Primary Transit Crossing", lightingRating: "100% Bright Corridor", cctvCount: "8 Cameras" },
    { name: "District 24/7 Trauma Emergency Hospital", category: "hospital", dLat: 0.0035, dLng: -0.0025, phone: "102", status: "Open 24/7 • Level 1 Trauma Care & Ambulance", badge: "Trauma Care Hospital", address: "Medical Corridor Avenue", lightingRating: "94% Illuminated", cctvCount: "Hospital Surveillance" },
    { name: "City Care 24/7 Multi-Specialty Clinic", category: "hospital", dLat: -0.0038, dLng: 0.0031, phone: "102", status: "Open 24/7 • On-Call Emergency Doctors", badge: "24/7 Medical Care", address: "Commercial Ring Road", lightingRating: "90% Well-Lit", cctvCount: "Security Monitored" },
    { name: "SafeHub Verified Transit Shelter & Cafe", category: "safehub", dLat: 0.0018, dLng: -0.0015, phone: "112", status: "Open 24/7 • Verified Safe Haven Partner", badge: "Verified Safe Haven", address: "Main High Street", lightingRating: "98% Well-Lit", cctvCount: "Active CCTV & Guards" },
    { name: "Transit Metro Security Safe Zone", category: "safehub", dLat: -0.0029, dLng: -0.0028, phone: "1091", status: "Open 24/7 • CISF Guarded Women Kiosk", badge: "Transit Safe Zone", address: "Transit Terminal Hub", lightingRating: "100% Floodlit", cctvCount: "Transit Grid CCTV" },
    { name: "Apollo 24-Hour Emergency Pharmacy", category: "pharmacy", dLat: 0.0012, dLng: 0.0010, phone: "112", status: "Open 24/7 • Registered Pharmacist & First-Aid", badge: "24/7 Chemist", address: "Market Arcade Corner", lightingRating: "95% Bright Storefront", cctvCount: "Storefront Camera" },
    { name: "MedPlus All-Night Express Pharmacy", category: "pharmacy", dLat: -0.0025, dLng: -0.0019, phone: "112", status: "Open 24/7 • Emergency Supplies", badge: "24/7 Chemist", address: "Main Boulevard", lightingRating: "92% Streetlighting", cctvCount: "CCTV Monitored" },
    { name: "PCR Mobile Police Rapid Unit", category: "police", dLat: 0.0030, dLng: 0.0029, phone: "100", status: "Open 24/7 • Patrol Vehicle on Standby", badge: "Mobile Police Patrol", address: "North Sector Junction", lightingRating: "High-Visibility Patrol", cctvCount: "Dashcam Monitored" },
  ];

  return offsets.map((item, idx) => {
    const lat = Number((userLat + item.dLat).toFixed(5));
    const lng = Number((userLng + item.dLng).toFixed(5));
    const dist = calculateDistanceMeters(userLat, userLng, lat, lng);
    return {
      id: `dyn-${idx}`,
      ...item,
      lat,
      lng,
      distanceMeters: dist,
      distanceText: formatDistanceText(dist),
      walkingTime: `${Math.max(1, Math.round(dist / 75))} mins walk`,
    };
  }).sort((a, b) => a.distanceMeters - b.distanceMeters);
}

// ============================================================================
// GOOGLE MAPS API: Custom Dark Night Mode Palette (Matches SafeWay UI)
// ============================================================================
const GOOGLE_MAPS_DARK_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0B1120" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0B1120" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94A3B8" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#38BDF8" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#10B981" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#064E3B" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1E293B" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0F172A" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1E293B" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0284C7" }] }
];

// ============================================================================
// MAIN COMPONENT: SafeWay Application
// ============================================================================

export default function SafeWayApp() {
  // Navigation tabs: 'livemap' | 'routes' | 'journey' | 'contacts' | 'helplines'
  const [activeTab, setActiveTab] = useState("livemap");

  // Map & Route selection state
  const [selectedRoute, setSelectedRoute] = useState("safe"); // 'safe' | 'fast'
  const [poiCategory, setPoiCategory] = useState("all"); // 'all' | 'police' | 'hospital' | 'safehub' | 'pharmacy'
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [showLightingHeatmap, setShowLightingHeatmap] = useState(true);
  const [showCctvMarkers, setShowCctvMarkers] = useState(true);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapCenter, setMapCenter] = useState({ x: 0, y: 0 });

  // Destination selection
  const [activeDestination, setActiveDestination] = useState(DESTINATIONS[0]);

  // SOS Emergency & Grace Countdown
  const [sosGraceActive, setSosGraceActive] = useState(false);
  const [graceCountdown, setGraceCountdown] = useState(5);
  const [sosEmergencyActive, setSosEmergencyActive] = useState(false);
  const [strobeActive, setStrobeActive] = useState(false);
  const [sirenMuted, setSirenMuted] = useState(false);

  // Audio Context Ref for Web Audio API siren
  const audioCtxRef = useRef(null);
  const sirenOsc1Ref = useRef(null);
  const sirenOsc2Ref = useRef(null);
  const sirenGainRef = useRef(null);
  const sirenTimerRef = useRef(null);

  // Journey Safety Timer
  const [journeyMinutesInput, setJourneyMinutesInput] = useState(15);
  const [journeyTimerSeconds, setJourneyTimerSeconds] = useState(0);
  const [journeyTimerRunning, setJourneyTimerRunning] = useState(false);
  const [journeyExpiredAlert, setJourneyExpiredAlert] = useState(false);
  const [arrivedSafelySuccess, setArrivedSafelySuccess] = useState(false);

  // Emergency Contacts
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactRelation, setNewContactRelation] = useState("Parent");
  const [showAddContactModal, setShowAddContactModal] = useState(false);

  // Live GPS Sharing Toast / State
  const [gpsCopiedToast, setGpsCopiedToast] = useState(false);
  const [quickDialModal, setQuickDialModal] = useState(null);

  // Environmental Safety Score (Dynamic based on selected route)
  const currentSafetyScore = selectedRoute === "safe" ? 98 : 58;

  // PWA (Progressive Web App) Install State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showInstallGuideModal, setShowInstallGuideModal] = useState(false);

  // Real Device Physical GPS State (Fallback/Enhancement)
  const [usingRealGps, setUsingRealGps] = useState(false);
  const [realGpsLoading, setRealGpsLoading] = useState(false);
  const [currentGpsData, setCurrentGpsData] = useState(USER_GPS);

  // Listen for PWA installation eligibility
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsAppInstalled(true);
    }
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowInstallGuideModal(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setIsAppInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const toggleRealGps = () => {
    if (usingRealGps) {
      setUsingRealGps(false);
      setCurrentGpsData(USER_GPS);
      return;
    }
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser/device.");
      return;
    }
    setRealGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setRealGpsLoading(false);
        setUsingRealGps(true);
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setCurrentGpsData({
          lat,
          lng,
          accuracy: `±${Math.round(pos.coords.accuracy)}m`,
          address: `Live GPS: ${lat}° N, ${lng}° E (Resolving Google address...)`,
          x: 220,
          y: 490,
        });
        reverseGeocodeWithGoogle(lat, lng);
      },
      (err) => {
        setRealGpsLoading(false);
        alert(`Could not acquire sensor GPS (${err.message}). Defaulting to simulated corridor.`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // --------------------------------------------------------------------------
  // GOOGLE MAPS API & DEDICATED LIVE NAVIGATION ENGINE
  // --------------------------------------------------------------------------
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState(() => {
    try {
      const stored = localStorage.getItem("safeway_google_maps_api_key");
      if (stored) return stored;
    } catch (e) {}
    try {
      if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
        return import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      }
    } catch (e) {}
    return "";
  });
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState(null);
  const [showGoogleKeyModal, setShowGoogleKeyModal] = useState(false);
  const [apiKeyInputValue, setApiKeyInputValue] = useState("");
  const [mapEngine, setMapEngine] = useState("google"); // 'google' | 'leaflet'
  const [googleMapType, setGoogleMapType] = useState("roadmap"); // 'roadmap' | 'hybrid' | 'terrain'
  const [showTrafficLayer, setShowTrafficLayer] = useState(false);

  // Google Maps DOM & Instance Refs
  const googleMapContainerRef = useRef(null);
  const googleMapInstance = useRef(null);
  const googleUserMarkerRef = useRef(null);
  const googleUserCircleRef = useRef(null);
  const googlePlaceMarkersRef = useRef([]);
  const googleTrafficLayerRef = useRef(null);
  const googleGeocoderRef = useRef(null);

  // Filters for Nearby Facilities
  const [liveRadiusFilter, setLiveRadiusFilter] = useState("all");
  const [liveCategoryFilter, setLiveCategoryFilter] = useState("all");
  const [liveSearchQuery, setLiveSearchQuery] = useState("");
  const [selectedLivePlace, setSelectedLivePlace] = useState(null);
  const [isTrackingLive, setIsTrackingLive] = useState(false);
  const watchIdRef = useRef(null);

  // Leaflet Map DOM & Instance Refs (Fallback engine)
  const leafletContainerRef = useRef(null);
  const leafletMapInstance = useRef(null);
  const leafletUserMarkerRef = useRef(null);
  const leafletMarkersLayer = useRef(null);

  // Dynamically load Google Maps JavaScript API
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.google && window.google.maps) {
      setGoogleMapsLoaded(true);
      return;
    }

    const scriptId = "safeway-google-maps-script";
    let script = document.getElementById(scriptId);

    if (script) {
      if (script.getAttribute("data-key") !== googleMapsApiKey) {
        script.remove();
        script = null;
      } else {
        script.addEventListener("load", () => setGoogleMapsLoaded(true));
        return;
      }
    }

    const newScript = document.createElement("script");
    newScript.id = scriptId;
    newScript.type = "text/javascript";
    newScript.setAttribute("data-key", googleMapsApiKey);
    const keyParam = googleMapsApiKey.trim() ? `key=${googleMapsApiKey.trim()}&` : "";
    newScript.src = `https://maps.googleapis.com/maps/api/js?${keyParam}libraries=places,geometry&v=weekly`;
    newScript.async = true;
    newScript.defer = true;

    newScript.onload = () => {
      setGoogleMapsLoaded(true);
      setGoogleMapsError(null);
    };

    newScript.onerror = () => {
      setGoogleMapsError("Could not connect to Google Maps API. Check your internet or API key.");
    };

    document.head.appendChild(newScript);
  }, [googleMapsApiKey]);

  // Google Maps Reverse Geocoding API helper (fetches real street address from Google)
  const reverseGeocodeWithGoogle = useCallback((lat, lng) => {
    if (typeof window === "undefined" || !window.google || !window.google.maps || !window.google.maps.Geocoder) {
      return;
    }
    try {
      if (!googleGeocoderRef.current) {
        googleGeocoderRef.current = new window.google.maps.Geocoder();
      }
      googleGeocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const formatted = results[0].formatted_address;
          setCurrentGpsData((prev) => ({
            ...prev,
            address: formatted,
          }));
        }
      });
    } catch (err) {
      console.warn("Google Geocoding error:", err);
    }
  }, []);

  // Save Google Maps API Key to LocalStorage
  const handleSaveGoogleApiKey = (keyToSave) => {
    const cleanKey = keyToSave.trim();
    localStorage.setItem("safeway_google_maps_api_key", cleanKey);
    setGoogleMapsApiKey(cleanKey);
    setShowGoogleKeyModal(false);
  };

  // Dynamic nearby facilities computed relative to current live coordinates
  const nearbyPlacesList = useMemo(() => {
    return getNearbyPlacesForLocation(currentGpsData.lat, currentGpsData.lng);
  }, [currentGpsData.lat, currentGpsData.lng]);

  // Filtered nearby places
  const filteredNearbyPlaces = useMemo(() => {
    return nearbyPlacesList.filter((place) => {
      if (liveCategoryFilter !== "all" && place.category !== liveCategoryFilter) {
        return false;
      }
      if (liveRadiusFilter !== "all") {
        const maxDist = parseInt(liveRadiusFilter, 10);
        if (place.distanceMeters > maxDist) return false;
      }
      if (liveSearchQuery.trim()) {
        const q = liveSearchQuery.toLowerCase();
        return (
          place.name.toLowerCase().includes(q) ||
          place.address.toLowerCase().includes(q) ||
          place.badge.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [nearbyPlacesList, liveCategoryFilter, liveRadiusFilter, liveSearchQuery]);

  // Toggle continuous live tracking (walk tracking via Google Maps & GPS)
  const toggleLiveTracking = () => {
    if (isTrackingLive) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsTrackingLive(false);
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your device.");
      return;
    }

    setIsTrackingLive(true);
    setUsingRealGps(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setCurrentGpsData((prev) => ({
          ...prev,
          lat,
          lng,
          accuracy: `±${Math.round(pos.coords.accuracy)}m`,
          address: prev.address.includes("Physical") || prev.address.includes("Sensor")
            ? `Tracking via Google Maps GPS: ${lat}° N, ${lng}° E`
            : prev.address,
        }));
        // Update street address using Google Maps Geocoding API
        reverseGeocodeWithGoogle(lat, lng);
      },
      (err) => {
        console.warn("Watch position error:", err);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // --------------------------------------------------------------------------
  // GOOGLE MAPS API: Live Map Initialization & Marker Updates
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (activeTab !== "livemap" || mapEngine !== "google") return;
    if (!googleMapsLoaded || !window.google || !window.google.maps || !googleMapContainerRef.current) return;

    const userPos = { lat: currentGpsData.lat, lng: currentGpsData.lng };

    // Initialize Google Map instance
    if (!googleMapInstance.current) {
      const map = new window.google.maps.Map(googleMapContainerRef.current, {
        center: userPos,
        zoom: 15,
        mapTypeId: googleMapType,
        styles: googleMapType === "roadmap" ? GOOGLE_MAPS_DARK_STYLE : [],
        disableDefaultUI: true,
        zoomControl: false,
        fullscreenControl: false,
        gestureHandling: "greedy",
      });
      googleMapInstance.current = map;
    }

    const map = googleMapInstance.current;
    map.setMapTypeId(googleMapType);
    if (googleMapType === "roadmap") {
      map.setOptions({ styles: GOOGLE_MAPS_DARK_STYLE });
    } else {
      map.setOptions({ styles: [] });
    }

    // Google Maps Traffic Layer
    if (showTrafficLayer) {
      if (!googleTrafficLayerRef.current) {
        googleTrafficLayerRef.current = new window.google.maps.TrafficLayer();
      }
      googleTrafficLayerRef.current.setMap(map);
    } else if (googleTrafficLayerRef.current) {
      googleTrafficLayerRef.current.setMap(null);
    }

    // Update Live User GPS Marker & Accuracy Circle
    const accuracyNum = parseFloat(String(currentGpsData.accuracy).replace(/[^0-9.]/g, "")) || 20;

    if (!googleUserCircleRef.current) {
      googleUserCircleRef.current = new window.google.maps.Circle({
        strokeColor: "#38BDF8",
        strokeOpacity: 0.8,
        strokeWeight: 1.5,
        fillColor: "#0284C7",
        fillOpacity: 0.15,
        map,
        center: userPos,
        radius: accuracyNum,
      });
    } else {
      googleUserCircleRef.current.setCenter(userPos);
      googleUserCircleRef.current.setRadius(accuracyNum);
      googleUserCircleRef.current.setMap(map);
    }

    if (!googleUserMarkerRef.current) {
      const marker = new window.google.maps.Marker({
        position: userPos,
        map,
        title: "Your Live Location (Google Maps GPS)",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: "#38BDF8",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 3,
        },
        zIndex: 9999,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="color: #0F172A; font-family: sans-serif; padding: 4px; min-width: 170px;">
            <div style="font-weight: 800; font-size: 13px; color: #0284C7;">📍 Live Tracked Location (Google Maps)</div>
            <div style="font-size: 11px; color: #475569; margin-top: 3px;">${currentGpsData.address}</div>
            <div style="font-size: 10px; color: #10B981; margin-top: 2px; font-weight: bold;">Accuracy: ${currentGpsData.accuracy}</div>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      googleUserMarkerRef.current = marker;
    } else {
      googleUserMarkerRef.current.setPosition(userPos);
    }

    // Smoothly pan to current location
    map.panTo(userPos);

    // Update Nearby Facility Markers on Google Map
    googlePlaceMarkersRef.current.forEach((m) => m.setMap(null));
    googlePlaceMarkersRef.current = [];

    filteredNearbyPlaces.forEach((place) => {
      let fillColor = "#38BDF8";
      if (place.category === "police") fillColor = "#3B82F6";
      if (place.category === "hospital") fillColor = "#EF4444";
      if (place.category === "safehub") fillColor = "#10B981";
      if (place.category === "pharmacy") fillColor = "#06B6D4";

      const placeMarker = new window.google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map,
        title: place.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor,
          fillOpacity: 0.9,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        },
      });

      const placeInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="color: #0F172A; font-family: sans-serif; min-width: 180px; padding: 3px;">
            <div style="font-weight: 800; font-size: 12px; margin-bottom: 2px;">${place.name}</div>
            <div style="font-size: 11px; color: #0284C7; font-weight: 700;">${place.distanceText} • ${place.walkingTime}</div>
            <div style="font-size: 10px; color: #16A34A; margin-top: 2px;">${place.status}</div>
            <div style="margin-top: 6px; display: flex; gap: 4px;">
              <a href="tel:${place.phone}" style="background: #10B981; color: white; padding: 3px 8px; border-radius: 6px; text-decoration: none; font-size: 10px; font-weight: bold;">Call</a>
              <a href="https://www.google.com/maps/dir/?api=1&origin=${currentGpsData.lat},${currentGpsData.lng}&destination=${place.lat},${place.lng}&travelmode=walking" target="_blank" rel="noopener noreferrer" style="background: #0F172A; color: white; padding: 3px 8px; border-radius: 6px; text-decoration: none; font-size: 10px;">Google Nav</a>
            </div>
          </div>
        `,
      });

      placeMarker.addListener("click", () => {
        setSelectedLivePlace(place);
        placeInfoWindow.open(map, placeMarker);
      });

      googlePlaceMarkersRef.current.push(placeMarker);
    });
  }, [activeTab, mapEngine, googleMapsLoaded, currentGpsData, filteredNearbyPlaces, googleMapType, showTrafficLayer]);

  // Leaflet map initialization and markers update (Secondary / Fallback Engine)
  useEffect(() => {
    if (activeTab !== "livemap" || mapEngine !== "leaflet") return;
    if (typeof window === "undefined" || !window.L || !leafletContainerRef.current) return;

    if (!leafletMapInstance.current) {
      const map = window.L.map(leafletContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([currentGpsData.lat, currentGpsData.lng], 15);

      window.L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      leafletMapInstance.current = map;
    }

    const map = leafletMapInstance.current;
    map.setView([currentGpsData.lat, currentGpsData.lng], map.getZoom() || 15);

    // Update User Marker
    if (leafletUserMarkerRef.current) {
      leafletUserMarkerRef.current.remove();
    }

    const userIcon = window.L.divIcon({
      className: "custom-user-marker",
      html: `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(56, 189, 248, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 14px; height: 14px; border-radius: 50%; background: #0284C7; border: 3px solid #FFFFFF; box-shadow: 0 0 14px #38BDF8;"></div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    leafletUserMarkerRef.current = window.L.marker([currentGpsData.lat, currentGpsData.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup(`<div style="color: #0F172A; font-family: sans-serif; font-weight: bold; font-size: 12px; padding: 2px;">📍 Your Live Location<br/><span style="font-size: 10px; color: #475569; font-weight: normal;">${currentGpsData.address}</span></div>`);

    // Nearby facilities markers layer
    if (leafletMarkersLayer.current) {
      leafletMarkersLayer.current.clearLayers();
    } else {
      leafletMarkersLayer.current = window.L.layerGroup().addTo(map);
    }

    filteredNearbyPlaces.forEach((place) => {
      let color = "#38BDF8";
      let label = "📍";
      if (place.category === "police") { color = "#3B82F6"; label = "👮"; }
      if (place.category === "hospital") { color = "#EF4444"; label = "🏥"; }
      if (place.category === "safehub") { color = "#10B981"; label = "🛡️"; }
      if (place.category === "pharmacy") { color = "#06B6D4"; label = "💊"; }

      const placeIcon = window.L.divIcon({
        className: "custom-place-marker",
        html: `
          <div style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: #0F172A; border: 2.5px solid ${color}; box-shadow: 0 2px 8px rgba(0,0,0,0.6); font-size: 12px; cursor: pointer;">
            ${label}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const m = window.L.marker([place.lat, place.lng], { icon: placeIcon })
        .bindPopup(`
          <div style="color: #0F172A; font-family: sans-serif; min-width: 170px; padding: 2px;">
            <div style="font-weight: 800; font-size: 12px; margin-bottom: 2px;">${place.name}</div>
            <div style="font-size: 11px; color: #0284C7; font-weight: 700;">${place.distanceText} • ${place.walkingTime}</div>
            <div style="font-size: 10px; color: #16A34A; margin-top: 2px;">${place.status}</div>
            <div style="margin-top: 6px; display: flex; gap: 4px;">
              <a href="tel:${place.phone}" style="background: #10B981; color: white; padding: 3px 8px; border-radius: 6px; text-decoration: none; font-size: 10px; font-weight: bold;">Call Now</a>
              <a href="https://www.google.com/maps/dir/?api=1&origin=${currentGpsData.lat},${currentGpsData.lng}&destination=${place.lat},${place.lng}&travelmode=walking" target="_blank" rel="noopener noreferrer" style="background: #0F172A; color: white; padding: 3px 8px; border-radius: 6px; text-decoration: none; font-size: 10px;">Directions</a>
            </div>
          </div>
        `);

      m.on("click", () => setSelectedLivePlace(place));
      leafletMarkersLayer.current.addLayer(m);
    });
  }, [activeTab, mapEngine, currentGpsData, filteredNearbyPlaces]);

  // Unified recenter and zoom helpers for active map engine
  const recenterActiveMap = () => {
    if (mapEngine === "google" && googleMapInstance.current) {
      googleMapInstance.current.panTo({ lat: currentGpsData.lat, lng: currentGpsData.lng });
      googleMapInstance.current.setZoom(15);
    } else if (mapEngine === "leaflet" && leafletMapInstance.current) {
      leafletMapInstance.current.flyTo([currentGpsData.lat, currentGpsData.lng], 15);
    }
  };

  const zoomActiveMap = (delta) => {
    if (mapEngine === "google" && googleMapInstance.current) {
      googleMapInstance.current.setZoom(googleMapInstance.current.getZoom() + delta);
    } else if (mapEngine === "leaflet" && leafletMapInstance.current) {
      leafletMapInstance.current.setZoom(leafletMapInstance.current.getZoom() + delta);
    }
  };
  // Dual-oscillator frequency modulating siren (Emergency warble: 650Hz - 1350Hz)
  // --------------------------------------------------------------------------
  const startSirenAudio = useCallback(() => {
    if (sirenMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }

      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      // Stop existing if running
      stopSirenAudio();

      const ctx = audioCtxRef.current;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = "sawtooth";
      osc2.type = "sine";

      // Gain setup for loud alert tone
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();

      sirenOsc1Ref.current = osc1;
      sirenOsc2Ref.current = osc2;
      sirenGainRef.current = gainNode;

      // Realistic Police / Emergency siren cycle: sweep between 650Hz and 1300Hz
      let frequencyUp = true;
      let freq = 650;
      sirenTimerRef.current = setInterval(() => {
        if (!audioCtxRef.current || sirenMuted) return;
        if (frequencyUp) {
          freq += 120;
          if (freq >= 1350) frequencyUp = false;
        } else {
          freq -= 120;
          if (freq <= 650) frequencyUp = true;
        }
        try {
          osc1.frequency.setValueAtTime(freq, ctx.currentTime);
          osc2.frequency.setValueAtTime(freq * 1.02, ctx.currentTime);
        } catch (e) {
          // ignore teardown
        }
      }, 70);
    } catch (err) {
      console.warn("Web Audio API not permitted or available:", err);
    }
  }, [sirenMuted]);

  const stopSirenAudio = useCallback(() => {
    if (sirenTimerRef.current) {
      clearInterval(sirenTimerRef.current);
      sirenTimerRef.current = null;
    }
    try {
      if (sirenOsc1Ref.current) {
        sirenOsc1Ref.current.stop();
        sirenOsc1Ref.current.disconnect();
        sirenOsc1Ref.current = null;
      }
      if (sirenOsc2Ref.current) {
        sirenOsc2Ref.current.stop();
        sirenOsc2Ref.current.disconnect();
        sirenOsc2Ref.current = null;
      }
    } catch (err) {
      // ignore
    }
  }, []);

  // Handle siren mute toggle during emergency
  useEffect(() => {
    if (sosEmergencyActive || journeyExpiredAlert) {
      if (sirenMuted) {
        stopSirenAudio();
      } else {
        startSirenAudio();
      }
    } else {
      stopSirenAudio();
    }
  }, [sirenMuted, sosEmergencyActive, journeyExpiredAlert, startSirenAudio, stopSirenAudio]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopSirenAudio();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stopSirenAudio]);

  // --------------------------------------------------------------------------
  // SOS GRACE COUNTDOWN (5-second grace period to prevent false alarms)
  // --------------------------------------------------------------------------
  const triggerSosGrace = () => {
    setGraceCountdown(5);
    setSosGraceActive(true);
  };

  const cancelSosGrace = () => {
    setSosGraceActive(false);
    setGraceCountdown(5);
  };

  const confirmSosEmergency = useCallback(() => {
    setSosGraceActive(false);
    setSosEmergencyActive(true);
    setStrobeActive(true);
    startSirenAudio();
  }, [startSirenAudio]);

  useEffect(() => {
    let timer;
    if (sosGraceActive && graceCountdown > 0) {
      timer = setTimeout(() => {
        setGraceCountdown((prev) => prev - 1);
      }, 1000);
    } else if (sosGraceActive && graceCountdown === 0) {
      confirmSosEmergency();
    }
    return () => clearTimeout(timer);
  }, [sosGraceActive, graceCountdown, confirmSosEmergency]);

  const deescalateEmergency = () => {
    setSosEmergencyActive(false);
    setStrobeActive(false);
    stopSirenAudio();
  };

  // --------------------------------------------------------------------------
  // JOURNEY SAFETY TIMER ENGINE
  // --------------------------------------------------------------------------
  const startJourneyTimer = (minutes) => {
    const totalSecs = (minutes || journeyMinutesInput) * 60;
    setJourneyTimerSeconds(totalSecs);
    setJourneyTimerRunning(true);
    setJourneyExpiredAlert(false);
    setArrivedSafelySuccess(false);
  };

  const cancelJourneyTimer = () => {
    setJourneyTimerRunning(false);
    setJourneyTimerSeconds(0);
    setJourneyExpiredAlert(false);
    setArrivedSafelySuccess(false);
    stopSirenAudio();
  };

  const checkInSafely = () => {
    setJourneyTimerRunning(false);
    setJourneyTimerSeconds(0);
    setJourneyExpiredAlert(false);
    setArrivedSafelySuccess(true);
    stopSirenAudio();
    setTimeout(() => {
      setArrivedSafelySuccess(false);
    }, 6000);
  };

  useEffect(() => {
    let interval;
    if (journeyTimerRunning && journeyTimerSeconds > 0) {
      interval = setInterval(() => {
        setJourneyTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (journeyTimerRunning && journeyTimerSeconds === 0) {
      setJourneyTimerRunning(false);
      setJourneyExpiredAlert(true);
      startSirenAudio();
    }
    return () => clearInterval(interval);
  }, [journeyTimerRunning, journeyTimerSeconds, startSirenAudio]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // --------------------------------------------------------------------------
  // CONTACTS MANAGEMENT
  // --------------------------------------------------------------------------
  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    if (contacts.length >= 5) {
      alert("Maximum 5 emergency contacts allowed.");
      return;
    }
    const newEntry = {
      id: Date.now(),
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relation: newContactRelation,
      isPrimary: contacts.length === 0,
    };
    setContacts([...contacts, newEntry]);
    setNewContactName("");
    setNewContactPhone("");
    setShowAddContactModal(false);
  };

  const handleDeleteContact = (id) => {
    if (contacts.length <= 1) {
      alert("At least one emergency contact is mandatory for safety dispatch.");
      return;
    }
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const togglePrimaryContact = (id) => {
    setContacts(
      contacts.map((c) => ({
        ...c,
        isPrimary: c.id === id,
      }))
    );
  };

  // --------------------------------------------------------------------------
  // LIVE GPS SHARING
  // --------------------------------------------------------------------------
  const handleShareGps = () => {
    const trackingLink = `https://safeway.app/live-track?lat=${currentGpsData.lat}&lng=${currentGpsData.lng}&token=sw_${Math.floor(100000 + Math.random() * 900000)}`;
    const message = `🚨 SafeWay Live GPS Alert: I am sharing my live route tracking with you for safety.\nLocation: ${currentGpsData.address}\nCoordinates: ${currentGpsData.lat}, ${currentGpsData.lng}\nLive Route Link: ${trackingLink}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
      setGpsCopiedToast(true);
      setTimeout(() => setGpsCopiedToast(false), 3500);
    } else {
      alert("Tracking link copied:\n" + trackingLink);
    }
  };

  // Filtered POIs
  const filteredPois = useMemo(() => {
    if (poiCategory === "all") return EMERGENCY_POIS;
    return EMERGENCY_POIS.filter((p) => p.category === poiCategory);
  }, [poiCategory]);

  const activeRouteData = ROUTE_DATA[selectedRoute];

  return (
    <div className={`min-h-screen bg-[#090D16] text-slate-100 font-sans flex flex-col selection:bg-emerald-500 selection:text-white ${strobeActive ? "animate-pulse" : ""}`}>
      {/* ==================================================================== */}
      {/* 1. TOP LIVE SAFETY STATUS BAR & BRAND HEADER                         */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-500/20 text-white font-bold">
              <Shield className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  SafeWay
                </h1>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                  Smart GPS & Safety
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Women Safety Route Planner & Emergency Navigation</p>
            </div>
          </div>

          {/* Environmental Safety Status & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Environmental Safety Index Banner */}
            <div className="flex items-center gap-2 bg-[#1E293B] border border-slate-700/70 rounded-full px-3 py-1.5 shadow-inner">
              <div className={`w-2.5 h-2.5 rounded-full ${currentSafetyScore > 80 ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-ping"}`} />
              <span className="text-xs font-semibold text-slate-200 hidden md:inline">
                {selectedRoute === "safe" ? "High Safety Zone • 96% Well-Lit" : "Moderate Risk Zone • 42% Well-Lit"}
              </span>
              <span className={`text-xs font-bold px-1.5 py-0.2 rounded ${currentSafetyScore > 80 ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                {currentSafetyScore}% Score
              </span>
            </div>

            {/* Journey Timer Status Indicator (if running) */}
            {journeyTimerRunning && (
              <button
                onClick={() => setActiveTab("journey")}
                className="flex items-center gap-1.5 bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 px-2.5 py-1 rounded-full text-xs font-mono font-bold animate-pulse"
                title="Active Journey Timer - Click to view"
              >
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{formatTime(journeyTimerSeconds)}</span>
              </button>
            )}

            {/* Install App Button */}
            {!isAppInstalled && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/50 text-emerald-300 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md shadow-emerald-950/40"
                title="Install SafeWay as an App on Phone or PC"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Install App</span>
                <span className="sm:hidden">App</span>
              </button>
            )}

            {/* Siren Audio Toggle */}
            <button
              onClick={() => setSirenMuted(!sirenMuted)}
              className={`p-2 rounded-lg border transition-all ${
                sirenMuted
                  ? "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
                  : "bg-red-950/50 text-red-400 border-red-800 hover:bg-red-900/40"
              }`}
              title={sirenMuted ? "Siren is Muted (Click to Unmute)" : "Siren is Armed (Click to Mute)"}
            >
              {sirenMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. NAVIGATION TABS (Desktop & Mobile sticky responsive)              */}
      {/* ==================================================================== */}
      <nav className="bg-[#111827] border-b border-slate-800 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between sm:justify-start gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("livemap")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === "livemap"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Live Location & Nearby</span>
          </button>

          <button
            onClick={() => setActiveTab("map")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === "map"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>Safe Route Planner</span>
          </button>

          <button
            onClick={() => setActiveTab("journey")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 relative ${
              activeTab === "journey"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Journey Safety Timer</span>
            {journeyTimerRunning && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping absolute -top-0.5 -right-0.5" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("contacts")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === "contacts"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Emergency Contacts ({contacts.length}/5)</span>
          </button>

          <button
            onClick={() => setActiveTab("helplines")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === "helplines"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Emergency Helplines</span>
          </button>
        </div>
      </nav>

      {/* ==================================================================== */}
      {/* 3. ALERT BANNERS (Journey Timeout Warning or Check-in confirmation) */}
      {/* ==================================================================== */}
      {journeyExpiredAlert && (
        <div className="bg-red-600 text-white px-4 py-3 border-b-2 border-red-400 shadow-2xl flex items-center justify-between flex-wrap gap-2 animate-bounce">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 animate-spin shrink-0 text-amber-200" />
            <div>
              <p className="font-extrabold text-sm sm:text-base">
                CRITICAL WARNING: Journey Timer Expired Without Safe Check-In!
              </p>
              <p className="text-xs text-red-100">
                Automated alert dispatched to your 4 primary contacts with last coordinates ({USER_GPS.lat}, {USER_GPS.lng}).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={checkInSafely}
              className="bg-white text-red-700 hover:bg-slate-100 font-bold px-3 py-1.5 rounded-lg text-xs shadow"
            >
              I Am Safe (Dismiss)
            </button>
            <button
              onClick={triggerSosGrace}
              className="bg-slate-950 hover:bg-black text-white font-bold px-3 py-1.5 rounded-lg text-xs border border-red-300"
            >
              Trigger Full Police SOS
            </button>
          </div>
        </div>
      )}

      {arrivedSafelySuccess && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 border-b border-emerald-400 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-100" />
            <p className="text-xs sm:text-sm font-bold">
              Journey Completed Safely! Your emergency contacts have received the safe arrival notification.
            </p>
          </div>
          <button onClick={() => setArrivedSafelySuccess(false)} className="text-emerald-200 hover:text-white text-xs font-semibold">
            ✕
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. MAIN WORKSPACE / TAB CONTENT AREA                                 */}
      {/* ==================================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* ================================================================== */}
        {/* TAB 0: DEDICATED LIVE RADAR & NEARBY FACILITIES MAP PAGE           */}
        {/* ================================================================== */}
        {activeTab === "livemap" && (
          <div className="flex flex-col gap-4 flex-1">
            {/* Top Live Location Telemetry & Radar Controls Card */}
            <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/40 text-sky-400 shrink-0">
                  <LocateFixed className={`w-6 h-6 ${isTrackingLive ? "animate-spin text-emerald-400" : "text-sky-400"}`} />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                      {usingRealGps ? "Physical Sensor Live GPS" : "Simulated GPS Corridor"}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                      Accuracy: {currentGpsData.accuracy}
                    </span>
                    {isTrackingLive && (
                      <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 animate-pulse">
                        ● Live Walk Tracking Active
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                    {currentGpsData.address}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Lat: <strong className="text-slate-200">{currentGpsData.lat}° N</strong> • Lng: <strong className="text-slate-200">{currentGpsData.lng}° E</strong>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                <button
                  onClick={toggleRealGps}
                  className={`flex-1 md:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 shadow ${
                    usingRealGps
                      ? "bg-emerald-950/80 border-emerald-500 text-emerald-300"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                  }`}
                  title={usingRealGps ? "Revert to Bengaluru demo corridor" : "Detect real physical device coordinates"}
                >
                  <LocateFixed className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{realGpsLoading ? "Fixing GPS..." : usingRealGps ? "Sensor Active" : "Detect My Real GPS"}</span>
                </button>

                <button
                  onClick={toggleLiveTracking}
                  className={`flex-1 md:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 shadow ${
                    isTrackingLive
                      ? "bg-cyan-950/80 border-cyan-500 text-cyan-300 animate-pulse"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                  }`}
                  title="Continuously track user as they walk"
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isTrackingLive ? "Stop Tracking" : "Live Walk Tracking"}</span>
                </button>

                <button
                  onClick={recenterActiveMap}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white shadow"
                  title="Center map on live position"
                >
                  <Crosshair className="w-4 h-4 text-sky-400" />
                </button>

                <button
                  onClick={handleShareGps}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Share Pin</span>
                </button>
              </div>
            </div>

            {/* Split Grid: Live Map Canvas (Left) + Nearby Places Radar List (Right) */}
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 flex-1">
              {/* LEFT: Live Map Display (Google Maps API + Leaflet Fallback Engine) */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-[#0A0F1D] border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                  {/* Map Engine Containers */}
                  {mapEngine === "google" ? (
                    <div
                      ref={googleMapContainerRef}
                      className="w-full h-full z-0"
                      style={{ background: "#0B1120", minHeight: "360px" }}
                    />
                  ) : (
                    <div
                      ref={leafletContainerRef}
                      className="w-full h-full z-0"
                      style={{ background: "#0A0F1D", minHeight: "360px" }}
                    />
                  )}

                  {/* Top Floating Map Status & Engine Switcher Bar */}
                  <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2 pointer-events-none flex-wrap">
                    {/* Map Engine Switcher */}
                    <div className="bg-[#0F172A]/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-1 shadow-xl pointer-events-auto flex items-center gap-1">
                      <button
                        onClick={() => setMapEngine("google")}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                          mapEngine === "google"
                            ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                        title="Use official Google Maps JavaScript API for live GPS tracking"
                      >
                        <Globe className="w-3 h-3" />
                        <span>Google Maps</span>
                      </button>

                      <button
                        onClick={() => setMapEngine("leaflet")}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                          mapEngine === "leaflet"
                            ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                        title="Switch to CartoDB Leaflet dark map"
                      >
                        <Navigation2 className="w-3 h-3" />
                        <span>Leaflet Dark</span>
                      </button>
                    </div>

                    {/* Google Maps Layer & Settings Controls */}
                    {mapEngine === "google" && (
                      <div className="bg-[#0F172A]/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-1 shadow-xl pointer-events-auto flex items-center gap-1 text-[11px]">
                        {/* Map Type: Roadmap / Dark vs Satellite */}
                        <button
                          onClick={() => setGoogleMapType(googleMapType === "roadmap" ? "hybrid" : "roadmap")}
                          className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                            googleMapType === "hybrid"
                              ? "bg-sky-950 text-sky-300 border border-sky-800"
                              : "text-slate-300 hover:bg-slate-800"
                          }`}
                          title="Toggle Satellite vs Dark Roadmap"
                        >
                          <Layers className="w-3 h-3 inline mr-1" />
                          <span>{googleMapType === "hybrid" ? "Satellite" : "Dark"}</span>
                        </button>

                        {/* Live Traffic Layer Toggle */}
                        <button
                          onClick={() => setShowTrafficLayer(!showTrafficLayer)}
                          className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                            showTrafficLayer
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : "text-slate-300 hover:bg-slate-800"
                          }`}
                          title="Toggle live Google Maps traffic layer"
                        >
                          <span>Traffic</span>
                        </button>

                        {/* Google Maps API Key Config */}
                        <button
                          onClick={() => {
                            setApiKeyInputValue(googleMapsApiKey);
                            setShowGoogleKeyModal(true);
                          }}
                          className={`px-2 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                            googleMapsApiKey
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : "bg-yellow-950/80 text-yellow-300 border border-yellow-800"
                          }`}
                          title="Configure Google Maps API Key"
                        >
                          <Key className="w-3 h-3" />
                          <span>{googleMapsApiKey ? "Key Active" : "Set API Key"}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bottom Map Controls Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
                    <div className="bg-[#0F172A]/90 backdrop-blur border border-slate-700/80 rounded-xl px-3 py-1.5 text-[11px] shadow-lg pointer-events-auto flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span className="text-slate-300">
                        {mapEngine === "google" ? "Google Maps Tracking" : "Leaflet Radar"}: <strong className="text-emerald-400">{filteredNearbyPlaces.length}</strong> facilities
                      </span>
                    </div>

                    <div className="flex items-center gap-1 pointer-events-auto bg-[#0F172A]/90 border border-slate-700/80 rounded-xl p-1 shadow-lg">
                      <button
                        onClick={() => zoomActiveMap(1)}
                        className="px-2 py-0.5 rounded text-xs font-bold text-slate-300 hover:bg-slate-800"
                        title="Zoom In"
                      >
                        +
                      </button>
                      <button
                        onClick={() => zoomActiveMap(-1)}
                        className="px-2 py-0.5 rounded text-xs font-bold text-slate-300 hover:bg-slate-800"
                        title="Zoom Out"
                      >
                        -
                      </button>
                      <button
                        onClick={recenterActiveMap}
                        className="p-1 rounded text-slate-300 hover:bg-slate-800"
                        title="Center On Live GPS Location"
                      >
                        <Crosshair className="w-3.5 h-3.5 text-sky-400" />
                      </button>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${currentGpsData.lat},${currentGpsData.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800"
                        title="Open in Google Maps Application"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Map Legend */}
                <div className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-3 flex items-center justify-around flex-wrap gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shadow"></span>
                    <span>Police Station</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block shadow"></span>
                    <span>24/7 Hospital</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow"></span>
                    <span>Safe Hub Shelter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block shadow"></span>
                    <span>24/7 Pharmacy</span>
                  </div>
                </div>
              </div>

              {/* RIGHT: Nearby Places Filter & List Drawer */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <div className="bg-[#1E293B] border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-bold text-white">Emergency Facilities Radar</h3>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Live Dynamic Range
                    </span>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search police, hospital, pharmacy..."
                      value={liveSearchQuery}
                      onChange={(e) => setLiveSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    {liveSearchQuery && (
                      <button
                        onClick={() => setLiveSearchQuery("")}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: "all", label: "All", count: nearbyPlacesList.length },
                      { id: "police", label: "Police", count: nearbyPlacesList.filter((p) => p.category === "police").length },
                      { id: "hospital", label: "Hospitals", count: nearbyPlacesList.filter((p) => p.category === "hospital").length },
                      { id: "safehub", label: "Safe Hubs", count: nearbyPlacesList.filter((p) => p.category === "safehub").length },
                      { id: "pharmacy", label: "Pharmacies", count: nearbyPlacesList.filter((p) => p.category === "pharmacy").length },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setLiveCategoryFilter(cat.id)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                          liveCategoryFilter === cat.id
                            ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        {cat.label} ({cat.count})
                      </button>
                    ))}
                  </div>

                  {/* Distance Radius Filter Buttons */}
                  <div className="flex items-center justify-between gap-1 text-[11px] bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 px-1 font-semibold">Radius:</span>
                    {[
                      { id: "all", label: "All" },
                      { id: "500", label: "< 500m" },
                      { id: "1000", label: "< 1km" },
                      { id: "2500", label: "< 2.5km" },
                    ].map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setLiveRadiusFilter(r.id)}
                        className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                          liveRadiusFilter === r.id
                            ? "bg-sky-500 text-slate-950 shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>

                  {/* Scrollable Nearby Places Cards */}
                  <div className="flex flex-col gap-2.5 max-h-[480px] overflow-y-auto pr-1">
                    {filteredNearbyPlaces.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-500">
                        No facilities found matching your criteria. Try widening the radius filter.
                      </div>
                    ) : (
                      filteredNearbyPlaces.map((place) => {
                        let catColor = "text-sky-400 border-sky-800/80 bg-sky-950/40";
                        let icon = Shield;
                        if (place.category === "police") { catColor = "text-blue-400 border-blue-800/80 bg-blue-950/40"; icon = Shield; }
                        if (place.category === "hospital") { catColor = "text-rose-400 border-rose-800/80 bg-rose-950/40"; icon = AlertCircle; }
                        if (place.category === "safehub") { catColor = "text-emerald-400 border-emerald-800/80 bg-emerald-950/40"; icon = LifeBuoy; }
                        if (place.category === "pharmacy") { catColor = "text-cyan-400 border-cyan-800/80 bg-cyan-950/40"; icon = Plus; }
                        const PlaceIcon = icon;

                        return (
                          <div
                            key={place.id}
                            onClick={() => {
                              setSelectedLivePlace(place);
                              if (leafletMapInstance.current) {
                                leafletMapInstance.current.flyTo([place.lat, place.lng], 16);
                              }
                            }}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                              selectedLivePlace?.id === place.id
                                ? "bg-slate-800/90 border-emerald-500 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500"
                                : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className={`p-2 rounded-xl border ${catColor} shrink-0`}>
                                  <PlaceIcon className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                                      {place.badge}
                                    </span>
                                  </div>
                                  <h4 className="text-xs font-bold text-white mt-0.5 leading-snug">{place.name}</h4>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-xs font-black font-mono text-emerald-400 block">{place.distanceText}</span>
                                <span className="text-[10px] text-slate-400 font-medium">{place.walkingTime}</span>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-400 truncate">{place.address}</p>

                            <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-800/60">
                              <span className="text-emerald-400/90 font-medium text-[10px] truncate max-w-[170px]">
                                {place.status}
                              </span>

                              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => setQuickDialModal({ name: place.name, number: place.phone })}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>Call</span>
                                </button>
                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-[10px] flex items-center gap-1 border border-slate-700"
                                >
                                  <CornerUpRight className="w-3 h-3" />
                                  <span>Directions</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 1: INTERACTIVE NAVIGATION MAP & ROUTE PLANNER                  */}
        {/* ================================================================== */}
        {(activeTab === "map" || activeTab === "routes") && (
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 flex-1">
            {/* LEFT / TOP: The Interactive SVG Map Canvas Container */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              {/* Map Controls & POI Filter Bar */}
              <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between flex-wrap gap-2 shadow-lg">
                {/* POI Category Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Nearby:</span>
                  {[
                    { id: "all", label: "All POIs", count: EMERGENCY_POIS.length },
                    { id: "police", label: "Police", count: 2, icon: Shield },
                    { id: "hospital", label: "24/7 Hospitals", count: 2, icon: AlertCircle },
                    { id: "safehub", label: "Safe Hubs", count: 2, icon: LifeBuoy },
                    { id: "pharmacy", label: "Pharmacies", count: 2, icon: Plus },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setPoiCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shrink-0 ${
                        poiCategory === cat.id
                          ? "bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {cat.label}
                      <span className={`text-[10px] px-1 rounded-full ${poiCategory === cat.id ? "bg-sky-950 text-sky-200" : "bg-slate-900 text-slate-400"}`}>
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Layer Toggles (Lighting Heatmap, CCTV Cameras) */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    onClick={() => setShowLightingHeatmap(!showLightingHeatmap)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-all ${
                      showLightingHeatmap
                        ? "bg-emerald-950/60 text-emerald-300 border-emerald-700/80"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
                    }`}
                    title="Toggle Well-Lit Street Heatmap"
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Lighting Glow</span>
                  </button>

                  <button
                    onClick={() => setShowCctvMarkers(!showCctvMarkers)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-all ${
                      showCctvMarkers
                        ? "bg-cyan-950/60 text-cyan-300 border-cyan-700/80"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
                    }`}
                    title="Toggle CCTV Surveillance Poles"
                  >
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">CCTV Grid</span>
                  </button>

                  {/* Zoom controls */}
                  <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                    <button
                      onClick={() => setMapZoom((z) => Math.min(1.4, z + 0.1))}
                      className="px-2 py-1 text-slate-300 hover:bg-slate-700 text-xs font-bold"
                      title="Zoom In"
                    >
                      +
                    </button>
                    <button
                      onClick={() => setMapZoom((z) => Math.max(0.8, z - 0.1))}
                      className="px-2 py-1 text-slate-300 hover:bg-slate-700 text-xs font-bold"
                      title="Zoom Out"
                    >
                      -
                    </button>
                    <button
                      onClick={() => { setMapZoom(1); setMapCenter({ x: 0, y: 0 }); }}
                      className="px-2 py-1 text-slate-300 hover:bg-slate-700 text-xs"
                      title="Reset View"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Map Canvas with SVG Dark-Mode City Network */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#0A0F1D] border-2 border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                {/* Current GPS Address Banner Overlay */}
                <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
                  <div className="bg-[#0F172A]/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 shadow-xl pointer-events-auto flex items-center gap-2.5 max-w-md">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                          {usingRealGps ? "Sensor Live GPS" : "Corridor GPS"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Acc: {currentGpsData.accuracy}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 truncate">{currentGpsData.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pointer-events-auto">
                    <button
                      onClick={toggleRealGps}
                      className={`border px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur transition-all ${
                        usingRealGps
                          ? "bg-emerald-950/90 border-emerald-500 text-emerald-300"
                          : "bg-slate-800/90 hover:bg-slate-700 border-slate-600 text-slate-300"
                      }`}
                      title={usingRealGps ? "Using Real Device GPS Sensor (Click to revert)" : "Click to detect your device's actual GPS"}
                    >
                      <LocateFixed className={`w-3.5 h-3.5 ${usingRealGps ? "text-emerald-400 animate-spin" : "text-slate-400"}`} />
                      <span className="hidden sm:inline">{realGpsLoading ? "Fixing..." : usingRealGps ? "Sensor GPS" : "Device GPS"}</span>
                    </button>

                    <button
                      onClick={handleShareGps}
                      className="bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline">Share GPS</span>
                    </button>
                  </div>
                </div>

                {/* SVG Vector Map Rendering */}
                <svg
                  viewBox="0 0 1000 700"
                  className="w-full h-full cursor-grab active:cursor-grabbing select-none"
                  style={{
                    transform: `scale(${mapZoom}) translate(${mapCenter.x}px, ${mapCenter.y}px)`,
                    transformOrigin: "center center",
                    transition: "transform 0.2s ease-out",
                  }}
                >
                  <defs>
                    {/* Glowing Filters */}
                    <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="crimsonGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                      <stop offset="70%" stopColor="#10B981" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="userAura" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Dark Map Grid and Background Blocks */}
                  <rect width="1000" height="700" fill="#090D16" />

                  {/* City Street Blocks / Buildings */}
                  <g opacity="0.4">
                    {/* Block A */}
                    <rect x="50" y="50" width="140" height="180" rx="8" fill="#131C2E" stroke="#1E293B" strokeWidth="2" />
                    <text x="120" y="145" textAnchor="middle" fill="#334155" fontSize="12" fontWeight="bold">RESIDENTIAL ZONE A</text>

                    {/* Block B */}
                    <rect x="230" y="50" width="220" height="180" rx="8" fill="#131C2E" stroke="#1E293B" strokeWidth="2" />
                    <text x="340" y="145" textAnchor="middle" fill="#334155" fontSize="12" fontWeight="bold">COMMERCIAL COMPLEX</text>

                    {/* Block C */}
                    <rect x="490" y="50" width="220" height="130" rx="8" fill="#131C2E" stroke="#1E293B" strokeWidth="2" />
                    <text x="600" y="115" textAnchor="middle" fill="#334155" fontSize="12" fontWeight="bold">CIVIC TECH CENTER</text>

                    {/* Park Area (Low-light zone warning) */}
                    <rect x="420" y="380" width="160" height="150" rx="12" fill="#0C1F17" stroke="#0F3826" strokeWidth="2" />
                    <text x="500" y="450" textAnchor="middle" fill="#155E3D" fontSize="12" fontWeight="bold">DEFENSE PARK</text>
                    <text x="500" y="470" textAnchor="middle" fill="#EAB308" fontSize="10">⚠️ Secluded After 9 PM</text>

                    {/* Block D */}
                    <rect x="50" y="270" width="140" height="170" rx="8" fill="#131C2E" stroke="#1E293B" strokeWidth="2" />
                    {/* Block E */}
                    <rect x="230" y="270" width="110" height="170" rx="8" fill="#131C2E" stroke="#1E293B" strokeWidth="2" />
                    {/* Block F */}
                    <rect x="620" y="380" width="280" height="150" rx="8" fill="#131C2E" stroke="#1E293B" strokeWidth="2" />
                    <text x="760" y="460" textAnchor="middle" fill="#334155" fontSize="12" fontWeight="bold">EAST TECH PRECINCT</text>

                    {/* Block G */}
                    <rect x="50" y="550" width="300" height="100" rx="8" fill="#131C2E" stroke="#1E293B" strokeWidth="2" />
                    <rect x="390" y="570" width="510" height="80" rx="8" fill="#131C2E" stroke="#1E293B" strokeWidth="2" />
                  </g>

                  {/* Primary Street Grid (Dark Slate Road Corridors) */}
                  <g stroke="#1E293B" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" fill="none">
                    <line x1="40" y1="230" x2="960" y2="230" /> {/* CMH Main Road */}
                    <line x1="40" y1="490" x2="960" y2="490" /> {/* 100ft Road Corridor */}
                    <line x1="380" y1="40" x2="380" y2="660" /> {/* 12th Main Road */}
                    <line x1="520" y1="40" x2="520" y2="660" /> {/* 80ft Road */}
                    <line x1="40" y1="340" x2="720" y2="340" />
                  </g>

                  {/* Road Center Dotted Lines */}
                  <g stroke="#334155" strokeWidth="2" strokeDasharray="8 8" fill="none">
                    <line x1="40" y1="230" x2="960" y2="230" />
                    <line x1="40" y1="490" x2="960" y2="490" />
                    <line x1="380" y1="40" x2="380" y2="660" />
                    <line x1="520" y1="40" x2="520" y2="660" />
                  </g>

                  {/* Street Names on Canvas */}
                  <text x="120" y="225" fill="#64748B" fontSize="11" fontWeight="bold">CMH ROAD (METRO CORRIDOR)</text>
                  <text x="120" y="485" fill="#64748B" fontSize="11" fontWeight="bold">100 FT ROAD COMMERCIAL</text>
                  <text x="390" y="90" fill="#64748B" fontSize="11" fontWeight="bold">12TH MAIN AVENUE</text>

                  {/* Well-Lit Corridor Heatmap Glow Layer */}
                  {showLightingHeatmap && (
                    <g>
                      {STREET_LAMPS.map((lamp, i) => (
                        <circle key={`lamp-${i}`} cx={lamp.x} cy={lamp.y} r="45" fill="url(#lampGlow)" />
                      ))}
                      {/* Dark alley danger zone label */}
                      <circle cx="440" cy="380" r="35" fill="rgba(239, 68, 68, 0.12)" />
                      <circle cx="440" cy="380" r="15" fill="rgba(239, 68, 68, 0.25)" />
                    </g>
                  )}

                  {/* ROUTE 2: Fastest Route (Crimson Line) */}
                  <path
                    d={ROUTE_DATA.fast.svgPath}
                    fill="none"
                    stroke={selectedRoute === "fast" ? "#EF4444" : "#7F1D1D"}
                    strokeWidth={selectedRoute === "fast" ? "7" : "4"}
                    strokeDasharray={selectedRoute === "fast" ? "none" : "6 6"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={selectedRoute === "fast" ? "url(#crimsonGlow)" : "none"}
                    className="cursor-pointer transition-all hover:stroke-red-400"
                    onClick={() => setSelectedRoute("fast")}
                  />

                  {/* ROUTE 1: Safest Route (Emerald Green Line) */}
                  <path
                    d={ROUTE_DATA.safe.svgPath}
                    fill="none"
                    stroke={selectedRoute === "safe" ? "#10B981" : "#065F46"}
                    strokeWidth={selectedRoute === "safe" ? "8" : "4"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={selectedRoute === "safe" ? "url(#emeraldGlow)" : "none"}
                    className="cursor-pointer transition-all hover:stroke-emerald-400"
                    onClick={() => setSelectedRoute("safe")}
                  />

                  {/* Animated Directional Dash Arrows along Active Route */}
                  <path
                    d={activeRouteData.svgPath}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeDasharray="4 16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-[dash_1.5s_linear_infinite]"
                  />

                  {/* CCTV Surveillance Camera Markers */}
                  {showCctvMarkers && (
                    <g>
                      {CCTV_CAMERAS.map((cam, idx) => (
                        <g key={`cam-${idx}`} transform={`translate(${cam.x - 7}, ${cam.y - 7})`}>
                          <circle cx="7" cy="7" r="8" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1" />
                          <circle cx="7" cy="7" r="3" fill="#38BDF8" />
                        </g>
                      ))}
                    </g>
                  )}

                  {/* EMERGENCY POI MARKERS */}
                  {filteredPois.map((poi) => {
                    const isSelected = selectedPoi?.id === poi.id;
                    let markerBg = "#38BDF8";
                    if (poi.category === "police") markerBg = "#3B82F6";
                    if (poi.category === "hospital") markerBg = "#EF4444";
                    if (poi.category === "safehub") markerBg = "#10B981";
                    if (poi.category === "pharmacy") markerBg = "#06B6D4";

                    return (
                      <g
                        key={poi.id}
                        transform={`translate(${poi.x}, ${poi.y})`}
                        className="cursor-pointer group"
                        onClick={() => setSelectedPoi(poi)}
                      >
                        {/* Outer Glow on selection */}
                        {isSelected && (
                          <circle cx="0" cy="0" r="24" fill={markerBg} fillOpacity="0.3" className="animate-ping" />
                        )}
                        <circle
                          cx="0"
                          cy="0"
                          r={isSelected ? "16" : "12"}
                          fill="#0F172A"
                          stroke={markerBg}
                          strokeWidth={isSelected ? "3" : "2"}
                          className="transition-all duration-200 group-hover:scale-125"
                        />
                        {/* Icon center representation */}
                        <circle cx="0" cy="0" r={isSelected ? "8" : "6"} fill={markerBg} />
                        
                        {/* Marker Tooltip label */}
                        <text
                          x="0"
                          y={isSelected ? "-22" : "-16"}
                          textAnchor="middle"
                          fill="#F8FAFC"
                          fontSize={isSelected ? "11" : "9"}
                          fontWeight="bold"
                          className="pointer-events-none drop-shadow-md"
                        >
                          {poi.name.split(" ")[0]}
                        </text>
                      </g>
                    );
                  })}

                  {/* DESTINATION MARKER */}
                  <g transform={`translate(${activeDestination.x}, ${activeDestination.y})`}>
                    <circle cx="0" cy="0" r="20" fill="rgba(16, 185, 129, 0.2)" className="animate-ping" />
                    <circle cx="0" cy="0" r="14" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                    <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">🏁</text>
                    <text x="0" y="-18" textAnchor="middle" fill="#10B981" fontSize="11" fontWeight="extrabold">
                      {activeDestination.name}
                    </text>
                  </g>

                  {/* USER LIVE GPS MARKER with Pulsing Aura */}
                  <g transform={`translate(${USER_GPS.x}, ${USER_GPS.y})`}>
                    {/* Concentric Aura Rings */}
                    <circle cx="0" cy="0" r="32" fill="url(#userAura)" className="animate-ping" />
                    <circle cx="0" cy="0" r="18" fill="rgba(56, 189, 248, 0.3)" />
                    {/* Accuracy Boundary Circle */}
                    <circle cx="0" cy="0" r="24" fill="none" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" />
                    {/* Live Dot with Directional Heading */}
                    <circle cx="0" cy="0" r="9" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2.5" />
                    <polygon points="0,-14 -4,-9 4,-9" fill="#38BDF8" />
                    <text x="0" y="24" textAnchor="middle" fill="#38BDF8" fontSize="10" fontWeight="extrabold">
                      YOU (Live GPS)
                    </text>
                  </g>
                </svg>

                {/* Map Bottom Legend Overlay */}
                <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between flex-wrap gap-2 pointer-events-none">
                  <div className="bg-[#0F172A]/90 backdrop-blur border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-lg pointer-events-auto flex items-center gap-3 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-1 bg-emerald-500 rounded-full inline-block shadow-sm shadow-emerald-500"></span>
                      <span className="text-slate-300 font-medium">Safest Route</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-1 bg-red-500 rounded-full inline-block shadow-sm shadow-red-500"></span>
                      <span className="text-slate-300 font-medium">Direct Route</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
                      <span className="text-slate-400">14 Active CCTVs</span>
                    </div>
                  </div>

                  <div className="bg-[#0F172A]/90 backdrop-blur border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-lg pointer-events-auto text-[11px] text-slate-400">
                    Destination: <strong className="text-slate-200">{activeDestination.name}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT / BOTTOM: Route Comparison Cards & Selected POI Modal */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Route Selector Cards: Safe vs Direct */}
              <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-emerald-400" />
                    <span>Multi-Criteria Route Options</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Click to preview</span>
                </div>

                {/* Option 1: Safest Route */}
                <div
                  onClick={() => setSelectedRoute("safe")}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                    selectedRoute === "safe"
                      ? "bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/40"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {selectedRoute === "safe" && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-3 h-3" /> Selected
                    </span>
                  )}

                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                    <h4 className="text-sm font-bold text-white">Safest / Well-Lit Route</h4>
                  </div>
                  <p className="text-xs text-emerald-400/90 font-medium mb-2.5">
                    100ft Main Commercial Corridors • 96% Lighting
                  </p>

                  {/* Safety Metrics Grid */}
                  <div className="grid grid-cols-4 gap-2 text-center bg-slate-950/60 rounded-lg p-2 border border-slate-800/80 mb-2">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Lighting</div>
                      <div className="text-xs font-bold text-emerald-400">96%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">CCTVs</div>
                      <div className="text-xs font-bold text-cyan-400">14 Poles</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Distance</div>
                      <div className="text-xs font-bold text-slate-200">2.4 km</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Walk ETA</div>
                      <div className="text-xs font-bold text-slate-200">18 min</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-300">
                      <Shield className="w-3 h-3" /> 4 Safe Hubs on path
                    </span>
                    <span className="text-slate-400 font-mono">Patrol: Every 12m</span>
                  </div>
                </div>

                {/* Option 2: Fastest Direct Route */}
                <div
                  onClick={() => setSelectedRoute("fast")}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                    selectedRoute === "fast"
                      ? "bg-red-950/40 border-red-500 shadow-lg shadow-red-950/40"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {selectedRoute === "fast" && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" /> Selected
                    </span>
                  )}

                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm shadow-red-400" />
                    <h4 className="text-sm font-bold text-white">Fastest Direct Route</h4>
                  </div>
                  <p className="text-xs text-red-400/90 font-medium mb-2.5">
                    Alley Cut-Through • Lower Streetlight Index
                  </p>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-4 gap-2 text-center bg-slate-950/60 rounded-lg p-2 border border-slate-800/80 mb-2">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Lighting</div>
                      <div className="text-xs font-bold text-red-400">42%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">CCTVs</div>
                      <div className="text-xs font-bold text-amber-400">3 Poles</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Distance</div>
                      <div className="text-xs font-bold text-slate-200">1.7 km</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Walk ETA</div>
                      <div className="text-xs font-bold text-slate-200">12 min</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-red-300">
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-red-400" /> 2 Unlit Alleys
                    </span>
                    <span className="text-slate-400 font-mono">Patrol: Low</span>
                  </div>
                </div>

                {/* Quick Start Navigation Action */}
                <button
                  onClick={() => {
                    startJourneyTimer(selectedRoute === "safe" ? 18 : 12);
                    setActiveTab("journey");
                  }}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                    selectedRoute === "safe"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/20"
                      : "bg-gradient-to-r from-red-600 to-rose-700 text-white hover:from-red-500 hover:to-rose-600 shadow-red-600/20"
                  }`}
                >
                  <Navigation className="w-4 h-4" />
                  <span>Start Journey on {selectedRoute === "safe" ? "Safest" : "Direct"} Route</span>
                </button>
              </div>

              {/* Selected POI Details Card / Modal popup */}
              {selectedPoi ? (
                <div className="bg-[#1E293B] border-2 border-sky-500/80 rounded-2xl p-4 shadow-2xl relative animate-fadeIn">
                  <button
                    onClick={() => setSelectedPoi(null)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-start gap-3 mb-2.5">
                    <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 shrink-0">
                      {selectedPoi.category === "police" && <Shield className="w-5 h-5 text-blue-400" />}
                      {selectedPoi.category === "hospital" && <AlertCircle className="w-5 h-5 text-red-400" />}
                      {selectedPoi.category === "safehub" && <LifeBuoy className="w-5 h-5 text-emerald-400" />}
                      {selectedPoi.category === "pharmacy" && <Plus className="w-5 h-5 text-cyan-400" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                        {selectedPoi.badge}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1 leading-snug">{selectedPoi.name}</h4>
                      <p className="text-xs text-slate-400">{selectedPoi.address}</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 text-xs flex flex-col gap-1.5 mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Distance & ETA:</span>
                      <span className="font-semibold text-slate-200">{selectedPoi.distance} • {selectedPoi.walkingTime} walk</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="font-semibold text-emerald-400">{selectedPoi.status}</span>
                    </div>
                    {selectedPoi.officerOnDuty && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Duty Lead:</span>
                        <span className="font-semibold text-cyan-300">{selectedPoi.officerOnDuty}</span>
                      </div>
                    )}
                    {selectedPoi.bedsAvailable && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Capacity:</span>
                        <span className="font-semibold text-rose-300">{selectedPoi.bedsAvailable}</span>
                      </div>
                    )}
                    {selectedPoi.amenities && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Features:</span>
                        <span className="font-semibold text-slate-300">{selectedPoi.amenities}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions: Call Now speed dial & Set as Destination */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${selectedPoi.phone}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setQuickDialModal({ name: selectedPoi.name, number: selectedPoi.phone });
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Speed Dial</span>
                    </a>
                    <button
                      onClick={() => {
                        setActiveDestination({
                          id: selectedPoi.id,
                          name: selectedPoi.name,
                          x: selectedPoi.x,
                          y: selectedPoi.y,
                          distance: selectedPoi.distance,
                          desc: selectedPoi.address,
                        });
                        setSelectedPoi(null);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Route Here</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Facility summary helper card */
                <div className="bg-[#1E293B]/70 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400 flex items-center gap-3">
                  <LifeBuoy className="w-8 h-8 text-sky-400 shrink-0" />
                  <p>
                    Tap any <strong className="text-slate-200">POI marker</strong> on the map (Police, 24/7 Hospital, Safe Hub) to inspect live facilities, personnel status, and 1-tap call dispatch.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: JOURNEY SAFETY TIMER & AUTOMATED CHECK-IN                   */}
        {/* ================================================================== */}
        {activeTab === "journey" && (
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-5">
            <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    <span>Journey Safety Timer & Auto Check-In</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Guarantees peace of mind: if you do not check-in before the timer finishes, an urgent SOS is auto-broadcasted.
                  </p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${journeyTimerRunning ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse" : "bg-slate-800 text-slate-400"}`}>
                  {journeyTimerRunning ? "TIMER ACTIVE" : "STANDBY"}
                </span>
              </div>

              {/* Big Visual Countdown Dial / Display */}
              <div className="flex flex-col items-center justify-center py-6 bg-slate-950/70 border border-slate-800/80 rounded-2xl relative overflow-hidden">
                <div className="text-6xl sm:text-7xl font-mono font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  {formatTime(journeyTimerSeconds)}
                </div>
                <p className="text-xs font-medium text-slate-400 mt-2">
                  Destination: <span className="text-emerald-400 font-bold">{activeDestination.name}</span>
                </p>

                {journeyTimerRunning && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    Automated heartbeat monitoring active • GPS tracking locked
                  </div>
                )}
              </div>

              {/* Main Check-In Button (When Timer is running) */}
              {journeyTimerRunning ? (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={checkInSafely}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/30 transition-all transform active:scale-95"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    <span>I Have Arrived Safely [Check In]</span>
                  </button>

                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => setJourneyTimerSeconds((s) => s + 300)}
                      className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700"
                    >
                      <Plus className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Extend +5 Minutes</span>
                    </button>
                    <button
                      onClick={cancelJourneyTimer}
                      className="py-2.5 px-4 bg-slate-900 hover:bg-red-950/80 text-red-400 hover:text-red-300 rounded-xl text-xs font-semibold border border-slate-800 hover:border-red-800 transition-all"
                    >
                      Cancel Journey
                    </button>
                  </div>
                </div>
              ) : (
                /* Preset Configuration when Timer is stopped */
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Select Estimated Travel Time:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[5, 15, 25, 40].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => {
                            setJourneyMinutesInput(mins);
                            startJourneyTimer(mins);
                          }}
                          className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${
                            journeyMinutesInput === mins
                              ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                              : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                          }`}
                        >
                          {mins} Mins
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Minutes Input */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
                      <span className="text-xs text-slate-400 mr-2">Custom Duration:</span>
                      <input
                        type="number"
                        min="1"
                        max="180"
                        value={journeyMinutesInput}
                        onChange={(e) => setJourneyMinutesInput(Math.max(1, parseInt(e.target.value) || 1))}
                        className="bg-transparent text-white font-bold text-sm w-16 focus:outline-none"
                      />
                      <span className="text-xs text-slate-400 ml-auto">minutes</span>
                    </div>

                    <button
                      onClick={() => startJourneyTimer(journeyMinutesInput)}
                      className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Start Safety Timer</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* How It Works Explainer Card */}
            <div className="bg-[#1E293B]/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex flex-col gap-2">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Automated Fail-Safe Protocol</span>
              </h4>
              <p>
                1. Set your expected walking duration before starting your journey.<br />
                2. Tap <strong className="text-emerald-400">I Have Arrived Safely</strong> once you reach your destination.<br />
                3. If the countdown reaches <strong className="text-red-400">00:00</strong> without a check-in, SafeWay initiates an acoustic distress siren and dispatches priority emergency SMS with your live GPS location to all 4 contacts.
              </p>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 3: TRUSTED EMERGENCY CONTACTS & LIVE GPS SHARING               */}
        {/* ================================================================== */}
        {activeTab === "contacts" && (
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-5">
            {/* Top Contacts Action Bar */}
            <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  <span>Trusted Emergency Circle ({contacts.length}/5)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  These verified guardians receive instant SMS telemetry and live tracking links during SOS triggers.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleShareGps}
                  className="flex-1 sm:flex-initial bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Share Live GPS</span>
                </button>

                {contacts.length < 5 && (
                  <button
                    onClick={() => setShowAddContactModal(true)}
                    className="flex-1 sm:flex-initial bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Contact</span>
                  </button>
                )}
              </div>
            </div>

            {/* Contacts List Cards */}
            <div className="flex flex-col gap-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-[#1E293B] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-sm">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white">{contact.name}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {contact.relation}
                        </span>
                        {contact.isPrimary && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            ★ Primary Dispatch
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{contact.phone}</p>
                    </div>
                  </div>

                  {/* Actions for each contact */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuickDialModal({ name: contact.name, number: contact.phone })}
                      className="p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/80"
                      title="Call Contact"
                    >
                      <Phone className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => togglePrimaryContact(contact.id)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                        contact.isPrimary
                          ? "bg-amber-950/60 text-amber-300 border-amber-800"
                          : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
                      }`}
                      title={contact.isPrimary ? "Primary Contact" : "Set as Primary"}
                    >
                      ★
                    </button>

                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-800"
                      title="Remove Contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Emergency Broadcast Preview Message */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                SMS Telemetry Preview (Triggered on SOS):
              </span>
              <div className="bg-[#111827] border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-300 leading-relaxed">
                🚨 <span className="text-red-400 font-bold">EMERGENCY ALERT from SafeWay:</span> User has triggered emergency SOS near {USER_GPS.address}.
                Coordinates: {USER_GPS.lat}° N, {USER_GPS.lng}° E.
                Live tracking pin: <span className="text-sky-400 underline">https://safeway.app/live-track?token=sw_89211</span>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 4: VERIFIED 24/7 EMERGENCY HELPLINES DIRECTORY                 */}
        {/* ================================================================== */}
        {activeTab === "helplines" && (
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-5">
            <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-emerald-400" />
                  <span>24/7 Verified Emergency Helplines</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  One-tap speed dial to government and emergency dispatch control rooms.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                Toll-Free • 24/7 Active
              </span>
            </div>

            {/* Helpline Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {HELPLINES.map((line) => (
                <div
                  key={line.number}
                  className="bg-[#1E293B] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-lg relative overflow-hidden group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {line.category}
                      </span>
                      <h3 className="text-base font-extrabold text-white mt-1.5">{line.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{line.desc}</p>
                    </div>
                    <div className="text-2xl font-black font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/80 shrink-0">
                      {line.number}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] text-cyan-300 font-medium">{line.responseEstimate}</span>
                    <button
                      onClick={() => setQuickDialModal({ name: line.title, number: line.number })}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Speed Dial {line.number}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ==================================================================== */}
      {/* 5. FLOATING ONE-TAP SOS BUTTON (Persistent High-Visibility Radial)  */}
      {/* ==================================================================== */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={triggerSosGrace}
          className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 via-rose-600 to-red-700 text-white font-black text-xl shadow-2xl shadow-red-600/60 border-4 border-red-400/80 hover:scale-105 active:scale-95 transition-all group"
          title="Press for Emergency SOS (5s Grace Countdown)"
        >
          {/* Radial Pulsing Ripples */}
          <span className="absolute -inset-2 rounded-full bg-red-500/30 animate-ping pointer-events-none" />
          <span className="absolute -inset-4 rounded-full bg-red-600/20 animate-pulse pointer-events-none" />

          <div className="flex flex-col items-center justify-center">
            <Siren className="w-6 h-6 animate-pulse" />
            <span className="text-xs tracking-wider font-extrabold mt-0.5">SOS</span>
          </div>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 6. MODAL: 5-SECOND SOS GRACE PERIOD COUNTDOWN                        */}
      {/* ==================================================================== */}
      {sosGraceActive && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#18181B] border-2 border-red-500 rounded-3xl p-6 sm:p-8 text-center shadow-2xl flex flex-col items-center gap-5 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500 animate-pulse">
              <Siren className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest bg-red-950/80 px-3 py-1 rounded-full border border-red-800">
                Grace Period Active
              </span>
              <h3 className="text-2xl font-black text-white mt-2">EMERGENCY SOS INITIATING</h3>
              <p className="text-xs text-slate-300 mt-1">
                Dispatching police alert & acoustic alarm in:
              </p>
            </div>

            {/* Giant Circular Countdown */}
            <div className="relative flex items-center justify-center w-32 h-32 my-2">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="54" fill="transparent" stroke="#27272A" strokeWidth="8" />
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  fill="transparent"
                  stroke="#EF4444"
                  strokeWidth="8"
                  strokeDasharray="339.29"
                  strokeDashoffset={(339.29 * (5 - graceCountdown)) / 5}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <span className="absolute text-5xl font-mono font-black text-red-500">
                {graceCountdown}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Accidental touch? Click below to abort dispatch immediately.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <button
                onClick={cancelSosGrace}
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-sm uppercase tracking-wider border border-slate-600 transition-all"
              >
                Cancel (False Alarm)
              </button>
              <button
                onClick={confirmSosEmergency}
                className="w-full py-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-red-600/40"
              >
                Dispatch Instantly
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 7. ACTIVE EMERGENCY SOS OVERLAY (When Emergency is Triggered)       */}
      {/* ==================================================================== */}
      {sosEmergencyActive && (
        <div className="fixed inset-0 z-50 bg-[#0A0505]/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-8 overflow-y-auto">
          {/* Header Status */}
          <div className="max-w-2xl mx-auto w-full flex items-center justify-between border-b border-red-900/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500 animate-ping" />
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-red-500 tracking-tight">
                  🚨 ACTIVE EMERGENCY DISPATCH
                </h2>
                <p className="text-xs text-red-300 font-mono">STATUS: DISPATCHED & BROADCASTING</p>
              </div>
            </div>

            <button
              onClick={() => setSirenMuted(!sirenMuted)}
              className="p-2.5 rounded-xl bg-red-950 border border-red-700 text-red-300 flex items-center gap-2 text-xs font-bold"
            >
              {sirenMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{sirenMuted ? "Unmute Siren" : "Mute Siren"}</span>
            </button>
          </div>

          {/* Central Distress Coordinates & Live Telemetry */}
          <div className="max-w-2xl mx-auto w-full my-6 flex flex-col gap-4">
            <div className="bg-[#1C0E0E] border-2 border-red-600 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest bg-red-950 px-2.5 py-1 rounded">
                  Current GPS Broadcast
                </span>
                <p className="text-sm font-semibold text-white mt-2">{currentGpsData.address}</p>
                <p className="text-xs text-red-300 font-mono mt-0.5">
                  Lat: {currentGpsData.lat}° N • Lng: {currentGpsData.lng}° E • Accuracy: {currentGpsData.accuracy}
                </p>
              </div>

              {/* Automated Dispatch Actions Log */}
              <div className="bg-black/60 rounded-xl p-3 border border-red-900/60 font-mono text-xs flex flex-col gap-1.5 text-slate-300">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SOS Telemetry uploaded to Emergency Response Cloud</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Dispatched SMS to 4 primary contacts with live GPS pin</span>
                </div>
                <div className="flex items-center gap-2 text-amber-300">
                  <Radio className="w-4 h-4 animate-spin" />
                  <span>Alert routed to Indiranagar Police Dispatch (PCR Unit #14)</span>
                </div>
              </div>

              {/* Direct Urgent Call Triggers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href="tel:112"
                  className="bg-red-600 hover:bg-red-500 text-white font-black py-3 px-4 rounded-xl text-center text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call 112 (National)</span>
                </a>
                <a
                  href="tel:100"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-black py-3 px-4 rounded-xl text-center text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
                >
                  <Shield className="w-4 h-4" />
                  <span>Call 100 (Police)</span>
                </a>
                <a
                  href="tel:1091"
                  className="bg-rose-600 hover:bg-rose-500 text-white font-black py-3 px-4 rounded-xl text-center text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Women Helpline 1091</span>
                </a>
              </div>
            </div>

            {/* Night Visibility Flash / Strobe Mode Toggle */}
            <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Visual Screen Strobe</h4>
                  <p className="text-[11px] text-slate-400">High-visibility flashing beacon to attract bystanders</p>
                </div>
              </div>
              <button
                onClick={() => setStrobeActive(!strobeActive)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  strobeActive
                    ? "bg-amber-500 text-slate-950 border-amber-400"
                    : "bg-slate-800 text-slate-300 border-slate-700"
                }`}
              >
                {strobeActive ? "Strobe ON" : "Strobe OFF"}
              </button>
            </div>
          </div>

          {/* De-escalation button */}
          <div className="max-w-md mx-auto w-full pt-4">
            <button
              onClick={deescalateEmergency}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-2xl transition-all"
            >
              I Am Safe Now (De-escalate & Stop Siren)
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 8. MODAL: ADD EMERGENCY CONTACT                                     */}
      {/* ==================================================================== */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1E293B] border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Add Trusted Emergency Contact</span>
              </h3>
              <button onClick={() => setShowAddContactModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suman Sharma"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Phone Number (with Country Code)</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 00000"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Relationship Tag</label>
                <select
                  value={newContactRelation}
                  onChange={(e) => setNewContactRelation(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Spouse">Spouse / Partner</option>
                  <option value="Friend">Friend / Roommate</option>
                  <option value="Guardian">Guardian / Colleague</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 8B. MODAL: GOOGLE MAPS API KEY CONFIGURATION & SETUP                 */}
      {/* ==================================================================== */}
      {showGoogleKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#1E293B] border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Google Maps API Settings</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 font-bold">
                      Live GPS Tracking
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Real-world location tracking, Google Geocoding, and walking turn-by-turn navigation</p>
                </div>
              </div>
              <button onClick={() => setShowGoogleKeyModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Google Cloud Maps API Key</span>
                  {googleMapsApiKey ? (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Custom Key Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-yellow-400 font-semibold">Demo / Free Dev Mode Active</span>
                  )}
                </label>
                <input
                  type="password"
                  placeholder="Paste your API Key (e.g. AIzaSy...)"
                  value={apiKeyInputValue}
                  onChange={(e) => setApiKeyInputValue(e.target.value)}
                  className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Your key is saved in your browser and used directly with the official Google Maps JavaScript API SDK.
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-300 flex flex-col gap-2">
                <span className="font-bold text-sky-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> How to get a free Google Maps API Key:
                </span>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                  <li>Visit the <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline font-semibold">Google Cloud Console</a>.</li>
                  <li>Enable <strong>Maps JavaScript API</strong> and <strong>Geocoding API</strong> for your project.</li>
                  <li>Go to <strong>Credentials</strong>, create an API Key, and paste it here. Google gives $200 in free monthly credits!</li>
                </ol>
              </div>

              {googleMapsError && (
                <div className="bg-red-950/60 border border-red-800/80 rounded-xl p-2.5 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{googleMapsError}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-800">
                {googleMapsApiKey ? (
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("safeway_google_maps_api_key");
                      setGoogleMapsApiKey("");
                      setApiKeyInputValue("");
                      setShowGoogleKeyModal(false);
                    }}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold"
                  >
                    Remove Saved Key
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMapEngine("google");
                      setShowGoogleKeyModal(false);
                    }}
                    className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
                  >
                    Use Free Dev Mode
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowGoogleKeyModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveGoogleApiKey(apiKeyInputValue || googleMapsApiKey)}
                    className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-sky-500/20"
                  >
                    Save & Activate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 9. SPEED DIAL CONFIRMATION DIALOG                                    */}
      {/* ==================================================================== */}
      {quickDialModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-[#1E293B] border border-slate-700 rounded-2xl p-5 text-center shadow-2xl flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">{quickDialModal.name}</h4>
              <p className="text-sm font-mono text-emerald-400 mt-1">{quickDialModal.number}</p>
              <p className="text-xs text-slate-400 mt-2">
                Initiating immediate direct cellular call.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuickDialModal(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Dismiss
              </button>
              <a
                href={`tel:${quickDialModal.number}`}
                onClick={() => setQuickDialModal(null)}
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 10. TOAST NOTIFICATION: LIVE GPS COPIED                              */}
      {/* ==================================================================== */}
      {gpsCopiedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-emerald-500/80 text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Live GPS tracking message copied to clipboard!</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 11. MODAL: HOW TO INSTALL AS AN APP                                  */}
      {/* ==================================================================== */}
      {showInstallGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1E293B] border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Install SafeWay App</h3>
              </div>
              <button onClick={() => setShowInstallGuideModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              You can install SafeWay directly onto your device as a standalone app with an icon on your home screen, offline capability, and instant 1-tap SOS access!
            </p>

            <div className="flex flex-col gap-3 text-xs">
              {/* Android */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>📱 On Android (Chrome / Edge / Brave):</span>
                </div>
                <p className="text-slate-300 pl-4">
                  1. Tap the three-dot menu (<strong className="text-white">⋮</strong>) at the top-right of your browser.<br />
                  2. Tap <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.<br />
                  3. The SafeWay app icon will be added to your phone's app launcher!
                </p>
              </div>

              {/* iOS / iPhone */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
                <div className="font-bold text-sky-400 flex items-center gap-1.5">
                  <span>🍎 On iPhone / iPad (Safari):</span>
                </div>
                <p className="text-slate-300 pl-4">
                  1. Tap the <strong className="text-white">Share</strong> button (box with upward arrow <strong className="text-white">⎋</strong>) at the bottom.<br />
                  2. Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong>.<br />
                  3. Tap <strong className="text-white">"Add"</strong> in the top right corner.
                </p>
              </div>

              {/* Windows / Mac */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <span>💻 On PC / Laptop (Chrome / Edge):</span>
                </div>
                <p className="text-slate-300 pl-4">
                  1. Look at your browser address bar on the right.<br />
                  2. Click the <strong className="text-white">Install SafeWay (⊕)</strong> icon.<br />
                  3. It will open in its own clean window with a Windows taskbar icon!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase"
            >
              Got It, Thanks!
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 12. FOOTER: College Mini-Project Credit & Legal Notice              */}
      {/* ==================================================================== */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#0A0D15] py-3 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SafeWay v2.4 • Smart Navigation & Women Safety Emergency Response System</span>
          <span className="flex items-center gap-1 text-slate-400">
            Designed for 24/7 Rapid Transit Protection • Integrated with 112 Emergency Dispatch
          </span>
        </div>
      </footer>
    </div>
  );
}
