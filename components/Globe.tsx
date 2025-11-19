import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GDPData, GeoJSONCollection, GeoJSONFeature } from '../types';

interface GlobeProps {
  data: GDPData[];
  onSelectCountry: (country: GDPData | null) => void;
  selectedCountry: GDPData | null;
}

const Globe: React.FC<GlobeProps> = ({ data, onSelectCountry, selectedCountry }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [geoData, setGeoData] = useState<GeoJSONCollection | null>(null);
  
  // Configuration
  const rotationSpeed = 0.15; // Slightly slower for better control

  // State for interaction
  const [rotation, setRotation] = useState<[number, number, number]>([0, -30, 0]);
  const isDragging = useRef(false);
  const isHovering = useRef(false);
  const lastPos = useRef<[number, number]>([0, 0]);
  const mousePos = useRef<[number, number]>([0, 0]); // Track mouse for tooltip

  // Load GeoJSON
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
        const json = await res.json();
        setGeoData(json);
      } catch (e) {
        console.error("Failed to load map data", e);
      }
    };
    loadData();
  }, []);

  // Render Globe
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !geoData) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext('2d');
    if (!context) return;
    context.scale(dpr, dpr);

    const sphereRadius = Math.min(width, height) / 2.5;

    // Base Projection
    const projection = d3.geoOrthographic()
      .scale(sphereRadius)
      .translate([width / 2, height / 2])
      .rotate(rotation);

    const path = d3.geoPath(projection, context);

    // Pop-up Projection (Larger scale to simulate floating up)
    const popProjection = d3.geoOrthographic()
      .scale(sphereRadius * 1.05) // 5% larger for the pop effect
      .translate([width / 2, height / 2])
      .rotate(rotation);

    const popPath = d3.geoPath(popProjection, context);

    const maxGDP = Math.max(...data.map(d => d.gdpTrillions), 10);
    const colorScale = d3.scaleSequential(d3.interpolateInferno)
      .domain([0, maxGDP * 0.8]); 

    const render = () => {
      context.clearRect(0, 0, width, height);

      // 1. Water / Background sphere
      context.beginPath();
      path({ type: 'Sphere' });
      context.fillStyle = '#0f172a'; 
      context.fill();
      
      // 2. Grid
      context.beginPath();
      path(d3.geoGraticule10());
      context.strokeStyle = '#1e293b';
      context.lineWidth = 0.5;
      context.stroke();

      // 3. Render All Countries (Base Layer)
      geoData.features.forEach((feature: GeoJSONFeature) => {
        const countryCode = feature.id;
        // Skip drawing the selected country on the base layer to prevent z-fighting/clipping visuals
        if (selectedCountry?.isoCode === countryCode) return;

        const countryData = data.find(d => d.isoCode === countryCode);

        context.beginPath();
        path(feature);

        if (countryData) {
          context.fillStyle = colorScale(countryData.gdpTrillions);
        } else {
          context.fillStyle = '#334155'; 
        }
        
        context.fill();
        context.strokeStyle = '#0f172a';
        context.lineWidth = 0.5;
        context.stroke();
      });

      // 4. Atmosphere Glow
      const gradient = context.createRadialGradient(
        width / 2, height / 2, sphereRadius,
        width / 2, height / 2, sphereRadius * 1.2
      );
      gradient.addColorStop(0, 'rgba(56, 189, 248, 0.1)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      // 5. Render Selected Country "Floating" on top
      if (selectedCountry) {
        const feature = geoData.features.find(f => f.id === selectedCountry.isoCode);
        if (feature) {
          // Add Drop Shadow for depth
          context.save();
          context.shadowColor = 'rgba(0, 0, 0, 0.8)';
          context.shadowBlur = 20;
          context.shadowOffsetX = 0;
          context.shadowOffsetY = 0;

          context.beginPath();
          // Use popPath (scaled up) for the floating effect
          popPath(feature); 
          
          context.fillStyle = '#38bdf8'; // Bright Blue Highlight
          context.fill();
          
          context.lineWidth = 2;
          context.strokeStyle = '#ffffff';
          context.stroke();
          
          context.restore();
        }
      }

      // 6. Draw Cursor Tooltip if hovering
      if (isHovering.current && selectedCountry) {
         // Simple tooltip near mouse
         const [mx, my] = mousePos.current;
         const padding = 8;
         const text = `${selectedCountry.countryName}`;
         const metrics = context.measureText(text);
         const tw = metrics.width;
         
         context.save();
         context.font = "12px sans-serif";
         context.fillStyle = "rgba(15, 23, 42, 0.9)";
         context.strokeStyle = "rgba(56, 189, 248, 0.5)";
         
         // Draw tooltip background
         context.beginPath();
         context.roundRect(mx + 15, my + 15, tw + padding * 2, 24, 4);
         context.fill();
         context.stroke();
         
         // Draw text
         context.fillStyle = "#ffffff";
         context.fillText(text, mx + 15 + padding, my + 15 + 16);
         context.restore();
      }
    };

    render();

  }, [geoData, data, rotation, selectedCountry]);


  // Animation Loop
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      // Rotate if not dragging and not hovering over the globe
      if (!isDragging.current && !isHovering.current) {
        setRotation(r => [r[0] + rotationSpeed, r[1], r[2]]);
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []); 


  // Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastPos.current = [e.clientX, e.clientY];
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Update mouse position for tooltip
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mousePos.current = [e.clientX - rect.left, e.clientY - rect.top];
    }

    // 1. Rotation Dragging
    if (isDragging.current) {
      const [x, y] = [e.clientX, e.clientY];
      const [dx, dy] = [x - lastPos.current[0], y - lastPos.current[1]];
      
      const sensitivity = 0.25;
      setRotation(r => [r[0] + dx * sensitivity, r[1] - dy * sensitivity, r[2]]);
      lastPos.current = [x, y];
      return;
    }

    // 2. Hover Detection
    isHovering.current = true;

    if (!containerRef.current || !geoData) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    const projection = d3.geoOrthographic()
      .scale(Math.min(width, height) / 2.5)
      .translate([width / 2, height / 2])
      .rotate(rotation);

    // Calculate mouse position relative to the container
    const [mouseX, mouseY] = mousePos.current;

    // Invert pixel coordinates to [longitude, latitude]
    const invert = projection.invert([mouseX, mouseY]);

    if (invert) {
      const [lng, lat] = invert;
      
      // Find the country feature containing this coordinate
      // geoContains is computationally intensive for complex polygons, but usually ok for world map interaction
      const found = geoData.features.find(feature => d3.geoContains(feature, [lng, lat]));

      if (found) {
        const country = data.find(c => c.isoCode === found.id);
        if (country && country.isoCode !== selectedCountry?.isoCode) {
          onSelectCountry(country);
        }
      } else {
         // Optional: Deselect if clicking/hovering ocean? 
         // For now, keeping last selection is often better UX to read data.
      }
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };
  
  const handleMouseEnter = () => {
    isHovering.current = true;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    isHovering.current = false;
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative cursor-move active:cursor-grabbing overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <canvas ref={canvasRef} className="absolute top-0 left-0 pointer-events-none" />
      <div className="absolute bottom-4 left-4 text-slate-500 text-xs pointer-events-none select-none bg-slate-900/50 px-2 py-1 rounded backdrop-blur-sm border border-slate-700/50">
        <p>Hover to view details • Drag to rotate</p>
      </div>
    </div>
  );
};

export default Globe;