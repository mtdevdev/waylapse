<div align="center">

  <img src="github/waylapse_banner.png" alt="waylapse_banner"/>
  
  <p>
    A cinematic route visualization tool built with React, Leaflet, and Tailwind CSS.
  </p>
  
  <p>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0-blue?style=flat-square" alt="License: GPL-3.0"></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" /></a>
    <img src="https://img.shields.io/badge/PWA-Supported-orange?style=flat-square" alt="PWA" />
  </p>
</div>

<hr>

**Waylapse** is a browser-based application that creates animated, cinematic visualizations of travel routes. Designed for content creators and travel logging, it uses algorithmic camera controls, smooth path tracking, and customizable statistical overlays to showcase journeys dynamically.

## Features

### Camera Controls & Cinematic Rendering
* **Multiple Camera Modes:** 
  * `Cinematic`: Dynamic zoom based on current speed and route curvature.
  * `Focus`: Locked tracking on the traveler marker.
  * `Glide`: Medium-altitude path following.
  * `Takeoff/Landing`: Automated altitude changes at the start and end.
  * `Overview`: Static full-route view.
  * `High Altitude`: Fixed high-altitude overview.
  * `Low Pass`: Fixed low-altitude close-up tracking.
  * `Breathe`: Oscillating camera zoom effect.
* **Intro Sequences:** Automated panning transitions from origin to destination before starting the playback.

### Visual Customization
* **Map Rendering:** Adjust contrast, brightness, and toggle tile visibility for minimalist styles.
* **Route Customization:** Configure path stroke width and color configurations.
* **Overlays:** Toggleable displays showing distance, elapsed time, and active location coordinates.

### Media Integration
* **Social Overlays:** Add profile pictures and custom `@username` handles.
* **Audio Support:** Sync custom audio files with the visualization, displaying a "Now Playing" ticker.
* **Clean UI Mode:** Controls auto-hide to optimize screen recording layouts.

### Routing & Geocoding
* **Search:** Global location lookup powered by OpenStreetMap (Nominatim).
* **Route Calculation:** Real-time routing computations using OSRM (Open Source Routing Machine).
* **Localization:** Built-in translation layers for English (EN) and Portuguese (PT-BR).

## Tech Stack
* **Frontend:** React 18 (Vite)
* **PWA:** Progressive Web App integration (Vite PWA Plugin)
* **Styling:** Tailwind CSS
* **Map Engine:** Leaflet.js (React Leaflet)
* **Icons:** Lucide React
* **Data APIs:** Nominatim API (Geocoding), OSRM API (Routing)

## License
This project is licensed under the GNU General Public License v3.0 (GPL-3.0).
