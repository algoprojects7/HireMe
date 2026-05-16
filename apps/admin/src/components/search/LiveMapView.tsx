"use client";

import React, { useEffect, useState, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Marker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { MapView } from '@repo/ui';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Light silver map style for a premium feel
const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
  { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
];

// Map centering component
function MapController({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
    }
  }, [center, map]);
  return null;
}

// Map click handler
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const listener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        onClick(e.latLng.lat(), e.latLng.lng());
      }
    });
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, onClick]);
  return null;
}

interface LiveMapViewProps {
  workers: any[];
  center: { lat: number; lng: number };
  onWorkerClick: (worker: any) => void;
  onMapClick: (lat: number, lng: number) => void;
}

// Worker marker pin content
function WorkerPin({ worker }: { worker: any }) {
  const isLeader = worker.isGroupLeader;
  const borderColor = isLeader ? '#a855f7' : '#3b82f6';
  const pulseColor = isLeader ? 'rgba(168, 85, 247, 0.4)' : 'rgba(59, 130, 246, 0.4)';
  const photoUrl = worker.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.user.name)}&background=3b82f6&color=fff&bold=true&size=80`;

  return (
    <div style={{ position: 'relative', cursor: 'pointer' }}>
      {/* Pulse ring */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: pulseColor,
          animation: 'pulse-ring 2s ease-out infinite',
        }}
      />
      {/* Avatar card */}
      <div
        style={{
          position: 'relative',
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: `3px solid ${borderColor}`,
          overflow: 'hidden',
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          background: '#fff',
        }}
      >
        <img
          src={photoUrl}
          alt={worker.user.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      {/* Rating badge */}
      <div
        style={{
          position: 'absolute',
          bottom: -6,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff',
          border: `2px solid ${borderColor}`,
          borderRadius: 12,
          padding: '1px 7px',
          fontSize: 10,
          fontWeight: 800,
          color: '#111',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <span style={{ color: '#f59e0b' }}>★</span> {worker.rating?.toFixed(1) || '0.0'}
      </div>
    </div>
  );
}

export default function LiveMapView({ workers, center, onWorkerClick, onMapClick }: LiveMapViewProps) {
  const [activeWorker, setActiveWorker] = useState<any>(null);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setActiveWorker(null);
    onMapClick(lat, lng);
  }, [onMapClick]);

  if (!API_KEY) {
    return <MapView workers={workers} center={center} onWorkerClick={onWorkerClick} onMapClick={onMapClick} />;
  }

  return (
    <div className="w-full h-full relative z-10">
      <APIProvider apiKey={API_KEY}>
        <Map
          defaultCenter={center}
          defaultZoom={14}
          mapId="8e0a97af9386fef" // Standard demo Map ID to support Advanced Markers
          gestureHandling="greedy"
          disableDefaultUI={false}
          style={{ width: '100%', height: '100%' }}
        >
          <MapController center={center} />
          <MapClickHandler onClick={handleMapClick} />

          {/* Worker Markers */}
          {workers.map((worker) => (
            <AdvancedMarker
              key={worker.id}
              position={{
                lat: worker.currentLat || 26.1445,
                lng: worker.currentLng || 91.7362,
              }}
              onClick={() => {
                setActiveWorker(worker);
                onWorkerClick(worker);
              }}
            >
              <WorkerPin worker={worker} />
            </AdvancedMarker>
          ))}

          {/* Center navigation pin */}
          <AdvancedMarker position={center}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#3b82f6',
                border: '4px solid #fff',
                boxShadow: '0 0 0 2px #3b82f6, 0 4px 12px rgba(59,130,246,0.4)',
                animation: 'pulse-ring 2s ease-out infinite',
              }}
            />
          </AdvancedMarker>

          {/* InfoWindow popup for active worker */}
          {activeWorker && (
            <InfoWindow
              position={{
                lat: activeWorker.currentLat || 26.1445,
                lng: activeWorker.currentLng || 91.7362,
              }}
              onCloseClick={() => setActiveWorker(null)}
            >
              <div style={{ padding: 8, textAlign: 'center', minWidth: 180 }}>
                <p style={{ fontWeight: 900, fontSize: 14, color: '#111', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                  {activeWorker.user.name}
                </p>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {activeWorker.skills?.map((s: any) => s.skill.name).join(' • ')}
                </p>
                <button
                  onClick={() => onWorkerClick(activeWorker)}
                  style={{
                    width: '100%',
                    background: '#3b82f6',
                    color: '#fff',
                    padding: '8px 0',
                    borderRadius: 12,
                    fontSize: 10,
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                  }}
                >
                  View Full Profile
                </button>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Pulse animation keyframes */}
      <style jsx global>{`
        @keyframes pulse-ring {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
        }
      `}</style>

      <div className="absolute left-6 bottom-6 px-4 py-2 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full text-[10px] font-bold text-gray-500 tracking-widest uppercase z-30 shadow-sm">
        Live AI Network Tracking
      </div>
    </div>
  );
}
