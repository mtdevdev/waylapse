/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef } from 'react';
import { RouteDetails } from '../types';
import * as L from 'leaflet';

interface Props {
  route: RouteDetails | null;
}

const MapBackground: React.FC<Props> = ({ route }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
          const map = L.map(mapContainerRef.current, {
              zoomControl: false,
              attributionControl: false,
              zoomAnimation: true,
              fadeAnimation: true,
              dragging: false,
              keyboard: false,
              scrollWheelZoom: false,
              center: [34.0522, -118.2437], // Default LA
              zoom: 12
          });

          // Use CartoDB Positron for the light editorial background
          L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
              opacity: 0.6
          }).addTo(map);

          mapInstanceRef.current = map;
      }

      return () => {
          mapInstanceRef.current?.remove();
          mapInstanceRef.current = null;
      };
  }, []);

  useEffect(() => {
      if (!route || !mapInstanceRef.current) return;

      const map = mapInstanceRef.current;
      const path = route.pathCoordinates;

      if (routeLayerRef.current) routeLayerRef.current.remove();

      routeLayerRef.current = L.polyline(path, {
          color: '#1A1A1A',
          weight: 4,
          opacity: 0.8
      }).addTo(map);

      map.fitBounds(L.latLngBounds(path), { padding: [50, 50] });

  }, [route]);

  return (
    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-multiply grayscale contrast-125">
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* Overlay gradient to fade edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-editorial-100 via-transparent to-editorial-100"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-editorial-100 via-transparent to-editorial-100"></div>
    </div>
  );
};

export default MapBackground;