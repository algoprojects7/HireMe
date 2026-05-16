'use client';

import React from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function TestMapPage() {
  const center = { lat: 26.1445, lng: 91.7362 }; // Jalukbari

  return (
    <div className="w-full h-screen p-8 bg-zinc-50 flex flex-col items-center">
      <div className="max-w-4xl w-full flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Google Maps Integration Test</h1>
          <p className="text-zinc-500">This page is dedicated to testing the Google Maps JavaScript API connectivity.</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-xl overflow-hidden min-h-[600px] relative">
          {!API_KEY ? (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-600 p-8 text-center font-medium">
              Error: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing from environment variables.
            </div>
          ) : (
            <APIProvider apiKey={API_KEY}>
              <Map
                defaultCenter={center}
                defaultZoom={14}
                gestureHandling="greedy"
                disableDefaultUI={false}
                style={{ width: '100%', height: '600px' }}
              />
            </APIProvider>
          )}
        </div>

        <div className="mt-4 p-6 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-800">
          <h3 className="font-bold mb-2">Technical Note:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>If you see a grey map with <strong>"For development purposes only"</strong>, your API Key is working but needs a valid billing account in Google Cloud.</li>
            <li>If the map is blank, check the browser console (F12) for <strong>InvalidKeyMapError</strong>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
