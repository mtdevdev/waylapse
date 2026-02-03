
# waylapse

<img src="github/waylapse_banner.png" alt="waylapse_banner"/>

<div align="center">
  <h3>Cinematic Route Visualization</h3>
  <p>
    A cinematic route visualization tool built with React, Leaflet, and Tailwind CSS.
  </p>
  
  <a href="https://vercel.com">
    <img src="https://img.shields.io/badge/Deployment-Vercel-000000?style=for-the-badge&logo=vercel" alt="Vercel" />
  </a>
  <a href="https://react.dev">
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  </a>
  <a href="https://tailwindcss.com">
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
  </a>
</div>

<br />

## Overview

**Waylapse** is a web application designed to create aesthetically pleasing, animated visualizations of travel routes. Unlike standard navigation apps, Waylapse focuses on the *presentation* of the journey. It uses algorithmic camera control to create cinematic flyovers, smooth path following, and stylized statistical overlays, making it perfect for content creators, travel vloggers, or anyone who wants to visualize a trip.

The application is fully client-side and deployed on **Vercel**.

## ✨ Key Features

### 🎥 Cinematic Visualization
*   **Smart Camera Systems:** Choose from multiple camera behaviors:
    *   `Cinematic`: Dynamic zoom based on speed and turn curvature.
    *   `Focus`: Tight lock on the traveler.
    *   `Glide`: Smooth, medium-altitude following.
    *   `Takeoff/Landing`: Gradual altitude changes.
    *   `Overview`: Static full-route view.
*   **Intro Sequences:** Automated "TV-style" intro sequences that pan from origin to destination before the journey begins.

### 🎨 Deep Customization
*   **Map Styling:** Adjust map brightness, contrast, and toggle tile visibility for a minimalist "dark mode" look.
*   **Path Styling:** Customize route line width and neon colors.
*   **Stats Overlay:** toggleable display of distance, time, and location labels.

### 📱 Social Mode
Designed for screen recording and sharing:
*   **Identity:** Add a custom `@username` handle and profile picture.
*   **Audio:** Upload custom audio tracks that play in sync with the visualization, complete with a "Now Playing" ticker.
*   **Clean UI:** Controls auto-hide for a distraction-free recording experience.

### 🌍 Global Support
*   **Search:** Integrated global location search using OpenStreetMap (Nominatim).
*   **Routing:** Real-time routing via OSRM (Open Source Routing Machine).
*   **i18n:** Built-in support for English (EN) and Portuguese (PT-BR).

## 🛠️ Tech Stack

*   **Frontend Framework:** React 19 (Vite)
*   **Styling:** Tailwind CSS
*   **Maps & Rendering:** Leaflet.js
*   **Icons:** Lucide React
*   **Typography:** Montserrat & Inter
*   **APIs:**
    *   Nominatim (Geocoding)
    *   OSRM (Routing)

## 🚀 Getting Started

To run this project locally:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/waylapse.git
    cd waylapse
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  Open http://localhost:3000 in your browser.

## ⚙️ Configuration

The app features a robust settings panel accessible via the UI:

| Category | Options | Description |
| :--- | :--- | :--- |
| **Motion** | Camera Mode, Duration, Intro Speed | Control how the camera moves and how long the animation takes. |
| **Style** | Map Tiles, Brightness, Line Color | Adjust the visual fidelity of the map. |
| **Social** | Handle, Avatar, Music | Configure overlays for social media sharing. |

## 📄 License

This project is licensed under the Apache 2.0 License.

---

<div align="center">
  <sub>Built with ❤️ using React and OpenStreetMap data.</sub>
</div>
