"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { MapView } from '@repo/ui';
import { Sparkles } from 'lucide-react';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Light silver map style for a premium feel
const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#f8fafc' }] }, // slate-50
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] }, // slate-500
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f8fafc' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#cbd5e1' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#f1f5f9' }] }, // slate-100
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] }, // slate-200
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#cbd5e1' }] },
  { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#f1f5f9' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e0f2fe' }] }, // sky-100 (soft blue)
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#0369a1' }] },
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
    const listener = map.addListener('click', (e: any) => {
      if (e.latLng) {
        onClick(e.latLng.lat(), e.latLng.lng());
      }
    });
    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, [map, onClick]);
  return null;
}

interface LiveMapViewProps {
  workers: any[];
  center: { lat: number; lng: number };
  onWorkerClick: (worker: any) => void;
  onMapClick: (lat: number, lng: number) => void;
  hoveredWorkerId?: string | null;
}

// Worker marker pin content
function WorkerPin({ worker, isHovered }: { worker: any; isHovered?: boolean }) {
  const isLeader = worker.isGroupLeader;
  const primarySkill = worker.skills?.[0]?.skill?.name || '';
  
  // Map skill name to emoji
  let emoji = '💼';
  const nameLower = primarySkill.toLowerCase();
  if (nameLower.includes('plumb')) emoji = '🔧';
  else if (nameLower.includes('electr')) emoji = '⚡';
  else if (nameLower.includes('carpent')) emoji = '🪚';
  else if (nameLower.includes('paint')) emoji = '🎨';
  else if (nameLower.includes('clean')) emoji = '🧹';
  else if (nameLower.includes('mason')) emoji = '🧱';
  else if (nameLower.includes('weld')) emoji = '🔥';
  else if (nameLower.includes('helper')) emoji = '🤝';
  else if (nameLower.includes('labor')) emoji = '💪';

  // Determine styling classes
  const markerColors = isLeader
    ? 'from-violet-600 to-purple-700 shadow-purple-500/20'
    : 'from-blue-600 to-indigo-700 shadow-blue-500/20';

  const glowRingColor = isHovered
    ? 'bg-cyan-400'
    : isLeader
    ? 'bg-purple-500/50'
    : 'bg-blue-500/50';

  return (
    <div className={`relative transition-all duration-300 ${isHovered ? 'scale-125 z-[999]' : 'scale-100 z-10'}`}>
      {/* Pulse ring */}
      <div className={`absolute -inset-3 rounded-full blur-md opacity-70 animate-pulse ${glowRingColor}`} />
      
      {/* Main Pin Body */}
      <div 
        className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-br ${markerColors} text-white shadow-xl border-2 transition-all duration-300 ${
          isHovered ? 'border-cyan-300 scale-105' : 'border-white'
        }`}
      >
        <span className="text-base select-none">{emoji}</span>
        {isHovered && (
          <span className="text-[10px] font-black uppercase tracking-wider pr-1 animate-fade-in whitespace-nowrap">
            {worker.user.name.split(' ')[0]}
          </span>
        )}
      </div>

      {/* Online indicator dot */}
      {worker.isAvailable && (
        <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
        </span>
      )}
    </div>
  );
}

// Cluster Pin Component
function ClusterPin({ count }: { count: number }) {
  return (
    <div className="relative cursor-pointer scale-100 hover:scale-110 transition-all z-20">
      <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 blur-md opacity-40 animate-pulse" />
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-black text-xs shadow-lg border-2 border-white">
        {count}
      </div>
    </div>
  );
}

export default function LiveMapView({ workers, center, onWorkerClick, onMapClick, hoveredWorkerId }: LiveMapViewProps) {
  const [activeWorker, setActiveWorker] = useState<any>(null);
  const map = useMap();
  const [zoom, setZoom] = useState(14);

  // Monitor map zoom level to trigger clustering
  useEffect(() => {
    if (!map) return;
    const listener = map.addListener('zoom_changed', () => {
      setZoom(map.getZoom() || 14);
    });
    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, [map]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setActiveWorker(null);
    onMapClick(lat, lng);
  }, [onMapClick]);

  // Clustering logic based on Zoom level
  const getClusterThreshold = (currentZoom: number) => {
    if (currentZoom <= 8) return 0.25;
    if (currentZoom <= 10) return 0.12;
    if (currentZoom <= 12) return 0.04;
    if (currentZoom <= 13) return 0.015;
    return 0.0; // No clustering for zoom >= 14
  };

  const clusteredItems = useMemo(() => {
    const threshold = getClusterThreshold(zoom);
    if (threshold === 0) return workers.map(w => ({ ...w, isCluster: false }));

    const items: any[] = [];
    const visited = new Set<string>();

    for (let i = 0; i < workers.length; i++) {
      const w1 = workers[i];
      if (visited.has(w1.id)) continue;

      const clusterMembers = [w1];
      visited.add(w1.id);

      const lat1 = w1.currentLat || 26.1456;
      const lng1 = w1.currentLng || 91.6789;

      for (let j = i + 1; j < workers.length; j++) {
        const w2 = workers[j];
        if (visited.has(w2.id)) continue;

        const lat2 = w2.currentLat || 26.1456;
        const lng2 = w2.currentLng || 91.6789;

        const dist = Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2));
        if (dist < threshold) {
          clusterMembers.push(w2);
          visited.add(w2.id);
        }
      }

      if (clusterMembers.length > 1) {
        const avgLat = clusterMembers.reduce((sum, m) => sum + (m.currentLat || 26.1456), 0) / clusterMembers.length;
        const avgLng = clusterMembers.reduce((sum, m) => sum + (m.currentLng || 91.6789), 0) / clusterMembers.length;

        items.push({
          isCluster: true,
          id: `cluster-${w1.id}`,
          currentLat: avgLat,
          currentLng: avgLng,
          count: clusterMembers.length,
          workers: clusterMembers
        });
      } else {
        items.push({
          ...w1,
          isCluster: false
        });
      }
    }

    return items;
  }, [workers, zoom]);

  const handleClusterClick = (cluster: any) => {
    if (map) {
      map.setZoom(zoom + 2);
      map.panTo({ lat: cluster.currentLat, lng: cluster.currentLng });
    }
  };

  if (!API_KEY) {
    return <MapView workers={workers} center={center} onWorkerClick={onWorkerClick} onMapClick={onMapClick} />;
  }

  return (
    <div className="w-full h-full relative z-10">
      <APIProvider apiKey={API_KEY}>
        <Map
          defaultCenter={center}
          defaultZoom={14}
          mapId="8e0a97af9386fef" // Vis.gl support Advanced Markers
          gestureHandling="greedy"
          disableDefaultUI={true} // Cleaner map interface
          styles={MAP_STYLES}
          style={{ width: '100%', height: '100%' }}
        >
          <MapController center={center} />
          <MapClickHandler onClick={handleMapClick} />

          {/* Premium Glowing Coverage Circle overlay at search center */}
          <AdvancedMarker position={center}>
            <div className="relative pointer-events-none">
              {/* Core pulse */}
              <div className="w-64 h-64 rounded-full border-2 border-blue-500/20 bg-blue-500/5 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              {/* Secondary faint outline ring */}
              <div className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/10 pointer-events-none" />
            </div>
          </AdvancedMarker>

          {/* Markers (Clusters & Workers) */}
          {clusteredItems.map((item) => {
            if (item.isCluster) {
              return (
                <AdvancedMarker
                  key={item.id}
                  position={{
                    lat: item.currentLat,
                    lng: item.currentLng,
                  }}
                  onClick={() => handleClusterClick(item)}
                >
                  <ClusterPin count={item.count} />
                </AdvancedMarker>
              );
            }

            return (
              <AdvancedMarker
                key={item.id}
                position={{
                  lat: item.currentLat || 26.1456,
                  lng: item.currentLng || 91.6789,
                }}
                onClick={() => {
                  setActiveWorker(item);
                  onWorkerClick(item);
                }}
              >
                <WorkerPin worker={item} isHovered={hoveredWorkerId === item.id} />
              </AdvancedMarker>
            );
          })}

          {/* User Location Navigation/GPS center Pin */}
          <AdvancedMarker position={center}>
            <div className="relative cursor-default pointer-events-none">
              <div className="w-8 h-8 rounded-full bg-cyan-500/25 border-2 border-cyan-500 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-pulse">
                <div className="w-3.5 h-3.5 rounded-full bg-cyan-600 border border-white" />
              </div>
            </div>
          </AdvancedMarker>

          {/* Custom InfoWindow popup for active worker */}
          {activeWorker && (
            <InfoWindow
              position={{
                lat: activeWorker.currentLat || 26.1456,
                lng: activeWorker.currentLng || 91.6789,
              }}
              onCloseClick={() => setActiveWorker(null)}
            >
              <div className="p-3 text-center min-w-[200px] font-poppins">
                <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto mb-2 overflow-hidden border border-slate-200">
                  <img
                    src={activeWorker.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeWorker.user.name)}&background=2563EB&color=fff&bold=true`}
                    alt={activeWorker.user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-extrabold text-sm text-slate-800 uppercase tracking-tight">
                  {activeWorker.user.name}
                </p>
                <p className="text-[10px] font-bold text-blue-600 mb-3 uppercase tracking-widest">
                  {activeWorker.skills?.map((s: any) => s.skill.name).join(' • ')}
                </p>
                <button
                  onClick={() => onWorkerClick(activeWorker)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-blue-500/25 active:scale-95"
                >
                  View Details
                </button>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      <div className="absolute right-6 bottom-6 px-4 py-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full text-[9px] font-black text-slate-500 tracking-wider uppercase z-30 shadow-md flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        Live Tracking Enabled
      </div>
    </div>
  );
}
