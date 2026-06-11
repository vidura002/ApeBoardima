import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LocateFixed } from 'lucide-react';

const AREA_CENTERS: Record<string, [number, number]> = {
  Malabe: [6.9061, 79.9696],
  Kaduwela: [6.9357, 79.9842],
};

const DEFAULT_CENTER: [number, number] = AREA_CENTERS.Malabe;

interface LocationPickerProps {
  area: string;
  latitude: string;
  longitude: string;
  onPick: (latitude: string, longitude: string) => void;
}

function pinIcon() {
  return L.divIcon({
    className: '',
    html: '<div class="w-6 h-6 rounded-full bg-[#0F172A] border-[3px] border-white shadow-lg"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function selectedPoint(latitude: string, longitude: string): [number, number] | null {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
}

export default function LocationPicker({ area, latitude, longitude, onPick }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onPickRef = useRef(onPick);

  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: AREA_CENTERS[area] || DEFAULT_CENTER,
      zoom: 15,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    map.on('click', event => {
      onPickRef.current(
        event.latlng.lat.toFixed(6),
        event.latlng.lng.toFixed(6),
      );
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const point = selectedPoint(latitude, longitude);
    if (point) {
      if (!markerRef.current) {
        markerRef.current = L.marker(point, { icon: pinIcon(), draggable: true }).addTo(map);
        markerRef.current.on('dragend', () => {
          const next = markerRef.current?.getLatLng();
          if (!next) return;
          onPickRef.current(next.lat.toFixed(6), next.lng.toFixed(6));
        });
      } else {
        markerRef.current.setLatLng(point);
      }

      map.setView(point, Math.max(map.getZoom(), 16));
      return;
    }

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [latitude, longitude]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || selectedPoint(latitude, longitude)) return;
    map.setView(AREA_CENTERS[area] || DEFAULT_CENTER, 14);
  }, [area, latitude, longitude]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(position => {
      onPickRef.current(
        position.coords.latitude.toFixed(6),
        position.coords.longitude.toFixed(6),
      );
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC]">
      <div ref={containerRef} className="h-72 w-full" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#E5E7EB] bg-white px-4 py-3">
        <p className="text-xs font-medium text-[#64748B]">
          {latitude && longitude ? 'Pin selected. Drag it to adjust.' : 'Click the property spot on the map.'}
        </p>
        <button
          type="button"
          onClick={useCurrentLocation}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
        >
          <LocateFixed className="w-3.5 h-3.5" />
          Use my location
        </button>
      </div>
    </div>
  );
}
